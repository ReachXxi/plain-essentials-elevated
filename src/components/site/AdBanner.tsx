import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";

export function AdBanner() {
  const { settings } = useStore();
  if (!settings.adEnabled || (!settings.adText && !settings.adImage)) return null;

  const inner = (
    <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:gap-6 md:px-8 md:py-5">
      {settings.adImage ? (
        <img
          src={settings.adImage}
          alt={settings.adText || "Promotion"}
          loading="lazy"
          className="h-16 w-20 shrink-0 rounded-sm object-cover md:h-20 md:w-28"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-tight text-ink-foreground md:text-2xl">
          {settings.adText}
        </p>
        {settings.adSubtext ? (
          <p className="mt-1 text-xs text-ink-foreground/70 md:text-sm">{settings.adSubtext}</p>
        ) : null}
      </div>
      {settings.adLink ? (
        <span className="hidden shrink-0 items-center gap-2 border border-accent/60 px-4 py-2 font-accent text-[10px] text-accent transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex">
          {settings.adCta || "Shop the drop"}
          <ArrowRight className="h-3 w-3" />
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="w-full bg-ink shimmer-gold">
      {settings.adLink ? (
        <a href={settings.adLink} className="group block">
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}
