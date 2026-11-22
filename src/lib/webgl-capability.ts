"use client";
/**
 * Shared gating for decorative WebGL (Fase 7/10): desktop width, fine pointer, no reduced motion and
 * WebGL2. Used with useSyncExternalStore so the server snapshot is always "not capable".
 */
export const CAPABLE_QUERY =
  "(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

let webgl2: boolean | null = null;
export function hasWebGL2() {
  if (webgl2 === null) {
    try {
      webgl2 = Boolean(document.createElement("canvas").getContext("webgl2"));
    } catch {
      webgl2 = false;
    }
  }
  return webgl2;
}

export function subscribeCapable(onChange: () => void) {
  const media = window.matchMedia(CAPABLE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
export const getCapable = () => window.matchMedia(CAPABLE_QUERY).matches && hasWebGL2();

/** Re-runs on data-theme changes and OS scheme changes. */
export function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

let probe: HTMLSpanElement | null = null;
/** Resolve CSS colour tokens (light-dark aware) to computed rgb() strings. */
export function readTokenColors(tokens: string[]) {
  if (!probe) {
    probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden";
    document.body.appendChild(probe);
  }
  return tokens.map((token) => {
    probe!.style.color = `var(${token})`;
    return getComputedStyle(probe!).color;
  });
}
