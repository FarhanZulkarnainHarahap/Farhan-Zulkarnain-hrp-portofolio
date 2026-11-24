"use client";
/**
 * Starts the hero entrance (Fase 12.1): imports ./entrance-player only on desktop (lg+) with JS and
 * motion allowed and the theme known. Phones, reduced motion and no-JS keep the server poster.
 */
import { useEffect, useRef } from "react";
import { useTheme } from "@/components/site/ThemeProvider";
import type { playEntrance } from "./entrance-player";

const DESKTOP = "(min-width: 64rem)";

export function EntranceLoader() {
  const { theme } = useTheme();
  const marker = useRef<HTMLSpanElement>(null);
  const player = useRef<ReturnType<typeof playEntrance> | null>(null);
  const themeRef = useRef(theme);
  const known = theme !== null;

  useEffect(() => {
    themeRef.current = theme;
    if (theme) player.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    const root = marker.current?.closest<HTMLElement>("[data-hero-entrance]");
    const video = root?.querySelector("video");
    if (!known || !root || !video) return;
    if (!window.matchMedia(DESKTOP).matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    import("./entrance-player").then(({ playEntrance }) => {
      if (!cancelled) player.current = playEntrance(root, video, themeRef.current ?? "light");
    });
    return () => {
      cancelled = true;
      player.current?.destroy();
      player.current = null;
    };
  }, [known]);

  return <span ref={marker} hidden />;
}
