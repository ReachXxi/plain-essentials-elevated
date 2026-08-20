import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { naira, type Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const liked = wishlist.includes(product.id);

  return (
    <div className="group relative">
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          {product.badge && (
            <span className="absolute left-3 top-3 bg-ink px-2 py-1 font-accent text-[9px] text-ink-foreground">
              {product.badge}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0] ?? "",
                size: "M",
                color: product.colors[0] ?? "Black",
                qty: 1,
              });
            }}
            className="absolute inset-x-3 bottom-3 translate-y-3 bg-background py-3 font-accent text-[10px] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            Quick Add
          </button>
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
        <p className="font-accent text-[9px] text-muted-foreground">PLAIN</p>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="mt-1 block text-sm font-medium"
        >
          {product.name}
        </Link>
        <p className="mt-1 font-accent text-xs">{naira(product.price)}</p>
      </div>
    </div>
  );
}
