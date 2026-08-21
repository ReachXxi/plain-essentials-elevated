import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { ngn, unitAfterDiscount, usd, type Product } from "@/lib/site";
import { trackEvent } from "@/lib/plain.functions";

export function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWishlist, addToCart, settings } = useStore();
  const [qty, setQty] = useState(1);
  const liked = wishlist.includes(product.id);
  const price = unitAfterDiscount(product);
  const slug = product.slug ?? product.id;

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
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
          {product.badge && (
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
        className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur"
      >
        <Heart className={`h-3.5 w-3.5 ${liked ? "fill-accent text-accent" : ""}`} />
      </button>

      <div className="pt-3">
        <p className="font-accent text-[9px] text-muted-foreground">{product.category}</p>
        <Link
          to="/product/$id"
          params={{ id: slug }}
          className="mt-1 block text-sm font-medium"
        >
          {product.name}
        </Link>
        <p className="mt-1 font-accent text-xs">
          {usd(price)}{" "}
          <span className="text-muted-foreground">
            · {ngn(price, settings.usdToNgn)}
          </span>
        </p>

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
          <Button className="h-9 flex-1 font-accent text-[10px]" onClick={add}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
