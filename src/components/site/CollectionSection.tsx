import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Reveal } from "./Reveal";

export function CollectionSection({ full = false }: { full?: boolean }) {
  const { settings, products } = useStore();
  const collections =
    settings.collections.length > 0
      ? settings.collections
      : Array.from(new Set(products.map((p) => p.category))).map((c) => ({
          title: c,
          description: `${products.filter((p) => p.category === c).length} pieces in the ${c} line — cut, printed and finished in small runs.`,
          image: products.find((p) => p.category === c)?.images[0] ?? "",
        }));

  return (
    <section id="collection" className="relative overflow-hidden bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <p className="font-accent text-[10px] text-accent">{settings.collectionSubtitle}</p>
            <h2 className="mt-3 font-display text-4xl md:text-6xl">{settings.collectionTitle}</h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {settings.collectionBody}
            </p>
            {!full && (
              <Link
                to="/collection"
                className="mt-7 inline-flex items-center gap-2 border border-foreground px-6 py-3 font-accent text-[10px] transition-colors hover:bg-foreground hover:text-background"
              >
                Explore the collection <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </Reveal>
          {settings.collectionImage ? (
            <Reveal delay={120}>
              <img
                src={settings.collectionImage}
                alt={settings.collectionTitle}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </Reveal>
          ) : null}
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => (
            <Reveal key={c.title + i} delay={i * 90}>
              <article className="group h-full overflow-hidden border bg-card transition-shadow duration-500 hover:shadow-xl">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
                <div className="p-6">
                  <h3 className="font-display text-2xl">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
