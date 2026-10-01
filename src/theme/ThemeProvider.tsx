import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const THEME_KEY = "inkfig.theme";
const PALESTINE_TIME_ZONE = "Asia/Hebron";
const LIGHT_THEME_START_HOUR = 6;
const DARK_THEME_START_HOUR = 18;
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [[theme, isAutomatic], setThemeState] = useState(loadTheme);

  useEffect(() => {
    if (!isAutomatic) return;

    const synchronizeWithPalestineTime = () => {
      const nextTheme = getPalestineTimeTheme();
      applyTheme(nextTheme);
      setThemeState((current) => current[0] === nextTheme ? current : [nextTheme, true]);
    };
    const interval = window.setInterval(synchronizeWithPalestineTime, 60_000);
    return () => window.clearInterval(interval);
  }, [isAutomatic]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => {
        setThemeState(([currentTheme]) => {
          const next = currentTheme === "dark" ? "light" : "dark";
          applyTheme(next);
          localStorage.setItem(THEME_KEY, next);
          return [next, false];
        });
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return context;
}

function loadTheme(): [Theme, boolean] {
  const storedTheme = localStorage.getItem(THEME_KEY);
  const theme: Theme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : getPalestineTimeTheme();
  const isAutomatic = storedTheme !== "light" && storedTheme !== "dark";
  applyTheme(theme);
  return [theme, isAutomatic];
}

export function getPalestineTimeTheme(now = new Date()): Theme {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: PALESTINE_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(now));
  return hour >= LIGHT_THEME_START_HOUR && hour < DARK_THEME_START_HOUR
    ? "light"
    : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}
