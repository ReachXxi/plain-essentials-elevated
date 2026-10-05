import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HeroSlider } from "@/components/site/HeroSlider";
import { ProductCard } from "@/components/site/ProductCard";
import { AddedToCartDialog } from "@/components/site/AddedToCartDialog";
import { CollectionSection } from "@/components/site/CollectionSection";
import { Reveal } from "@/components/site/Reveal";
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
  { n: "04.", t: "Bank Transfer Checkout", d: "Pay by transfer, upload your receipt, done." },
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

        <section className="mx-auto max-w-7xl px-4 pt-16 md:px-8">
          <div className="flex gap-6 overflow-x-auto pb-2 md:justify-center md:gap-10">
            {categories.map((c) => {
              const img =
                c === "All"
                  ? products[0]?.images[0]
                  : products.find((p) => p.category === c)?.images[0];
              return (
                <a
                  key={c}
                  href="#shop"
                  onClick={() => setTab(c)}
                  className="group flex shrink-0 flex-col items-center gap-3"
                >
                  <span className="block h-24 w-24 overflow-hidden rounded-full border-2 border-transparent bg-secondary transition-all duration-300 group-hover:border-accent md:h-28 md:w-28">
                    {img && (
                      <img loading="lazy" decoding="async"
                        src={img}
                        alt={c}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                  </span>
                  <span className="font-accent text-[10px] tracking-widest">{c}</span>
                </a>
              );
            })}
          </div>
        </section>

        <section id="featured" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-4xl md:text-5xl">Featured</h2>
            <p className="font-accent text-[10px] text-muted-foreground">
              The current favourites
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-20 md:grid-cols-2 md:px-8">
          {[
            { img: products[1]?.images[0], k: "New in", t: "Everyday essentials", to: "#shop" },
            { img: products[2]?.images[0], k: "Pre-order", t: "The Collection", to: "/collection" },
          ].map((b) => (
            <Reveal key={b.t}>
              <a
                href={b.to}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-secondary"
              >
                {b.img && (
                  <img loading="lazy" decoding="async"
                    src={b.img}
                    alt={b.t}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-ink-foreground">
                  <p className="font-accent text-[10px] tracking-widest text-accent">{b.k}</p>
                  <p className="mt-2 font-display text-3xl md:text-4xl">{b.t}</p>
                  <span className="mt-4 inline-block rounded-full bg-background px-5 py-2 font-accent text-[10px] text-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    Shop now
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </section>

        <CollectionSection />

        <section id="shop" className="bg-secondary/50 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="font-display text-4xl md:text-5xl">Shop all</h2>
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setTab(c)}
                  className={`border px-4 py-2 font-accent text-[10px] transition-all duration-300 ${
                    tab === c
                      ? "border-ink bg-ink text-ink-foreground"
                      : "border-border bg-background hover:-translate-y-0.5 hover:border-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 80}>
                  <ProductCard product={p} />
                </Reveal>
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

      </main>
      <Footer />
      <AddedToCartDialog />
    </div>
  );
}
