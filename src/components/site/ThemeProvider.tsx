"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
  useEffect,
} from "react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "theme"; // read before paint by the inline script in app/layout.tsx

/** Dark is the default scheme (Kinetic, 2026-11-27); only a stored choice pins light. */
function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    if (event.newValue === "light" || event.newValue === "dark")
      document.documentElement.dataset.theme = event.newValue;
    else delete document.documentElement.dataset.theme;
  };
  window.addEventListener("storage", onStorage);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}

type ThemeContextValue = {
  /** null until hydrated (the server cannot know the visitor's theme). */
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<Theme | null>(
    subscribe,
    readTheme,
    () => null,
  );
  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode): the choice lasts for this page only */
    }
  }, []);
  // Browser chrome follows the site theme, not only the OS one (Fase 12.4): both theme-color
  // tags take the canvas colour the page actually shows.
  useEffect(() => {
    if (!theme) return;
    const canvas = getComputedStyle(document.body).backgroundColor;
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'))
      meta.content = canvas;
  }, [theme]);
  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(readTheme() === "dark" ? "light" : "dark"),
    }),
    [theme, setTheme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
