import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_PASSWORD, LOGO_URL, naira, PRICE, type Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "PLAIN CMS — Admin Portal" },
      { name: "description", content: "Password protected admin portal for the PLAIN store." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "PLAIN CMS — Admin Portal" },
      { property: "og:description", content: "Manage PLAIN products, orders and settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const CHART = Array.from({ length: 14 }).map((_, i) => ({
  day: `${i + 1}`,
  sales: Math.round(140000 + Math.sin(i / 2) * 90000 + i * 9000),
}));

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4 text-ink-foreground">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pw === ADMIN_PASSWORD) setAuthed(true);
            else toast.error("Incorrect password");
          }}
          className="w-full max-w-sm border border-white/10 p-8"
        >
          <img src={LOGO_URL} alt="PLAIN" className="h-9 w-9 invert" />
          <h1 className="mt-5 font-accent text-[11px]">Admin login</h1>
          <div className="mt-6 space-y-3">
            <Input
              placeholder="Username"
              defaultValue="admin"
              className="border-white/20 bg-white/5 text-ink-foreground"
            />
            <Input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              className="border-white/20 bg-white/5 text-ink-foreground"
            />
          </div>
          <Button variant="secondary" className="mt-6 w-full font-accent text-[11px]">
            Login
          </Button>
          <p className="mt-6 font-accent text-[9px] text-ink-foreground/40">PLAIN CMS v2.0</p>
        </form>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const { products, setProducts, orders, setOrderStatus } = useStore();
  const [sheetUrl, setSheetUrl] = useState("");
  const [receiptUpload, setReceiptUpload] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const revenue = useMemo(
    () => orders.filter((o) => o.status === "approved").reduce((s, o) => s + o.total, 0),
    [orders],
  );

  const stats = [
    { label: "Views", value: "12.4K" },
    { label: "Orders", value: String(orders.length) },
    { label: "Inquiries", value: "203" },
    { label: "CTR", value: "4.2%" },
    { label: "Revenue", value: naira(revenue) },
  ];

  const exportCsv = () => {
    const rows = [
      ["id", "name", "category", "price", "colors", "image"],
      ...products.map((p) => [
        p.id,
        p.name,
        p.category,
        String(p.price),
        p.colors.join("|"),
        p.images[0],
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "plain-products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const [, ...lines] = text.trim().split("\n");
    const parsed: Product[] = lines.map((line) => {
      const cells = line.split(",").map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"'));
      return {
        id: cells[0] || crypto.randomUUID(),
        name: cells[1] ?? "Untitled",
        category: cells[2] ?? "T-Shirts",
        price: Number(cells[3]) || PRICE,
        colors: (cells[4] ?? "Black").split("|"),
        images: [cells[5] ?? ""],
        description: "",
      };
    });
    setProducts(parsed);
    toast.success(`Imported ${parsed.length} products`);
  };

  const update = (id: string, patch: Partial<Product>) =>
    setProducts(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-ink px-4 py-4 text-ink-foreground md:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <img src={LOGO_URL} alt="" className="h-6 w-6 invert" />
          <span className="font-accent text-[11px]">PLAIN CMS</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="border bg-card p-5">
              <p className="font-accent text-[9px] text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-2xl">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border bg-card p-6">
          <p className="font-accent text-[10px]">Sales — last 14 days</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={10} />
                <RTooltip formatter={(v: number) => naira(v)} />
                <Bar dataKey="sales" fill="var(--accent)" radius={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Tabs defaultValue="products" className="mt-10">
          <TabsList className="font-accent text-[10px]">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={exportCsv} variant="outline" className="font-accent text-[10px]">
                Export CSV
              </Button>
              <Button
                onClick={() => fileRef.current?.click()}
                variant="outline"
                className="font-accent text-[10px]"
              >
                Import CSV
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                hidden
                onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
              />
              <Button
                className="font-accent text-[10px]"
                onClick={() =>
                  setProducts([
                    {
                      id: crypto.randomUUID(),
                      name: "New product",
                      category: "T-Shirts",
                      price: PRICE,
                      images: [products[0]?.images[0] ?? ""],
                      colors: ["Black"],
                      description: "",
                    },
                    ...products,
                  ])
                }
              >
                Add product
              </Button>
            </div>

            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center gap-3 border bg-card p-3">
                  <img src={p.images[0]} alt="" className="h-16 w-14 object-cover" />
                  <Input
                    value={p.name}
                    onChange={(e) => update(p.id, { name: e.target.value })}
                    className="w-56"
                  />
                  <Input
                    value={p.category}
                    onChange={(e) => update(p.id, { category: e.target.value })}
                    className="w-36"
                  />
                  <Input
                    type="number"
                    value={p.price}
                    onChange={(e) => update(p.id, { price: Number(e.target.value) })}
                    className="w-32"
                  />
                  <Button
                    variant="ghost"
                    className="ml-auto font-accent text-[10px] text-destructive"
                    onClick={() => setProducts(products.filter((x) => x.id !== p.id))}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6 space-y-3">
            {orders.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No orders yet. WhatsApp checkouts appear here once logged.
              </p>
            )}
            {orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center gap-4 border bg-card p-4">
                <div>
                  <p className="text-sm font-medium">{o.customer}</p>
                  <p className="font-accent text-[9px] text-muted-foreground">
                    {o.items} items · {naira(o.total)} · {o.status}
                  </p>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    className="font-accent text-[10px]"
                    onClick={() => setOrderStatus(o.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-accent text-[10px]"
                    onClick={() => setOrderStatus(o.id, "declined")}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3 border bg-card p-6">
              <Label className="font-accent text-[10px]">Google Sheet URL</Label>
              <Input
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/…"
              />
              <p className="text-xs text-muted-foreground">
                Paste your sheet link, then ask Lovable to connect Google Sheets so orders and
                products sync automatically.
              </p>
            </div>

            <div className="flex items-center justify-between border bg-card p-6">
              <div>
                <p className="font-accent text-[10px]">Receipt upload</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ask customers to upload payment proof at checkout.
                </p>
              </div>
              <Switch checked={receiptUpload} onCheckedChange={setReceiptUpload} />
            </div>

            <div className="space-y-3 border bg-card p-6 md:col-span-2">
              <Label className="font-accent text-[10px]">Hero / announcement copy</Label>
              <Textarea defaultValue="Essentials. Elevated." rows={3} />
              <Button
                className="font-accent text-[10px]"
                onClick={() => toast.success("Changes saved")}
              >
                Save changes
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
