import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_BANNERS,
  DEFAULT_PILLARS,
  type Banner,
  type Pillar,
  type Product,
  type SiteSettings,
} from "@/lib/site";

type Props = {
  settings: SiteSettings;
  set: <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => void;
  upload: (f: File) => Promise<string | null>;
  products: Product[];
};

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  return arr.map((x, k) => (k === i ? (arr[j] as T) : k === j ? (arr[i] as T) : x));
}

function Toggle({ label, checked, on }: { label: string; checked: boolean; on: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={on} />
      <span className="font-accent text-[10px]">{label}</span>
    </label>
  );
}

function F({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div>
      <Label className="font-accent text-[10px]">{label}</Label>
      <Input value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}

export function LandingSectionsEditor({ settings, set, upload, products }: Props) {
  const banners = settings.banners ?? DEFAULT_BANNERS;
  const pillars = settings.pillars ?? DEFAULT_PILLARS;
  const featured = settings.featuredIds ?? [];
  const setB = (b: Banner[]) => set("banners", b);
  const setP = (p: Pillar[]) => set("pillars", p);

  return (
    <div className="space-y-4">
      <div className="space-y-3 border bg-card p-5">
        <p className="font-accent text-[10px]">Hero second button</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="Label" v={settings.hero2Label ?? "Gallery"} on={(v) => set("hero2Label", v)} />
          <F label="Link" v={settings.hero2Link ?? "/gallery"} on={(v) => set("hero2Link", v)} />
        </div>
        <p className="text-[11px] text-muted-foreground">Leave the label empty to hide this button.</p>
      </div>

      <div className="space-y-3 border bg-card p-5">
        <Toggle label="Show category circles" checked={settings.showCategories ?? true} on={(v) => set("showCategories", v)} />
      </div>

      <div className="space-y-3 border bg-card p-5">
        <Toggle label="Show featured section" checked={settings.showFeatured ?? true} on={(v) => set("showFeatured", v)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="Featured title" v={settings.featuredTitle ?? "Featured"} on={(v) => set("featuredTitle", v)} />
          <F label="Featured subtitle" v={settings.featuredSubtitle ?? "The current favourites"} on={(v) => set("featuredSubtitle", v)} />
        </div>
        <p className="font-accent text-[10px]">Pick featured products (none picked = first 3)</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const on = featured.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => set("featuredIds", on ? featured.filter((x) => x !== p.id) : [...featured, p.id])}
                className={`flex items-center gap-2 border p-2 text-left text-xs transition-colors ${on ? "border-accent bg-accent/10" : "hover:border-foreground"}`}
              >
                {p.images[0] && <img src={p.images[0]} alt="" className="h-10 w-10 object-cover" />}
                <span className="flex-1 truncate">{p.name}</span>
                {on && <span className="font-accent text-[9px] text-accent">#{featured.indexOf(p.id) + 1}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Toggle label="Show promo banner cards" checked={settings.showBanners ?? true} on={(v) => set("showBanners", v)} />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setB(DEFAULT_BANNERS)}>Reset</Button>
            <Button size="sm" onClick={() => setB([...banners, { image: "", kicker: "New", title: "New banner", cta: "Shop now", link: "#shop" }])}>
              <Plus className="mr-1 h-3 w-3" /> Add card
            </Button>
          </div>
        </div>
        {banners.map((b, i) => {
          const up = (patch: Partial<Banner>) => setB(banners.map((x, k) => (k === i ? { ...x, ...patch } : x)));
          return (
            <div key={i} className={`grid gap-3 border p-3 md:grid-cols-[120px_1fr] ${b.hidden ? "opacity-50" : ""}`}>
              <div className="space-y-2">
                <div className="aspect-[4/3] w-full overflow-hidden bg-secondary">
                  {b.image && <img src={b.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-[10px]"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await upload(f);
                    if (url) up({ image: url });
                  }}
                />
                {b.image && (
                  <button className="text-[10px] underline" onClick={() => up({ image: "" })}>Use product photo</button>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <F label="Small tag" v={b.kicker} on={(v) => up({ kicker: v })} />
                <F label="Headline" v={b.title} on={(v) => up({ title: v })} />
                <F label="Button text" v={b.cta} on={(v) => up({ cta: v })} />
                <F label="Link" v={b.link} on={(v) => up({ link: v })} />
                <div className="flex gap-1 sm:col-span-2">
                  <Button size="icon" variant="ghost" onClick={() => setB(move(banners, i, -1))}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setB(move(banners, i, 1))}><ArrowDown className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => up({ hidden: !b.hidden })}>
                    {b.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setB(banners.filter((_, k) => k !== i))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 border bg-card p-5">
        <Toggle label="Show collection section on homepage" checked={settings.showCollectionSection ?? true} on={(v) => set("showCollectionSection", v)} />
        <F label="Shop all title" v={settings.shopTitle ?? "Shop all"} on={(v) => set("shopTitle", v)} />
      </div>

      <div className="space-y-3 border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Toggle label="Show brand promises (bottom strip)" checked={settings.showPillars ?? true} on={(v) => set("showPillars", v)} />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setP(DEFAULT_PILLARS)}>Reset</Button>
            <Button size="sm" onClick={() => setP([...pillars, { n: `0${pillars.length + 1}.`, t: "New promise", d: "" }])}>
              <Plus className="mr-1 h-3 w-3" /> Add
            </Button>
          </div>
        </div>
        {pillars.map((p, i) => {
          const up = (patch: Partial<Pillar>) => setP(pillars.map((x, k) => (k === i ? { ...x, ...patch } : x)));
          return (
            <div key={i} className="grid gap-2 border p-3 sm:grid-cols-[80px_1fr_auto]">
              <Input value={p.n} onChange={(e) => up({ n: e.target.value })} />
              <div className="space-y-2">
                <Input value={p.t} onChange={(e) => up({ t: e.target.value })} placeholder="Title" />
                <Textarea rows={2} value={p.d} onChange={(e) => up({ d: e.target.value })} placeholder="Description" />
              </div>
              <div className="flex sm:flex-col">
                <Button size="icon" variant="ghost" onClick={() => setP(move(pillars, i, -1))}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setP(move(pillars, i, 1))}><ArrowDown className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setP(pillars.filter((_, k) => k !== i))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
