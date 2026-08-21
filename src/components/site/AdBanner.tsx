import { useStore } from "@/lib/store";

export function AdBanner() {
  const { settings } = useStore();
  if (!settings.adEnabled || (!settings.adText && !settings.adImage)) return null;

  const inner = (
    <div className="flex items-center justify-center gap-3 px-4 py-2">
      {settings.adImage ? (
        <img src={settings.adImage} alt="" className="h-6 w-auto object-contain" />
      ) : null}
      <span className="font-accent text-[10px] text-ink-foreground">{settings.adText}</span>
    </div>
  );

  return (
    <div className="w-full bg-ink shimmer-gold">
      {settings.adLink ? (
        <a href={settings.adLink} className="block">
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}
