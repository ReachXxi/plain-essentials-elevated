import { LOGO_URL } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COLUMNS = [
  { title: "Shop", items: ["New", "Bestsellers", "Sale", "All"] },
  { title: "Company", items: ["About", "Careers", "Stockists"] },
  { title: "Support", items: ["Contact", "FAQ", "Shipping", "Returns"] },
  { title: "Social", items: ["Instagram", "Twitter", "YouTube", "TikTok"] },
];

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <img src={LOGO_URL} alt="PLAIN" className="h-10 w-10 invert" />
            <p className="mt-4 font-display text-3xl">Essentials. Elevated.</p>
          </div>
          <form
            className="flex w-full max-w-sm gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              required
              placeholder="Email address"
              className="border-white/20 bg-white/5 text-ink-foreground placeholder:text-white/40"
            />
            <Button variant="secondary" className="font-accent text-[11px]">
              Subscribe
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <p className="font-accent text-[11px] text-accent">{c.title}</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-foreground/60">
                {c.items.map((i) => (
                  <li key={i} className="transition-colors hover:text-ink-foreground">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="font-accent text-[10px] text-ink-foreground/40">
          © 2026 PLAIN. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
