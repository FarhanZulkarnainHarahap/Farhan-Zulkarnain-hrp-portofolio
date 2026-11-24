"use client";
/**
 * Loads the fly-through engine only when it is needed (Fase 12.1): JS on, motion allowed
 * (html.js-motion), theme known, and the section within about one screen of the viewport. Until
 * then the server markup (stills + copy) is all there is; nothing is fetched or pinned differently,
 * because the pinned layout comes from CSS (html.js-motion), not from this script.
 */
import { useEffect, useRef } from "react";
import { useTheme } from "@/components/site/ThemeProvider";
import type { mountFlight } from "./engine";

export function FlyThroughLoader() {
  const { theme } = useTheme();
  const marker = useRef<HTMLSpanElement>(null);
  const handle = useRef<ReturnType<typeof mountFlight> | null>(null);
  const themeRef = useRef(theme);
  const known = theme !== null;

  useEffect(() => {
    themeRef.current = theme;
    if (theme) handle.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    const section = marker.current?.closest<HTMLElement>("[data-flight]");
    if (!known || !section || !document.documentElement.classList.contains("js-motion")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        import("./engine").then(({ mountFlight }) => {
          if (!cancelled) handle.current = mountFlight(section, () => themeRef.current ?? "light");
        });
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(section);
    return () => {
      cancelled = true;
      io.disconnect();
      handle.current?.destroy();
      handle.current = null;
    };
  }, [known]);

  return <span ref={marker} hidden />;
}
