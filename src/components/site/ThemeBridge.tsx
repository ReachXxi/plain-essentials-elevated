import { BrandColors } from "@/lib/theme";
import { useStore } from "@/lib/store";

/** Applies the admin-configured brand colours to the live CSS variables. */
export function ThemeBridge() {
  const { settings } = useStore();
  return (
    <BrandColors
      primary={settings.primaryColor}
      accent={settings.accentColor}
      ink={settings.inkColor}
    />
  );
}
