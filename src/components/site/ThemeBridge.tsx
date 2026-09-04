import { useEffect } from "react";
import { BrandColors } from "@/lib/theme";
import { useStore } from "@/lib/store";

/** Applies the admin-configured brand colours + logo favicon to the live site. */
export function ThemeBridge() {
  const { settings } = useStore();

  useEffect(() => {
    if (typeof document === "undefined" || !settings.logoUrl) return;
    document
      .querySelectorAll<HTMLLinkElement>("link[rel~='icon'], link[rel='apple-touch-icon']")
      .forEach((el) => el.remove());
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.href = settings.logoUrl;
    const apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    apple.href = settings.logoUrl;
    document.head.append(icon, apple);
  }, [settings.logoUrl]);

  return (
    <BrandColors
      primary={settings.primaryColor}
      accent={settings.accentColor}
      ink={settings.inkColor}
    />
  );
}
