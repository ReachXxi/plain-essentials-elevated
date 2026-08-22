import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HeroSlider } from "@/components/site/HeroSlider";
import { ProductCard } from "@/components/site/ProductCard";
import { AddedToCartDialog } from "@/components/site/AddedToCartDialog";
import { useStore } from "@/lib/store";
import { trackEvent } from "@/lib/plain.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PLAIN — Essentials. Elevated. | Premium Streetwear" },
      {
        name: "description",
        content:
          "PLAIN is a minimalist fashion label. Heavyweight organic cotton tees and elevated essentials, priced in USD with Naira conversion. Order on WhatsApp.",
      },
      { property: "og:title", content: "PLAIN — Essentials. Elevated." },
      {
        property: "og:description",
        content: "Heavyweight organic cotton tees and elevated graphic essentials from PLAIN.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const VALUES = [
  { n: "01.", t: "Premium Quality", d: "Sourced from the finest mills worldwide." },
  { n: "02.", t: "Transparent Pricing", d: "VAT and shipping shown before you pay." },
  { n: "03.", t: "Sustainable", d: "Eco-friendly materials and packaging." },
  { n: "04.", t: "WhatsApp Checkout", d: "Order in seconds, no account needed." },
];

const TESTIMONIALS = [
  { q: "Best quality tee I have ever owned. The weight is unreal.", a: "Alex, Lagos" },
  { q: "Fit is perfect and delivery took two days. Repeat customer.", a: "Zainab, Abuja" },
  { q: "The prints do not crack. That alone sold me.", a: "Tobi, Ibadan" },
];

function Index() {
  const { products } = useStore();
  const [tab, setTab] = useState("All");

  useEffect(() => {
    void trackEvent({ data: { kind: "view", label: "/" } });
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = tab === "All" ? products : products.filter((p) => p.category === tab);
  const featured = products.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSlider />

        <section id="featured" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-4xl md:text-5xl">Featured</h2>
            <p className="font-accent text-[10px] text-muted-foreground">
              The current favourites
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section id="shop" className="bg-secondary/50 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="font-display text-4xl md:text-5xl">Shop all</h2>
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setTab(c)}
                  className={`border px-4 py-2 font-accent text-[10px] transition-colors ${
                    tab === c
                      ? "border-ink bg-ink text-ink-foreground"
                      : "border-border bg-background hover:border-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink py-20 text-ink-foreground">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-4 md:px-8">
            {VALUES.map((v) => (
              <div key={v.n}>
                <p className="font-display text-3xl text-accent">{v.n}</p>
                <p className="mt-3 font-accent text-[11px]">{v.t}</p>
                <p className="mt-2 text-sm text-ink-foreground/60">{v.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <h2 className="font-display text-4xl md:text-5xl">Worn &amp; rated</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.a} className="border bg-card p-8">
                <div className="flex gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-5 font-display text-xl leading-snug">
                  “{t.q}”
                </blockquote>
                <figcaption className="mt-5 font-accent text-[10px] text-muted-foreground">
                  — {t.a}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <AddedToCartDialog />
    </div>
  );
}
