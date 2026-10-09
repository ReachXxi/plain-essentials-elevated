import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Circle, GiftMode, Product, SiteSettings } from "@/lib/site";

type Props = {
  settings: SiteSettings;
  set: <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => void;
  upload: (f: File) => Promise<string | null>;
  products: Product[];
};

function F({ label, v, on, type }: { label: string; v: string | number; on: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="font-accent text-[10px]">{label}</Label>
      <Input type={type} value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}

function Pic({ src, upload, on }: { src: string; upload: Props["upload"]; on: (u: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="block h-16 w-16 overflow-hidden rounded-full bg-secondary">
        {src && <img src={src} alt="" className="h-full w-full object-cover" />}
      </span>
      <label className="cursor-pointer border px-3 py-2 font-accent text-[10px]">
        Upload photo
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              const u = await upload(f);
              if (u) on(u);
            }
          }}
        />
      </label>
      {src && (
        <button type="button" className="font-accent text-[10px] underline" onClick={() => on("")}>
          Use product photo
        </button>
      )}
    </div>
  );
}

export function CirclesEditor({ settings, set, upload, products }: Props) {
  const cats = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const list: Circle[] = settings.circles?.length
    ? settings.circles
    : cats.map((c) => ({ label: c, image: "", category: c, link: "" }));
  const save = (l: Circle[]) => set("circles", l);
  const up = (i: number, p: Partial<Circle>) => save(list.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const mv = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const n = [...list];
    [n[i], n[j]] = [n[j] as Circle, n[i] as Circle];
    save(n);
  };
  return (
    <div className="space-y-3">
      <p className="font-accent text-[10px]">Category circles (All, T-Shirts…)</p>
      {list.map((c, i) => (
        <div key={i} className={`space-y-3 border p-3 ${c.hidden ? "opacity-50" : ""}`}>
          <Pic src={c.image} upload={upload} on={(u) => up(i, { image: u })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <F label="Label" v={c.label} on={(v) => up(i, { label: v })} />
            <div>
              <Label className="font-accent text-[10px]">Filters shop by</Label>
              <select
                className="h-10 w-full border bg-background px-3 text-sm"
                value={c.category}
                onChange={(e) => up(i, { category: e.target.value })}
              >
                {cats.map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>
            <F label="Custom link (optional)" v={c.link} on={(v) => up(i, { link: v })} />
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" onClick={() => mv(i, -1)}><ArrowUp className="h-3 w-3" /></Button>
            <Button size="icon" variant="outline" onClick={() => mv(i, 1)}><ArrowDown className="h-3 w-3" /></Button>
            <Button size="icon" variant="outline" onClick={() => up(i, { hidden: !c.hidden })}>
              {c.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button size="icon" variant="outline" onClick={() => save(list.filter((_, k) => k !== i))}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      ))}
      <Button variant="outline" className="font-accent text-[10px]" onClick={() => save([...list, { label: "New", image: "", category: "All", link: "" }])}>
        <Plus className="mr-2 h-3 w-3" /> Add circle
      </Button>
    </div>
  );
}

export function GiftEditor({ settings, set, upload }: Props) {
  const n = (v: string) => Math.max(0, Number(v) || 0);
  return (
    <div className="space-y-3 border p-4 sm:col-span-2">
      <label className="flex items-center gap-2">
        <Switch checked={!!settings.giftEnabled} onCheckedChange={(v) => set("giftEnabled", v)} />
        <span className="font-accent text-[10px]">Free gift with purchase</span>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="font-accent text-[10px]">Unlock rule</Label>
          <select
            className="h-10 w-full border bg-background px-3 text-sm"
            value={settings.giftMode ?? "qty"}
            onChange={(e) => set("giftMode", e.target.value as GiftMode)}
          >
            <option value="qty">Minimum pieces only</option>
            <option value="value">Minimum order value only</option>
            <option value="both">Pieces AND value</option>
            <option value="either">Pieces OR value</option>
          </select>
        </div>
        <F label="Gift name" v={settings.giftName ?? "Happiness is Free Tee"} on={(v) => set("giftName", v)} />
        <F label="Minimum pieces" type="number" v={settings.giftMinQty ?? 3} on={(v) => set("giftMinQty", n(v))} />
        <F label="Minimum order value (₦)" type="number" v={settings.giftMinNgn ?? 100000} on={(v) => set("giftMinNgn", n(v))} />
        <F label="Slashed price shown (₦)" type="number" v={settings.giftValueNgn ?? 25000} on={(v) => set("giftValueNgn", n(v))} />
        <F
          label="Sizes (comma separated)"
          v={(settings.giftSizes ?? ["S", "M", "L", "XL", "XXL"]).join(", ")}
          on={(v) => set("giftSizes", v.split(",").map((x) => x.trim()).filter(Boolean))}
        />
        <div className="sm:col-span-2">
          <F label="Message before unlock" v={settings.giftHeadline ?? ""} on={(v) => set("giftHeadline", v)} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        {settings.giftImage && <img src={settings.giftImage} alt="" className="h-16 w-12 object-cover" />}
        <label className="cursor-pointer border px-3 py-2 font-accent text-[10px]">
          Upload gift photo
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) { const u = await upload(f); if (u) set("giftImage", u); }
          }} />
        </label>
      </div>
    </div>
  );
}
