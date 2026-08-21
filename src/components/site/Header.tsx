import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { AdBanner } from "./AdBanner";
import { CartSheet } from "./CartSheet";

const NAV = [
  { label: "Shop", to: "/" as const },
  { label: "Gallery", to: "/gallery" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export function Header() {
  const { settings, cartCount, setCartOpen } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdBanner />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-ink-foreground">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <button
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={`${settings.brand} logo`}
                className="h-7 w-7 rounded-sm object-cover"
              />
            ) : null}
            <span className="font-display text-xl tracking-wide">{settings.brand}</span>
          </Link>

          <nav className="hidden gap-8 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className="font-accent text-[10px] text-ink-foreground/70 transition-colors hover:text-accent"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="relative"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-accent text-[9px] text-accent-foreground">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {open && (
          <nav className="flex flex-col border-t border-white/10 px-4 py-3 md:hidden">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 font-accent text-[11px] text-ink-foreground/80"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <CartSheet />
    </>
  );
}
