"use client";
/**
 * Home fly-through (Fase 10.5): scroll scrubs Blender clips of the five layers, between the hero
 * and Selected work. All scene copy is in the server HTML.
 *
 *  - Without JS or with reduced motion: a plain list, one still + text per scene; no video is
 *    requested and nothing is pinned.
 *  - With JS and motion allowed (html.js-motion, set before paint, so the layout never shifts):
 *    the stage is sticky, the scrub engine (./scrub.ts) loads the clips lazily as Blobs and maps
 *    scroll to time; the copy follows the scroll progress through GSAP. 0 rAF while idle.
 *  - "Skip to projects" stays visible on the stage and jumps to #selected-work.
 *  - Theme switch → clips of the other theme; unmount → listeners, fetches and videos released.
 */
import { useEffect, useRef, type CSSProperties } from "react";
import { ThemedPicture } from "@/components/media/ThemedPicture";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/site/ThemeProvider";
import { gsap, tokens } from "@/lib/gsap";
import {
  CONNECTOR_SCROLL,
  FLIGHT_SCENES,
  FLIGHT_SKIP,
  FLIGHT_TITLE,
  SCENE_SCROLL,
} from "./content";
import { mountScrub } from "./scrub";

const SMALL = "(max-width: 53.75rem)";
const scenes = FLIGHT_SCENES.filter((s) => s.available);
const count = FLIGHT_SCENES.length;
const pad = (n: number) => String(n).padStart(2, "0");
/** Screens of scroll for the rendered scenes (no connectors yet with a single scene). */
const LENGTH = scenes.length * SCENE_SCROLL + Math.max(0, scenes.length - 1) * CONNECTOR_SCROLL + 1;

const smooth = (x: number) => {
  x = Math.min(1, Math.max(0, x));
  return x * x * (3 - 2 * x);
};

export function FlyThrough() {
  const { theme } = useTheme();
  const root = useRef<HTMLElement>(null);
  const engine = useRef<ReturnType<typeof mountScrub> | null>(null);
  const themeRef = useRef(theme);
  /** The clips are per theme, so the engine starts once the theme is known (after hydration). */
  const known = theme !== null;
  const mountedTheme = useRef<typeof theme>(null);

  // Declared first so it runs before the engine effect reads the theme.
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const el = root.current;
    if (!known || !el || !document.documentElement.classList.contains("js-motion")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const media = Array.from(el.querySelectorAll<HTMLElement>("[data-flight-media]"));
    const copies = Array.from(el.querySelectorAll<HTMLElement>("[data-flight-copy]"));
    const distance = tokens().distance;
    const last = scenes.length - 1;
    engine.current = mountScrub({
      root: el,
      segments: scenes.map((s, i) => ({
        media: media[i],
        weight: SCENE_SCROLL,
        linger: s.linger,
        clip: () => {
          const t = themeRef.current ?? "light";
          mountedTheme.current = t;
          return `/3d/flight/${t}-${s.id}${window.matchMedia(SMALL).matches ? "-m" : ""}.mp4`;
        },
      })),
      onUpdate: ({ progress }) => {
        progress.forEach((p, i) => {
          // First scene greets on arrival, the last one holds; the others peak mid-scene.
          const opacity =
            last === 0 ? 1 : i === 0 ? smooth((1 - p) / 0.35) : i === last ? smooth(p / 0.4) : smooth(1 - Math.abs(p - 0.5) / 0.5);
          gsap.set(copies[i], { opacity, y: (0.5 - p) * distance * 2 });
        });
      },
    });
    return () => {
      engine.current?.destroy();
      engine.current = null;
      gsap.set(copies, { clearProps: "opacity,transform" });
    };
  }, [known]);

  useEffect(() => {
    // Theme switched after the clips were loaded: fetch the other theme's clips.
    if (!theme || !mountedTheme.current || mountedTheme.current === theme) return;
    engine.current?.reload();
  }, [theme]);

  return (
    <section
      ref={root}
      aria-labelledby="flight-title"
      data-flight
      className="flight"
      style={{ "--flight-length": LENGTH } as CSSProperties}
    >
      <h2 id="flight-title" className="sr-only">
        {FLIGHT_TITLE}
      </h2>
      <div className="flight-stage">
        <ol className="flight-scenes">
          {scenes.map((s) => {
            const index = FLIGHT_SCENES.indexOf(s);
            return (
              <li key={s.id} className="flight-scene">
                <div data-flight-media className="flight-media">
                  <ThemedPicture
                    base="/3d/flight"
                    name={s.id}
                    widths={[1920]}
                    width={1920}
                    height={1080}
                    sizes="100vw"
                    mobile={{ media: SMALL, name: `${s.id}-m`, widths: [720], sizes: "100vw" }}
                    className="flight-still"
                  />
                </div>
                <div data-flight-copy className="flight-copy">
                  <p className="font-meta text-meta text-muted">
                    {pad(index + 1)} / {pad(count)}
                  </p>
                  <p className="mt-4 font-meta text-label text-accent uppercase">{s.eyebrow}</p>
                  <h3 className="mt-3 font-heading text-headline text-ink text-balance">{s.title}</h3>
                  <p className="mt-4 text-copy text-body text-pretty">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <a href="#selected-work" className={cn(buttonClasses({ variant: "secondary", size: "sm" }), "flight-skip")}>
          {FLIGHT_SKIP}
        </a>
      </div>
    </section>
  );
}
