import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminDeleteContact,
  adminImportProducts,
  adminLoad,
  adminLogBroadcast,
  adminSaveContacts,
  adminSaveRow,
  adminSaveSettings,
  adminUpload,
  adminUploadUrl,
} from "@/lib/plain.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  defaultSettings,
  ngn,
  usd,
  whatsappLink,
  type Collection,
  type GalleryItem,
  type Product,
  type SiteSettings,
} from "@/lib/site";
import { useStore } from "@/lib/store";


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — PLAIN Control Panel" },
      { name: "description", content: "Private control panel for the PLAIN store." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — PLAIN" },
      { property: "og:description", content: "Private control panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type OrderRow = {
  id: string;
  reference: string;
  customer_name: string;
  phone: string;
  items: unknown;
  total_usd: number;
  total_ngn: number;
  status: string;
  receipt_url: string | null;
  created_at: string;
};

type EventRow = { id: number; kind: string; label: string; created_at: string };

type ContactRow = {
  id: string;
  name: string;
  phone: string;
  source: string;
  subscribed: boolean;
  created_at: string;
};


const emptyProduct = (): Product => ({
  id: "",
  name: "",
  slug: "",
  category: "T-Shirts",
  description: "",
  price_usd: 18.75,
  vat_percent: 0,
  shipping_usd: 0,
  discount_percent: 0,
  images: [],
  video_url: "",
  colors: [],
  sizes: ["S", "M", "L", "XL", "XXL"],
  badge: "",
  active: true,
  sort_order: 0,
});

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]!);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

function download(name: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const split = (line: string) =>
    (line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) ?? [])
      .map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'))
      .slice(0, -1);
  const head = split(lines[0]!);
  return lines.slice(1).map((l) => {
    const cells = split(l);
    const o: Record<string, string> = {};
    head.forEach((h, i) => (o[h] = cells[i] ?? ""));
    return o;
  });
}

function AdminPage() {
  const { refresh } = useStore();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);

  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [broadcast, setBroadcast] = useState("");
  const [lastPublished, setLastPublished] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);


  const load = async (pw: string) => {
    setBusy(true);
    try {
      const d = await adminLoad({ data: { password: pw } });
      setSettings({ ...defaultSettings, ...(d.settings as Partial<SiteSettings>) });
      setProducts(d.products as Product[]);
      setGallery(d.gallery as GalleryItem[]);
      setOrders(d.orders as OrderRow[]);
      setEvents(d.events as EventRow[]);
      setContacts((d.contacts ?? []) as ContactRow[]);

      setAuthed(true);
    } catch {
      toast.error("Incorrect password");
    }
    setBusy(false);
  };

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setSettings((s) => ({ ...s, [k]: v }));

  /**
   * Save changes = publish everything: settings, every product and every
   * gallery item are written to the live database in one go, then all open
   * storefronts are told to refetch.
   */
  const saveSettings = async () => {
    setBusy(true);
    try {
      await adminSaveSettings({
        data: { password, value: settings as unknown as Record<string, unknown> },
      });
      for (const p of products) {
        await adminSaveRow({
          data: {
            password,
            table: "products",
            action: "upsert",
            row: p as unknown as Record<string, unknown>,
          },
        });
      }
      for (const g of gallery) {
        await adminSaveRow({
          data: {
            password,
            table: "gallery",
            action: "upsert",
            row: g as unknown as Record<string, unknown>,
          },
        });
      }
      refresh();
      setLastPublished(new Date().toLocaleTimeString());
      try {
        localStorage.setItem("plain.published", String(Date.now()));
      } catch {
        /* ignore */
      }
      toast.success("Published — everything is live");
    } catch {
      toast.error("Publish failed");
    }
    setBusy(false);
  };

  const saveRow = async (
    table: "products" | "gallery" | "orders",
    row: Record<string, unknown>,
    action: "upsert" | "delete" = "upsert",
  ) => {
    setBusy(true);
    try {
      await adminSaveRow({ data: { password, table, action, row } });
      await load(password);
      refresh();
      toast.success("Saved");
    } catch {
      toast.error("Save failed");
    }
    setBusy(false);
  };

  const upload = async (file: File): Promise<string | null> => {
    if (file.size > 8_000_000) {
      toast.error("File must be under 8MB");
      return null;
    }
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = () => rej(new Error("read failed"));
      r.readAsDataURL(file);
    });
    try {
      const { url } = await adminUpload({ data: { password, filename: file.name, dataUrl } });
      return url;
    } catch {
      toast.error("Upload failed");
      return null;
    }
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("video/")) {
      toast.error("Choose a video file (MP4, WebM, MOV, OGG)");
      return null;
    }
    if (file.size > 50_000_000) {
      toast.error("Video must be under 50MB — host bigger files on YouTube and paste the link");
      return null;
    }
    try {
      const { path, token, url } = await adminUploadUrl({
        data: { password, filename: file.name },
      });
      const { error } = await supabase.storage
        .from("media")
        .uploadToSignedUrl(path, token, file, { contentType: file.type });
      if (error) throw error;
      return url;
    } catch {
      toast.error("Video upload failed");
      return null;
    }
  };

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4">
        <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl float-slow" />
        <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-primary/30 blur-3xl float-slow" />
        <div className="relative w-full max-w-sm space-y-5 border border-white/10 bg-background/95 p-9 shadow-2xl rise-in">
          <div>
            <p className="font-accent text-[10px] text-accent">PLAIN</p>
            <h1 className="mt-2 font-display text-3xl">Control centre</h1>
            <p className="mt-2 text-xs text-muted-foreground">
              Enter your admin password to manage the live store.
            </p>
          </div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void load(password)}
          />
          <Button
            className="h-11 w-full font-accent text-[11px]"
            disabled={busy}
            onClick={() => void load(password)}
          >
            {busy ? "Checking…" : "Enter"}
          </Button>
        </div>
      </div>
    );
  }

  const views = events.filter((e) => e.kind === "view").length;
  const clicks = events.filter((e) => e.kind === "click").length;
  const approved = orders.filter((o) => o.status === "approved");
  const revenue = approved.reduce((s, o) => s + Number(o.total_usd), 0);

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8">
          <div>
            <p className="font-accent text-[10px] text-accent">PLAIN</p>
            <h1 className="font-display text-2xl leading-tight md:text-3xl">Control centre</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-accent text-[10px] text-muted-foreground sm:inline">
              {lastPublished ? `Published ${lastPublished}` : "Unsaved edits stay local"}
            </span>
            <Button
              variant="outline"
              className="font-accent text-[10px]"
              disabled={busy}
              onClick={() => void load(password)}
            >
              Reload
            </Button>
            <Button
              className="font-accent text-[10px]"
              disabled={busy}
              onClick={() => void saveSettings()}
            >
              {busy ? "Publishing…" : "Save changes"}
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <Tabs defaultValue="dashboard">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-card p-1">
            {[
              ["dashboard", "Dashboard"],
              ["landing", "Landing"],
              ["products", "Products"],
              ["gallery", "Gallery"],
              ["pages", "Pages"],
              ["theme", "Theme"],
              ["collection", "Collection"],
              ["newsletter", "Newsletter"],
              ["orders", "Orders"],
            ].map(([v, l]) => (
              <TabsTrigger
                key={v}
                value={v!}
                className="font-accent text-[10px] data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { l: "Page views", v: views },
                { l: "Clicks", v: clicks },
                { l: "Orders", v: orders.length },
                { l: "Approved revenue", v: usd(revenue) },
              ].map((c) => (
                <div key={c.l} className="border bg-card p-5">
                  <p className="font-accent text-[10px] text-muted-foreground">{c.l}</p>
                  <p className="mt-2 font-display text-3xl">{c.v}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="font-accent text-[10px]"
                onClick={() =>
                  download("orders.csv", toCsv(orders as unknown as Record<string, unknown>[]))
                }
              >
                Export orders CSV
              </Button>
              <Button
                variant="outline"
                className="font-accent text-[10px]"
                onClick={() =>
                  download("products.csv", toCsv(products as unknown as Record<string, unknown>[]))
                }
              >
                Export products CSV
              </Button>
              <Button
                variant="outline"
                className="font-accent text-[10px]"
                onClick={() =>
                  download("analytics.csv", toCsv(events as unknown as Record<string, unknown>[]))
                }
              >
                Export analytics CSV
              </Button>
            </div>
            <div className="space-y-2 border bg-card p-5">
              <Label className="font-accent text-[10px]">Google Sheet webhook URL</Label>
              <Input
                value={settings.sheetWebhookUrl ?? ""}
                placeholder="https://script.google.com/macros/s/.../exec"
                onChange={(e) => set("sheetWebhookUrl", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Deploy a Google Apps Script web app that appends the posted JSON to your sheet,
                then paste its URL here. Orders, products, gallery and settings changes are pushed
                automatically.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="landing" className="mt-6 space-y-4">
            <div className="grid gap-4 border bg-card p-5 sm:grid-cols-2">
              <Field label="Brand" v={settings.brand} on={(v) => set("brand", v)} />
              <Field label="Tagline" v={settings.tagline} on={(v) => set("tagline", v)} />
              <Field label="Hero kicker" v={settings.heroKicker} on={(v) => set("heroKicker", v)} />
              <Field label="Hero title" v={settings.heroTitle} on={(v) => set("heroTitle", v)} />
              <Field
                label="Hero subtitle"
                v={settings.heroSubtitle}
                on={(v) => set("heroSubtitle", v)}
              />
              <Field label="Hero CTA" v={settings.heroCta} on={(v) => set("heroCta", v)} />
              <Field label="WhatsApp number" v={settings.whatsapp} on={(v) => set("whatsapp", v)} />
              <div>
                <Label className="font-accent text-[10px]">USD → NGN rate</Label>
                <Input
                  type="number"
                  value={settings.usdToNgn}
                  onChange={(e) => set("usdToNgn", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-3 border bg-card p-5">
              <p className="font-accent text-[10px]">Hero slides</p>
              <div className="flex flex-wrap gap-3">
                {settings.heroSlides.map((s, i) => (
                  <div key={s + i} className="relative">
                    <img src={s} alt="" className="h-24 w-20 object-cover" />
                    <button
                      className="absolute right-0 top-0 bg-ink px-1 text-[10px] text-ink-foreground"
                      onClick={() =>
                        set(
                          "heroSlides",
                          settings.heroSlides.filter((_, x) => x !== i),
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await upload(f);
                  if (url) set("heroSlides", [...settings.heroSlides, url]);
                }}
              />
            </div>

            <div className="space-y-3 border bg-card p-5">
              <div className="flex items-center gap-3">
                <Switch
                  checked={settings.adEnabled}
                  onCheckedChange={(v) => set("adEnabled", v)}
                />
                <Label className="font-accent text-[10px]">Show ads banner</Label>
              </div>
              <Field label="Ad text" v={settings.adText} on={(v) => set("adText", v)} />
              <Field
                label="Ad subtext"
                v={settings.adSubtext ?? ""}
                on={(v) => set("adSubtext", v)}
              />
              <Field label="Ad button label" v={settings.adCta ?? ""} on={(v) => set("adCta", v)} />
              <Field label="Ad link" v={settings.adLink} on={(v) => set("adLink", v)} />

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await upload(f);
                  if (url) set("adImage", url);
                }}
              />
            </div>

            <div className="space-y-3 border bg-card p-5">
              <p className="font-accent text-[10px]">Logo</p>
              {settings.logoUrl && (
                <img src={settings.logoUrl} alt="Logo" className="h-14 w-14 object-cover" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await upload(f);
                  if (url) set("logoUrl", url);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="theme" className="mt-6 space-y-4">
            <div className="grid gap-4 border bg-card p-5 sm:grid-cols-3">
              {(
                [
                  ["Primary colour", "primaryColor"],
                  ["Accent colour", "accentColor"],
                  ["Ink / dark colour", "inkColor"],
                ] as const
              ).map(([label, key]) => (
                <div key={key} className="space-y-2">
                  <Label className="font-accent text-[10px]">{label}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={label}
                      value={settings[key] || "#000000"}
                      onChange={(e) => set(key, e.target.value)}
                      className="h-10 w-14 cursor-pointer border bg-background"
                    />
                    <Input value={settings[key]} onChange={(e) => set(key, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border bg-card p-5">
              <p className="w-full font-accent text-[10px]">Quick palettes</p>
              {[
                { n: "Blue & Gold", p: "#12235A", a: "#C8A87C", i: "#0A1128" },
                { n: "Monochrome", p: "#141414", a: "#8A8A8A", i: "#0A0A0A" },
                { n: "Forest", p: "#14452F", a: "#D2B48C", i: "#0B241A" },
                { n: "Wine", p: "#5B1A2B", a: "#E0B973", i: "#1A0A10" },
              ].map((t) => (
                <button
                  key={t.n}
                  className="flex items-center gap-2 border px-3 py-2 font-accent text-[10px] transition-transform hover:-translate-y-0.5"
                  onClick={() => {
                    set("primaryColor", t.p);
                    set("accentColor", t.a);
                    set("inkColor", t.i);
                  }}
                >
                  <span className="h-4 w-4" style={{ background: t.p }} />
                  <span className="h-4 w-4" style={{ background: t.a }} />
                  {t.n}
                </button>
              ))}
              <p className="w-full text-xs text-muted-foreground">
                Colours apply live across light and dark mode after you press Save changes.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="collection" className="mt-6 space-y-4">
            <div className="grid gap-4 border bg-card p-5 sm:grid-cols-2">
              <Field
                label="Collection kicker"
                v={settings.collectionSubtitle}
                on={(v) => set("collectionSubtitle", v)}
              />
              <Field
                label="Collection title"
                v={settings.collectionTitle}
                on={(v) => set("collectionTitle", v)}
              />
              <div className="sm:col-span-2">
                <Label className="font-accent text-[10px]">Collection description</Label>
                <Textarea
                  rows={4}
                  value={settings.collectionBody}
                  onChange={(e) => set("collectionBody", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="font-accent text-[10px]">Collection image</Label>
                {settings.collectionImage && (
                  <img src={settings.collectionImage} alt="" className="h-28 w-24 object-cover" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await upload(f);
                    if (url) set("collectionImage", url);
                  }}
                />
              </div>
            </div>

            <div className="space-y-4 border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="font-accent text-[10px]">Designs in this collection</p>
                <Button
                  variant="outline"
                  className="font-accent text-[10px]"
                  onClick={() =>
                    set("collections", [
                      ...settings.collections,
                      { title: "", description: "", image: "" },
                    ])
                  }
                >
                  Add design
                </Button>
              </div>
              {settings.collections.map((c, i) => {
                const upd = (patch: Partial<Collection>) =>
                  set(
                    "collections",
                    settings.collections.map((x, xi) => (xi === i ? { ...x, ...patch } : x)),
                  );
                return (
                  <div key={i} className="grid gap-3 border p-4 sm:grid-cols-2">
                    <Field label="Title" v={c.title} on={(v) => upd({ title: v })} />
                    <Field
                      label="Description"
                      v={c.description}
                      on={(v) => upd({ description: v })}
                    />
                    <div className="space-y-2">
                      {c.image && <img src={c.image} alt="" className="h-24 w-20 object-cover" />}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await upload(f);
                          if (url) upd({ image: url });
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        className="font-accent text-[10px]"
                        onClick={() =>
                          set(
                            "collections",
                            settings.collections.filter((_, xi) => xi !== i),
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="newsletter" className="mt-6 space-y-4">
            <div className="space-y-3 border bg-card p-5">
              <p className="font-accent text-[10px]">
                Contacts ({contacts.length}) · selected {selected.length}
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center border bg-background px-4 py-2 font-accent text-[10px]">
                  Import contacts CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const rows = parseCsv(await f.text())
                        .map((r) => ({
                          name: r["name"] ?? "",
                          phone: r["phone"] ?? r["number"] ?? "",
                          tags: (r["tags"] ?? "").split("|").filter(Boolean),
                        }))
                        .filter((r) => r.phone);
                      try {
                        await adminSaveContacts({ data: { password, contacts: rows } });
                        await load(password);
                        toast.success(`Imported ${rows.length} contacts`);
                      } catch {
                        toast.error("Import failed");
                      }
                    }}
                  />
                </label>
                <Button
                  variant="outline"
                  className="font-accent text-[10px]"
                  onClick={() => setSelected(contacts.map((c) => c.id))}
                >
                  Select all
                </Button>
                <Button
                  variant="outline"
                  className="font-accent text-[10px]"
                  onClick={() => setSelected([])}
                >
                  Clear selection
                </Button>
                <Button
                  variant="outline"
                  className="font-accent text-[10px]"
                  onClick={() =>
                    download("contacts.csv", toCsv(contacts as unknown as Record<string, unknown>[]))
                  }
                >
                  Export CSV
                </Button>
              </div>

              <div className="max-h-72 overflow-auto border">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 border-b px-3 py-2 text-sm last:border-b-0"
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(c.id)}
                        onChange={(e) =>
                          setSelected((s) =>
                            e.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id),
                          )
                        }
                      />
                      <span>
                        {c.name || "Customer"}{" "}
                        <span className="text-muted-foreground">· {c.phone}</span>
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="font-accent text-[9px] text-muted-foreground">
                        {c.source}
                      </span>
                      <button
                        className="font-accent text-[10px] text-muted-foreground underline"
                        onClick={async () => {
                          await adminDeleteContact({ data: { password, id: c.id } });
                          await load(password);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground">
                    No contacts yet. Orders add customers automatically.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 border bg-card p-5">
              <Label className="font-accent text-[10px]">Broadcast message</Label>
              <Textarea
                rows={5}
                value={broadcast}
                placeholder="New drop is live. Shop the collection: https://plain-ng.lovable.app"
                onChange={(e) => setBroadcast(e.target.value)}
              />
              <Button
                className="font-accent text-[10px]"
                disabled={busy || !broadcast.trim() || selected.length === 0}
                onClick={async () => {
                  const list = contacts.filter(
                    (c) => selected.includes(c.id) && c.subscribed !== false,
                  );
                  try {
                    await adminLogBroadcast({
                      data: { password, message: broadcast, recipients: list.length },
                    });
                  } catch {
                    /* logging is best effort */
                  }
                  list.forEach((c, i) => {
                    setTimeout(
                      () => window.open(whatsappLink(c.phone, broadcast), "_blank", "noopener"),
                      i * 600,
                    );
                  });
                  toast.success(`Opening WhatsApp for ${list.length} contacts`);
                }}
              >
                Send WhatsApp broadcast
              </Button>
              <p className="text-xs text-muted-foreground">
                Each contact opens in a WhatsApp tab with your message pre-filled — allow pop-ups so
                every chat opens. Every broadcast is logged to your Google Sheet.
              </p>
            </div>
          </TabsContent>



          <TabsContent value="products" className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                className="font-accent text-[10px]"
                onClick={() => setEditing(emptyProduct())}
              >
                New product
              </Button>
              <label className="inline-flex cursor-pointer items-center border bg-background px-4 py-2 font-accent text-[10px]">
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const rows = parseCsv(await f.text()).map((r) => ({
                      name: r["name"] ?? "",
                      slug: r["slug"] || (r["name"] ?? "").toLowerCase().replace(/\s+/g, "-"),
                      category: r["category"] || "T-Shirts",
                      description: r["description"] ?? "",
                      price_usd: Number(r["price_usd"] ?? 0),
                      vat_percent: Number(r["vat_percent"] ?? 0),
                      shipping_usd: Number(r["shipping_usd"] ?? 0),
                      discount_percent: Number(r["discount_percent"] ?? 0),
                      images: (r["images"] ?? "").split("|").filter(Boolean),
                      colors: (r["colors"] ?? "").split("|").filter(Boolean),
                      sizes: (r["sizes"] ?? "S|M|L|XL|XXL").split("|").filter(Boolean),
                      video_url: r["video_url"] ?? "",
                      badge: r["badge"] ?? "",
                      active: r["active"] !== "false",
                    }));
                    try {
                      const res = await adminImportProducts({ data: { password, rows } });
                      toast.success(`Imported ${res.imported} products`);
                      await load(password);
                      refresh();
                    } catch {
                      toast.error("Import failed");
                    }
                  }}
                />
              </label>
            </div>

            {editing && (
              <div className="grid gap-4 border bg-card p-5 sm:grid-cols-2">
                <Field label="Name" v={editing.name} on={(v) => setEditing({ ...editing, name: v })} />
                <Field
                  label="Slug"
                  v={editing.slug ?? ""}
                  on={(v) => setEditing({ ...editing, slug: v })}
                />
                <Field
                  label="Category"
                  v={editing.category}
                  on={(v) => setEditing({ ...editing, category: v })}
                />
                <Field
                  label="Badge"
                  v={editing.badge ?? ""}
                  on={(v) => setEditing({ ...editing, badge: v })}
                />
                <NumField
                  label="Price USD"
                  v={editing.price_usd}
                  on={(v) => setEditing({ ...editing, price_usd: v })}
                />
                <NumField
                  label="VAT %"
                  v={editing.vat_percent}
                  on={(v) => setEditing({ ...editing, vat_percent: v })}
                />
                <NumField
                  label="Shipping USD"
                  v={editing.shipping_usd}
                  on={(v) => setEditing({ ...editing, shipping_usd: v })}
                />
                <NumField
                  label="Discount %"
                  v={editing.discount_percent}
                  on={(v) => setEditing({ ...editing, discount_percent: v })}
                />
                <Field
                  label="Colours (comma separated)"
                  v={editing.colors.join(", ")}
                  on={(v) =>
                    setEditing({
                      ...editing,
                      colors: v.split(",").map((x) => x.trim()).filter(Boolean),
                    })
                  }
                />
                <Field
                  label="Sizes (comma separated)"
                  v={editing.sizes.join(", ")}
                  on={(v) =>
                    setEditing({
                      ...editing,
                      sizes: v.split(",").map((x) => x.trim()).filter(Boolean),
                    })
                  }
                />
                <VideoField
                  label="Preview video (paste a link or upload a file)"
                  v={editing.video_url ?? ""}
                  on={(v) => setEditing({ ...editing, video_url: v })}
                  uploadVideo={uploadVideo}
                />
                <div className="sm:col-span-2">
                  <Label className="font-accent text-[10px]">Description</Label>
                  <Textarea
                    rows={4}
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label className="font-accent text-[10px]">Images</Label>
                  <div className="flex flex-wrap gap-2">
                    {editing.images.map((src, i) => (
                      <div key={src + i} className="relative">
                        <img src={src} alt="" className="h-20 w-16 object-cover" />
                        <button
                          className="absolute right-0 top-0 bg-ink px-1 text-[10px] text-ink-foreground"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              images: editing.images.filter((_, x) => x !== i),
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await upload(f);
                      if (url) setEditing({ ...editing, images: [...editing.images, url] });
                    }}
                  />
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <Button
                    className="font-accent text-[10px]"
                    disabled={busy}
                    onClick={async () => {
                      const row = {
                        ...editing,
                        slug: editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-"),
                      } as unknown as Record<string, unknown>;
                      if (!editing.id) delete row["id"];
                      await saveRow("products", row);
                      setEditing(null);
                    }}
                  >
                    Save product
                  </Button>
                  <Button
                    variant="outline"
                    className="font-accent text-[10px]"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="divide-y border bg-card">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3">
                  <img src={p.images[0]} alt="" className="h-14 w-12 object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="font-accent text-[10px] text-muted-foreground">
                      {usd(p.price_usd)} · {ngn(p.price_usd, settings.usdToNgn)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="font-accent text-[10px]"
                    onClick={() => setEditing(p)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="font-accent text-[10px]"
                    onClick={() => void saveRow("products", { id: p.id }, "delete")}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6 space-y-4">
            <div className="space-y-2 border bg-card p-5">
              <Field
                label="Gallery hero video URL"
                v={settings.galleryHeroVideo}
                on={(v) => set("galleryHeroVideo", v)}
              />
              <Field
                label="Gallery hero title"
                v={settings.galleryHeroTitle}
                on={(v) => set("galleryHeroTitle", v)}
              />
              <Field
                label="Gallery hero subtitle"
                v={settings.galleryHeroSubtitle}
                on={(v) => set("galleryHeroSubtitle", v)}
              />
            </div>

            <div className="border bg-card p-5">
              <Label className="font-accent text-[10px]">Add image</Label>
              <input
                type="file"
                accept="image/*"
                className="mt-2 block"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await upload(f);
                  if (url)
                    await saveRow("gallery", {
                      image_url: url,
                      title: "",
                      description: "",
                      sort_order: gallery.length,
                    });
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {gallery.map((g) => (
                <div key={g.id} className="space-y-2 border bg-card p-4">
                  <img src={g.image_url} alt="" className="aspect-[4/3] w-full object-cover" />
                  <Input
                    placeholder="Title"
                    defaultValue={g.title}
                    onBlur={(e) => void saveRow("gallery", { ...g, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Description"
                    defaultValue={g.description}
                    onBlur={(e) => void saveRow("gallery", { ...g, description: e.target.value })}
                  />
                  <Button
                    variant="outline"
                    className="font-accent text-[10px]"
                    onClick={() => void saveRow("gallery", { id: g.id }, "delete")}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pages" className="mt-6 space-y-4">
            <div className="space-y-3 border bg-card p-5">
              <p className="font-accent text-[10px] text-muted-foreground">About page</p>
              <Field label="Title" v={settings.aboutTitle} on={(v) => set("aboutTitle", v)} />
              <Textarea
                rows={6}
                value={settings.aboutBody}
                onChange={(e) => set("aboutBody", e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await upload(f);
                  if (url) set("aboutImage", url);
                }}
              />
            </div>
            <div className="space-y-3 border bg-card p-5">
              <p className="font-accent text-[10px] text-muted-foreground">Contact page</p>
              <Field label="Title" v={settings.contactTitle} on={(v) => set("contactTitle", v)} />
              <Textarea
                rows={4}
                value={settings.contactBody}
                onChange={(e) => set("contactBody", e.target.value)}
              />
              <Field label="Email" v={settings.contactEmail} on={(v) => set("contactEmail", v)} />
              <Field label="Phone" v={settings.contactPhone} on={(v) => set("contactPhone", v)} />
              <Field
                label="Address"
                v={settings.contactAddress}
                on={(v) => set("contactAddress", v)}
              />
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6 space-y-4">
            <div className="flex items-center gap-3 border bg-card p-4">
              <Switch
                checked={settings.requireReceipt}
                onCheckedChange={(v) => set("requireReceipt", v)}
              />
              <Label className="font-accent text-[10px]">Require receipt upload before approval</Label>
            </div>
            <div className="divide-y border bg-card">
              {orders.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="flex-1">
                    <p className="font-accent text-[10px] text-muted-foreground">{o.reference}</p>
                    <p className="text-sm font-medium">{o.customer_name || "Guest"}</p>
                    <p className="font-accent text-[10px] text-muted-foreground">
                      {o.phone} · {usd(Number(o.total_usd))} · {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="font-accent text-[10px] uppercase">{o.status}</span>
                  <label className="cursor-pointer border px-3 py-2 font-accent text-[10px]">
                    Receipt
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const url = await upload(f);
                        if (url) await saveRow("orders", { id: o.id, receipt_url: url });
                      }}
                    />
                  </label>
                  <Button
                    className="font-accent text-[10px]"
                    disabled={settings.requireReceipt && !o.receipt_url}
                    onClick={() => void saveRow("orders", { id: o.id, status: "approved" })}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="font-accent text-[10px]"
                    onClick={() => void saveRow("orders", { id: o.id, status: "declined" })}
                  >
                    Decline
                  </Button>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">No orders yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Field({
  label,
  v,
  on,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
}) {
  return (
    <div>
      <Label className="font-accent text-[10px]">{label}</Label>
      <Input value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}

function NumField({
  label,
  v,
  on,
}: {
  label: string;
  v: number;
  on: (v: number) => void;
}) {
  return (
    <div>
      <Label className="font-accent text-[10px]">{label}</Label>
      <Input type="number" value={v} onChange={(e) => on(Number(e.target.value))} />
    </div>
  );
}
