import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CollectionSection } from "@/components/site/CollectionSection";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "The Collection — PLAIN Season 01 Essentials" },
      {
        name: "description",
        content:
          "Explore the PLAIN collection: heavyweight organic cotton tees, graphic essentials and the design thinking behind every piece.",
      },
      { property: "og:title", content: "The Collection — PLAIN" },
      {
        property: "og:description",
        content: "The design story behind PLAIN's elevated everyday essentials.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectionPage,
});

function CollectionPage() {
  const { settings, products } = useStore();
  const picks = products.filter((p) => p.in_collection);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PageHero
          kicker={settings.collectionSubtitle}
          title={settings.collectionTitle}
          subtitle={settings.collectionBody}
        />

        <CollectionSection full />

        <section className="bg-secondary/40 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="font-display text-4xl md:text-5xl">Every piece</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
