"use client";
/**
 * Theme colours for the 3D scene (Fase K4). The design tokens resolve light-dark() at runtime, so
 * the scene re-reads them when <html data-theme> changes (theme toggle, ⌘K) and materials / lights
 * re-tint without a remount.
 */
import { useEffect, useState } from "react";
import { getColorTokens, invalidateDesignTokens, type ColorTokenSet } from "@/lib/design-tokens";

export function useThemeColors(): ColorTokenSet {
  const [colors, setColors] = useState<ColorTokenSet>(() => getColorTokens());
  useEffect(() => {
    const observer = new MutationObserver(() => {
      invalidateDesignTokens();
      setColors(getColorTokens());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    return () => observer.disconnect();
  }, []);
  return colors;
}
