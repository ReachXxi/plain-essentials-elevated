import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const SLATS = 12;

const SPECS = [
  "100% Organic Cotton",
  "Ethically Made",
  "Premium Fit",
  "Sustainable",
];

export function Hero({ image }: { image: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-ink text-ink-foreground">
      <div className="absolute inset-0 flex flex-col" style={{ perspective: "1200px" }}>
        {Array.from({ length: SLATS }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 ${mounted ? "slat-reveal" : "opacity-0"}`}
            style={{
              animationDelay: `${i * 60}ms`,
              backgroundImage: `url(${image})`,
              backgroundSize: `cover`,
              backgroundPosition: `center ${(i / (SLATS - 1)) * 100}%`,
              backgroundAttachment: "fixed",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-4 pb-20 pt-32 md:px-8">
        <p className="font-accent text-[11px] text-accent rise-in">See your dream fit</p>
        <h1
          className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] rise-in md:text-8xl"
          style={{ animationDelay: "120ms" }}
        >
          Essentials.
          <br />
          Elevated.
        </h1>
        <div
          className="mt-8 flex flex-wrap gap-3 rise-in"
          style={{ animationDelay: "240ms" }}
        >
          <a href="#new-arrivals">
            <Button variant="secondary" className="h-12 px-8 font-accent text-[11px]">
              Shop Now
            </Button>
          </a>
          <a href="#featured">
            <Button
              variant="outline"
              className="h-12 border-white/40 bg-transparent px-8 font-accent text-[11px] text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
            >
              Explore
            </Button>
          </a>
        </div>

        <div className="mt-12 flex flex-wrap gap-2">
          {SPECS.map((s, i) => (
            <span
              key={s}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-accent text-[10px] backdrop-blur-md rise-in"
              style={{ animationDelay: `${360 + i * 90}ms` }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
