import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, Menu, Moon, ShieldCheck, ShoppingBag, Sun, User, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { AdBanner } from "./AdBanner";
import { CartSheet } from "./CartSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { label: "Shop", to: "/" as const },
  { label: "Collection", to: "/collection" as const },
  { label: "Gallery", to: "/gallery" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export function Header() {
  const { settings, cartCount, setCartOpen } = useStore();
  const { user, signOut } = useAuth();
  const { mode, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdBanner />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-ink-foreground backdrop-blur supports-[backdrop-filter]:bg-ink/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <button
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="group flex items-center gap-2">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={`${settings.brand} logo`}
                className="h-7 w-7 rounded-sm object-cover transition-transform duration-500 group-hover:rotate-6"
              />
            ) : null}
            <span className="font-display text-xl tracking-wide">{settings.brand}</span>
          </Link>

          <nav className="hidden gap-8 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className="link-underline font-accent text-[10px] text-ink-foreground/70 transition-colors hover:text-accent"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              aria-label="Toggle colour mode"
              className="transition-transform hover:scale-110"
            >
              {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger aria-label="Account" className="transition-transform hover:scale-110">
                <User className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-accent text-[10px]">
                  {user ? (user.email ?? "Account") : "Guest"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/account">My account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void signOut()}>
                      <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/auth">Sign in / Create account</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin">
                    <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Admin portal
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative transition-transform hover:scale-110"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-accent text-[9px] text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
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
