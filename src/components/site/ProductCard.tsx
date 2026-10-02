import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Minus, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { PreorderDialog } from "@/components/site/PreorderDialog";
import { embedUrl, ngn, unitAfterDiscount, usd, type Product } from "@/lib/site";
import { trackEvent } from "@/lib/plain.functions";

export function ProductCard({
  product,
  preorder = false,
}: {
  product: Product;
  preorder?: boolean;
}) {
  const { wishlist, toggleWishlist, addToCart, settings } = useStore();
  const [qty, setQty] = useState(1);
  const [live, setLive] = useState(false);
  const [preorderOpen, setPreorderOpen] = useState(false);
  const liked = wishlist.includes(product.id);
  const isPre = preorder || !!product.in_collection;
  const price = unitAfterDiscount(product);
  const slug = product.slug ?? product.id;
  const video = embedUrl(product.video_url ?? "", { autoplay: true, loop: true, muted: true });

  const add = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.images[0] ?? "",
      size: product.sizes[0] ?? "M",
      color: product.colors[0] ?? "Default",
      qty,
      unitUsd: product.price_usd,
      vatPercent: product.vat_percent,
      shippingUsd: product.shipping_usd,
      discountPercent: product.discount_percent,
    });
    void trackEvent({ data: { kind: "click", label: `add:${product.name}` } });
  };

  return (
    <div className="group relative">
      <Link to="/product/$id" params={{ id: slug }} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
          {product.images[1] ? (
            <img
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          ) : null}
          {isPre && (
            <span className="absolute left-3 top-3 bg-accent px-2 py-1 font-accent text-[9px] tracking-widest text-accent-foreground">
              PRE-ORDER
            </span>
          )}
          {product.badge && !isPre && (
            <span className="absolute left-3 top-3 bg-ink px-2 py-1 font-accent text-[9px] text-ink-foreground">
              {product.badge}
            </span>
          )}
          {product.discount_percent > 0 && (
            <span className="absolute left-3 top-10 bg-accent px-2 py-1 font-accent text-[9px] text-accent-foreground">
              -{product.discount_percent}%
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={() => toggleWishlist(product.id)}
        aria-label="Wishlist"
        className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur transition-transform hover:scale-110"
      >
        <Heart className={`h-3.5 w-3.5 ${liked ? "fill-accent text-accent" : ""}`} />
      </button>

      {video ? (
        <button
          onClick={() => {
            setLive(true);
            void trackEvent({ data: { kind: "click", label: `live:${product.name}` } });
          }}
          className="absolute bottom-[9.5rem] left-3 inline-flex items-center gap-2 bg-ink/85 px-3 py-2 font-accent text-[9px] text-ink-foreground opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100"
        >
          <Play className="h-3 w-3" /> Live view
        </button>
      ) : null}

      <div className="pt-3">
        <p className="font-accent text-[9px] text-muted-foreground">{product.category}</p>
        <Link
          to="/product/$id"
          params={{ id: slug }}
          className="mt-1 block text-sm font-medium transition-colors hover:text-accent"
        >
          {product.name}
        </Link>
        <p className="mt-1 font-accent text-xs">
          {usd(price)}{" "}
          <span className="text-muted-foreground">
            · {ngn(price, settings.usdToNgn)}
          </span>
        </p>

        {isPre ? (
          <Button
            className="mt-3 h-9 w-full bg-accent font-accent text-[10px] text-accent-foreground transition-transform hover:bg-accent/90 active:scale-95"
            onClick={() => setPreorderOpen(true)}
          >
            Pre-Order Now
          </Button>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center border">
              <button
                aria-label="Decrease quantity"
                className="px-2 py-2"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-xs">{qty}</span>
              <button
                aria-label="Increase quantity"
                className="px-2 py-2"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <Button
              className="h-9 flex-1 font-accent text-[10px] transition-transform active:scale-95"
              onClick={add}
            >
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      {isPre && (
        <PreorderDialog product={product} open={preorderOpen} onOpenChange={setPreorderOpen} />
      )}


      <Dialog open={live} onOpenChange={setLive}>
        <DialogContent className="max-w-3xl p-0">
          <DialogTitle className="sr-only">{product.name} live view</DialogTitle>
          <div className="aspect-video w-full bg-ink">
            {video?.kind === "video" ? (
              <video
                src={video.src}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="h-full w-full object-cover"
              />
            ) : video ? (
              <iframe
                src={video.src}
                title={`${product.name} video`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-display text-2xl">{product.name}</p>
              <p className="font-accent text-[10px] text-muted-foreground">
                {usd(price)} · {ngn(price, settings.usdToNgn)}
              </p>
            </div>
            <Button
              className="font-accent text-[10px]"
              onClick={() => {
                if (isPre) {
                  setLive(false);
                  setPreorderOpen(true);
                } else add();
              }}
            >
              {isPre ? "Pre-Order Now" : "Add to Cart"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
