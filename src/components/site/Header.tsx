import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X, Trash2 } from "lucide-react";
import { LOGO_URL, naira } from "@/lib/catalog";
import { cartMessage, lineKey, useStore, whatsappLink } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAV = [
  { label: "New", to: "/", hash: "new-arrivals" },
  { label: "Bestsellers", to: "/", hash: "featured" },
  { label: "Sale", to: "/", hash: "new-arrivals" },
  { label: "All", to: "/", hash: "new-arrivals" },
];

const COUNTRIES = ["Nigeria (NGN)", "Ghana (GHS)", "United Kingdom (GBP)", "United States (USD)"];

export function Header() {
  const { cart, cartCount, cartTotal, removeFromCart, clearCart } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (hash: string) => {
    setMenuOpen(false);
    const el = document.getElementById(hash);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-ink text-ink-foreground transition-all duration-300 ${
        scrolled ? "py-2 shadow-[0_1px_0_0_rgba(255,255,255,0.08)]" : "py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 md:px-8">
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="PLAIN logo" className="h-7 w-7 invert" />
          <span className="font-accent text-lg font-bold">PLAIN</span>
        </Link>

        <nav className="ml-10 hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => go(n.hash)}
              className="font-accent text-[11px] text-ink-foreground/70 transition-colors hover:text-accent"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="hidden bg-transparent font-accent text-[10px] text-ink-foreground/60 outline-none lg:block"
            aria-label="Select country"
          >
            {COUNTRIES.map((c) => (
              <option key={c} className="text-foreground">
                {c}
              </option>
            ))}
          </select>

          <button onClick={() => setSearchOpen((v) => !v)} aria-label="Search">
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Link to="/admin" aria-label="Admin">
            <User className="h-[18px] w-[18px]" />
          </Link>

          <Sheet>
            <SheetTrigger aria-label="Cart" className="relative">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="font-accent text-sm">Your bag</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-4 overflow-y-auto px-4">
                {cart.length === 0 && (
                  <p className="text-sm text-muted-foreground">Your bag is empty.</p>
                )}
                {cart.map((l) => (
                  <div key={lineKey(l)} className="flex gap-3 border-b pb-3">
                    <img src={l.image} alt={l.name} className="h-20 w-16 object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{l.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.size} / {l.color} × {l.qty}
                      </p>
                      <p className="mt-1 font-accent text-xs">{naira(l.price * l.qty)}</p>
                    </div>
                    <button onClick={() => removeFromCart(lineKey(l))} aria-label="Remove">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t p-4">
                <div className="flex justify-between font-accent text-xs">
                  <span>Total</span>
                  <span>{naira(cartTotal)}</span>
                </div>
                <a
                  href={whatsappLink(cartMessage(cart, cartTotal))}
                  target="_blank"
                  rel="noreferrer"
                  className={cart.length === 0 ? "pointer-events-none opacity-50" : ""}
                >
                  <Button className="w-full font-accent text-[11px]">Checkout via WhatsApp</Button>
                </a>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full font-accent text-[10px] text-muted-foreground"
                  >
                    Clear bag
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {searchOpen && (
        <div className="mx-auto mt-3 max-w-7xl px-4 md:px-8">
          <Input
            autoFocus
            placeholder="Search products, categories…"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchOpen(false);
                document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="border-white/20 bg-white/5 text-ink-foreground placeholder:text-white/40"
          />
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-ink p-6 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-accent text-lg font-bold">PLAIN</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-12 flex flex-col gap-6">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() => go(n.hash)}
                className="text-left font-display text-3xl"
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
