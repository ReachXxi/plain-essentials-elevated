import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";

/**
 * Shared hero image slider used on Collection / Gallery / About so every page
 * animates exactly like the shop landing page hero.
 */
export function PageHero({
  kicker,
  title,
  subtitle,
  children,
  overlay,
  height = "min-h-[62vh]",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  overlay?: ReactNode;
  height?: string;
}) {
  const { settings } = useStore();
  const slides = settings.heroSlides.filter(Boolean);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className={`relative overflow-hidden bg-ink text-ink-foreground ${height}`}>
      {slides.map((src, idx) => (
        <img
          key={src + idx}
          src={src}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            idx === i ? "fade-slide opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {overlay}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />

      <div
        className={`relative mx-auto flex ${height} max-w-7xl flex-col justify-end px-4 pb-16 pt-32 md:px-8`}
      >
        {kicker ? <p className="font-accent text-[10px] text-accent rise-in">{kicker}</p> : null}
        <h1 className="mt-3 font-display text-5xl leading-[0.95] rise-in md:text-7xl">{title}</h1>
        {subtitle ? (
          <p
            className="mt-4 max-w-xl text-sm text-ink-foreground/70 rise-in"
            style={{ animationDelay: "160ms" }}
          >
            {subtitle}
          </p>
        ) : null}
        {children}

        {slides.length > 1 && (
          <div className="mt-8 flex gap-2">
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
