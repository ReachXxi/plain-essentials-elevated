import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function HeroSlider() {
  const { settings } = useStore();
  const slides = settings.heroSlides.length ? settings.heroSlides : [""];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="relative min-h-[86vh] overflow-hidden bg-ink text-ink-foreground">
      {slides.map((src, idx) => (
        <img
          key={src + idx}
          src={src}
          loading={idx === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={idx === 0 ? "high" : "low"}
          alt=""
          aria-hidden={idx !== i}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            idx === i ? "fade-slide opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />

      <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-4 pb-20 pt-32 md:px-8">
        <p className="font-accent text-[11px] text-accent rise-in">{settings.heroKicker}</p>
        <h1
          className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] rise-in md:text-8xl"
          style={{ animationDelay: "120ms" }}
        >
          {settings.heroTitle}
        </h1>
        <p
          className="mt-5 max-w-xl text-sm text-ink-foreground/70 rise-in"
          style={{ animationDelay: "200ms" }}
        >
          {settings.heroSubtitle}
        </p>
        <div className="mt-8 flex gap-3 rise-in" style={{ animationDelay: "300ms" }}>
          <a href="#shop">
            <Button className="h-12 bg-accent px-8 font-accent text-[11px] text-accent-foreground hover:bg-accent/90">
              {settings.heroCta}
            </Button>
          </a>
          <Link to="/gallery">
            <Button
              variant="outline"
              className="h-12 border-white/40 bg-transparent px-8 font-accent text-[11px] text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
            >
              Gallery
            </Button>
          </Link>
        </div>

        {slides.length > 1 && (
          <div className="mt-10 flex gap-2">
            {slides.map((s, idx) => (
              <button
                key={s + idx}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-0.5 w-10 transition-colors ${
                  idx === i ? "bg-accent" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
