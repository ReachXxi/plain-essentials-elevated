import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export function Footer() {
  const { settings } = useStore();

  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4 md:px-8">
        <div>
          <p className="font-display text-2xl">{settings.brand}</p>
          <p className="mt-2 text-sm text-ink-foreground/60">{settings.tagline}</p>
        </div>
        <div>
          <p className="font-accent text-[10px] text-accent">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
            <li>
              <Link to="/">All products</Link>
            </li>
            <li>
              <Link to="/gallery">Gallery</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-accent text-[10px] text-accent">Company</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact us</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-accent text-[10px] text-accent">Reach us</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
            {settings.contactPhone && <li>{settings.contactPhone}</li>}
            {settings.contactEmail && <li>{settings.contactEmail}</li>}
            {settings.contactAddress && <li>{settings.contactAddress}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center font-accent text-[9px] text-ink-foreground/40">
        © {new Date().getFullYear()} {settings.brand}
      </div>
    </footer>
  );
}
