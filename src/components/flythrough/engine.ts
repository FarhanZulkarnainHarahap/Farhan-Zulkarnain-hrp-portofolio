/**
 * Fly-through engine (Fase 12.1): loaded with import() by FlyThroughLoader when the section comes
 * within about one screen, so neither this nor the scrub engine is on the home page's first-paint
 * path. Maps scroll to the clips (./scrub.ts) and writes each scene copy's opacity/translate.
 */
import { FLIGHT_CLOSING, FLIGHT_SEGMENTS, CONNECTOR_SCROLL, SCENE_SCROLL, type FlightSegment } from "./content";
import { mountScrub } from "./scrub";

export const SMALL = "(max-width: 53.75rem)";
const weight = (s: FlightSegment) => (s.kind === "connector" ? CONNECTOR_SCROLL : SCENE_SCROLL);
const linger = (s: FlightSegment) =>
  s.kind === "scene" ? s.scene.linger : s.kind === "closing" ? FLIGHT_CLOSING.linger : undefined;
const smooth = (x: number) => {
  x = Math.min(1, Math.max(0, x));
  return x * x * (3 - 2 * x);
};

export type FlightTheme = "light" | "dark";

/** Starts the scrub on `el`; `getTheme` is read whenever a clip URL is needed. */
export function mountFlight(el: HTMLElement, getTheme: () => FlightTheme) {
  let mountedTheme: FlightTheme | null = null;
  const media = Array.from(el.querySelectorAll<HTMLElement>("[data-flight-media]"));
  /** Copy per segment (null for connectors), in segment order. */
  const copies = FLIGHT_SEGMENTS.map((s) => el.querySelector<HTMLElement>(`[data-flight-copy="${s.id}"]`));
  const distance = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--reveal-distance")) || 8;
  const last = FLIGHT_SEGMENTS.length - 1;
  const engine = mountScrub({
    root: el,
    segments: FLIGHT_SEGMENTS.map((s, i) => ({
      media: media[i],
      weight: weight(s),
      linger: linger(s),
      clip: () => {
        const t = getTheme();
        mountedTheme = t;
        return `/3d/flight/${t}-${s.id}${window.matchMedia(SMALL).matches ? "-m" : ""}.mp4`;
      },
    })),
    onUpdate: ({ progress }) => {
      progress.forEach((p, i) => {
        const copy = copies[i];
        if (!copy) return;
        // The first scene greets on arrival, the closing holds; the others peak mid-scene.
        const opacity = i === 0 ? smooth((1 - p) / 0.35) : i === last ? smooth(p / 0.4) : smooth(1 - Math.abs(p - 0.5) / 0.5);
        copy.style.opacity = String(opacity);
        copy.style.transform = `translateY(${(i === last ? Math.max(0, 0.5 - p) : 0.5 - p) * distance * 2}px)`;
      });
    },
  });
  return {
    /** Theme switched: if clips of another theme were loaded, fetch this theme's clips. */
    setTheme(theme: FlightTheme) {
      if (mountedTheme && mountedTheme !== theme) engine.reload();
    },
    destroy() {
      engine.destroy();
      for (const copy of copies) {
        copy?.style.removeProperty("opacity");
        copy?.style.removeProperty("transform");
      }
    },
  };
}
