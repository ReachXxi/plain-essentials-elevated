import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AddedToCartDialog } from "@/components/site/AddedToCartDialog";
import { useStore } from "@/lib/store";
import { embedUrl, ngn, unitAfterDiscount, usd } from "@/lib/site";
import { trackEvent } from "@/lib/plain.functions";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Product — PLAIN Essentials" },
      {
        name: "description",
        content:
          "Heavyweight organic cotton essentials from PLAIN. Choose your size and colour, then check out on WhatsApp.",
      },
      { property: "og:title", content: "Product — PLAIN" },
      { property: "og:description", content: "Heavyweight organic cotton essentials from PLAIN." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { products, addToCart, settings } = useStore();
  const product = products.find((p) => p.slug === id || p.id === id);
  const [img, setImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (product) void trackEvent({ data: { kind: "view", label: `product:${product.name}` } });
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-32 text-center">
          <h1 className="font-display text-4xl">Product not found</h1>
          <Link to="/" className="mt-6 inline-block font-accent text-[11px] underline">
            Back to shop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const price = unitAfterDiscount(product);
  const video = embedUrl(product.video_url ?? "");
  const chosenSize = size || product.sizes[0] || "M";
  const chosenColor = color || product.colors[0] || "Default";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
            <img
              src={product.images[img] ?? product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {video && (
              <button
                onClick={() => setVideoOpen(true)}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-ink px-4 py-2 font-accent text-[10px] text-ink-foreground"
              >
                <Play className="h-3 w-3" /> Watch
              </button>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setImg(i)}
                  className={`h-20 w-16 overflow-hidden border ${
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
          <p className="font-accent text-[10px] text-muted-foreground">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-4 font-display text-3xl">
            {usd(price)}
            <span className="ml-3 font-accent text-xs text-muted-foreground">
              {ngn(price, settings.usdToNgn)}
            </span>
          </p>
          <p className="mt-1 font-accent text-[10px] text-muted-foreground">
            VAT {product.vat_percent}% · Shipping {usd(product.shipping_usd)} per item
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8">
            <p className="font-accent text-[10px]">Size</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`border px-4 py-2 font-accent text-[10px] ${
                    chosenSize === s ? "border-ink bg-ink text-ink-foreground" : "border-border"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {product.colors.length > 0 && (
            <div className="mt-6">
              <p className="font-accent text-[10px]">Colour</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`border px-4 py-2 font-accent text-[10px] ${
                      chosenColor === c ? "border-ink bg-ink text-ink-foreground" : "border-border"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center border">
              <button className="px-3 py-3" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button className="px-3 py-3" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
            <Button
              className="h-12 flex-1 font-accent text-[11px]"
              onClick={() =>
                addToCart({
                  productId: product.id,
                  name: product.name,
                  image: product.images[0] ?? "",
                  size: chosenSize,
                  color: chosenColor,
                  qty,
                  unitUsd: product.price_usd,
                  vatPercent: product.vat_percent,
                  shippingUsd: product.shipping_usd,
                  discountPercent: product.discount_percent,
                })
              }
            >
              Add to Cart
            </Button>
          </div>

          {video && (
            <Button
              variant="outline"
              className="mt-4 h-12 w-full gap-2 font-accent text-[11px]"
              onClick={() => {
                setVideoOpen(true);
                void trackEvent({ data: { kind: "click", label: `live-view:${product.name}` } });
              }}
            >
              <Play className="h-3.5 w-3.5" /> Live video preview
            </Button>
          )}
        </div>
      </main>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl p-0">
          <DialogTitle className="sr-only">{product.name} video</DialogTitle>
          {video?.kind === "video" ? (
            <video src={video.src} controls autoPlay className="aspect-video w-full" />
          ) : video ? (
            <iframe
              src={video.src}
              title={`${product.name} video`}
              allow="autoplay; encrypted-media"
              className="aspect-video w-full"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Footer />
      <AddedToCartDialog />
    </div>
  );
}
