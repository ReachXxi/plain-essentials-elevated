import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Heart, Leaf, Minus, PlayCircle, Plus, Ruler, Shirt, Star } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { naira, SIZES } from "@/lib/catalog";
import { useStore, whatsappLink } from "@/lib/store";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Shop the drop — PLAIN Essentials" },
      {
        name: "description",
        content:
          "Heavyweight organic cotton, boxy oversized fit and prints that last. Choose your size and order instantly on WhatsApp.",
      },
      { property: "og:title", content: "Shop the drop — PLAIN Essentials" },
      {
        property: "og:description",
        content: "Heavyweight organic cotton essentials from PLAIN. Order on WhatsApp.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function embedUrl(url: string) {
  const yt = url.match(/(?:youtu\.be\/|v=|shorts\/|live\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  const dm = url.match(/dailymotion\.com\/video\/([A-Za-z0-9]+)/);
  if (dm) return `https://www.dailymotion.com/embed/video/${dm[1]}?autoplay=1`;
  return url;
}

const FEATURES = [
  { icon: Shirt, t: "Fit guide", d: "Boxy oversized. Size down for a regular fit." },
  { icon: Leaf, t: "Sustainability", d: "GOTS organic cotton, recycled packaging." },
  { icon: Ruler, t: "Care", d: "Cold wash inside out. Do not tumble dry." },
];

function ProductPage() {
  const { id } = useParams({ from: "/product/$id" });
  const { products, addToCart, wishlist, toggleWishlist } = useStore();
  const product = products.find((p) => p.id === id);
  const [img, setImg] = useState(0);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [videoOpen, setVideoOpen] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-40 text-center">
          <h1 className="font-display text-4xl">Product not found</h1>
          <Link to="/" className="mt-6 inline-block font-accent text-[11px] underline">
            Back to collection
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const activeColor = color ?? product.colors[0];
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);
  const video = product.video ?? "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8 md:pt-36">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-accent text-[10px] text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to collection
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <div>
            <div className="aspect-[3/4] overflow-hidden bg-secondary">
              <img
                src={product.images[img]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setImg(i)}
                    className={`h-24 w-20 overflow-hidden border ${
                      i === img ? "border-ink" : "border-transparent"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="font-accent text-[10px] text-muted-foreground">PLAIN</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{product.name}</h1>
            <p className="mt-4 font-accent text-lg">{naira(product.price)}</p>
            <div className="mt-3 flex items-center gap-2 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
              <span className="font-accent text-[10px] text-muted-foreground">(24 reviews)</span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-8">
              <p className="font-accent text-[10px]">Size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-11 w-14 border font-accent text-[10px] transition-colors ${
                      size === s ? "border-ink bg-ink text-ink-foreground" : "border-border"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="font-accent text-[10px]">Colour</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`border px-4 py-2 font-accent text-[10px] ${
                      activeColor === c ? "border-ink bg-ink text-ink-foreground" : "border-border"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <p className="font-accent text-[10px]">Qty</p>
              <div className="flex items-center border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                className="h-12 w-full font-accent text-[11px]"
                onClick={() =>
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    size,
                    color: activeColor,
                    qty,
                  })
                }
              >
                Add to cart
              </Button>
              <a
                href={whatsappLink(
                  `Hello PLAIN, I want to buy ${product.name} (${size} / ${activeColor}) × ${qty} — ${naira(product.price * qty)}`,
                )}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button variant="outline" className="h-12 w-full font-accent text-[11px]">
                  Buy now via WhatsApp
                </Button>
              </a>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="flex w-full items-center justify-center gap-2 py-2 font-accent text-[10px] text-muted-foreground"
              >
                <Heart
                  className={`h-3.5 w-3.5 ${
                    wishlist.includes(product.id) ? "fill-accent text-accent" : ""
                  }`}
                />
                {wishlist.includes(product.id) ? "In wishlist" : "Add to wishlist"}
              </button>
            </div>

            <div className="mt-10 divide-y border-t">
              <button
                onClick={() => setVideoOpen(true)}
                className="flex w-full items-center gap-3 py-4 text-left"
              >
                <PlayCircle className="h-4 w-4 text-accent" />
                <span className="font-accent text-[10px]">Lookbook video</span>
              </button>
              {FEATURES.map((f) => (
                <div key={f.t} className="flex items-start gap-3 py-4">
                  <f.icon className="mt-0.5 h-4 w-4 text-accent" />
                  <div>
                    <p className="font-accent text-[10px]">{f.t}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="font-display text-3xl">You may also like</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl p-0">
          <DialogTitle className="sr-only">Lookbook video</DialogTitle>
          <div className="aspect-video w-full">
            <iframe
              src={videoOpen ? embedUrl(video) : ""}
              title="Lookbook video"
              allow="autoplay; fullscreen"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
