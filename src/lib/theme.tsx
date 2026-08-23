import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Context, ReactNode } from "react";
import { hexLightness, hexToOklch } from "./color";

type Mode = "light" | "dark";
type ThemeValue = { mode: Mode; toggle: () => void; setMode: (m: Mode) => void };

const g = globalThis as unknown as { __plainThemeCtx?: Context<ThemeValue | null> };
const ThemeContext: Context<ThemeValue | null> =
  g.__plainThemeCtx ?? (g.__plainThemeCtx = createContext<ThemeValue | null>(null));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("plain.theme");
    const initial: Mode =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setModeState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    window.localStorage.setItem("plain.theme", m);
  }, []);

  const toggle = useCallback(
    () => setMode(document.documentElement.classList.contains("dark") ? "light" : "dark"),
    [setMode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggle, setMode }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return (
    useContext(ThemeContext) ?? {
      mode: "light" as Mode,
      toggle: () => {},
      setMode: () => {},
    }
  );
}

/** Push admin-chosen brand colours into the live CSS variables. */
export function BrandColors({
  primary,
  accent,
  ink,
}: {
  primary: string;
  accent: string;
  ink: string;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const apply = (name: string, hex: string) => {
      const v = hexToOklch(hex);
      if (v) root.style.setProperty(name, v);
    };
    apply("--primary", primary);
    apply("--accent", accent);
    apply("--ring", accent);
    apply("--ink", ink);
    if (accent) {
      root.style.setProperty(
        "--accent-foreground",
        hexLightness(accent) > 0.6 ? "oklch(0.18 0.03 267)" : "oklch(0.98 0.01 85)",
      );
    }
  }, [primary, accent, ink]);
  return null;
}
