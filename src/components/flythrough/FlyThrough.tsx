/**
 * Home fly-through (Fase 10.5): scroll scrubs Blender clips of the five layers, between the hero
 * and Selected work: s1 c1 s2 … c5 s6, one continuous film (content.ts). All copy is in the server HTML.
 *
 *  - Without JS or with reduced motion: a plain list, one still + text per scene and the closing;
 *    connectors are not shown, no video is requested and nothing is pinned.
 *  - With JS and motion allowed (html.js-motion, set before paint, so the layout never shifts):
 *    the stage is sticky; FlyThroughLoader imports ./engine when the section is about one screen
 *    away (Fase 12.1), and the scrub engine (./scrub.ts) loads the clips lazily as Blobs and maps
 *    scroll to time; the copy follows the scroll progress (opacity + translate written directly,
 *    no GSAP: Fase 12.1). 0 rAF while idle.
 *  - "Skip to projects" stays visible on the stage and jumps to #selected-work.
 *  - Theme switch → clips of the other theme; unmount → listeners, fetches and videos released.
 */
import type { CSSProperties } from "react";
import { ThemedPicture } from "@/components/media/ThemedPicture";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CONNECTOR_SCROLL,
  FLIGHT_CLOSING,
  FLIGHT_SCENES,
  FLIGHT_SEGMENTS,
  FLIGHT_SKIP,
  FLIGHT_TITLE,
  SCENE_SCROLL,
  type FlightSegment,
} from "./content";
import { FlyThroughLoader } from "./FlyThroughLoader";

/** Keep in step with SMALL in ./engine (phones get the portrait clips and stills). */
const SMALL = "(max-width: 53.75rem)";
const count = FLIGHT_SCENES.length;
const pad = (n: number) => String(n).padStart(2, "0");
const weight = (s: FlightSegment) => (s.kind === "connector" ? CONNECTOR_SCROLL : SCENE_SCROLL);
/** Screens of scroll: every segment plus one screen that holds the last frame. */
const LENGTH = FLIGHT_SEGMENTS.reduce((sum, s) => sum + weight(s), 0) + 1;

export function FlyThrough() {
  return (
    <section
      aria-labelledby="flight-title"
      data-flight
      className="flight"
      style={{ "--flight-length": LENGTH } as CSSProperties}
    >
      <FlyThroughLoader />
      <h2 id="flight-title" className="sr-only">
        {FLIGHT_TITLE}
      </h2>
      <div className="flight-stage">
        <ol className="flight-scenes">
          {FLIGHT_SEGMENTS.map((s) => (
            <li
              key={s.id}
              className={cn("flight-scene", s.kind === "connector" && "flight-scene--connector")}
              aria-hidden={s.kind === "connector" || undefined}
            >
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
              {s.kind === "scene" && (
                <div data-flight-copy={s.id} className="flight-copy">
                  <p className="font-meta text-meta text-muted">
                    {pad(s.index + 1)} / {pad(count)}
                  </p>
                  <p className="mt-4 font-meta text-label text-accent uppercase">{s.scene.eyebrow}</p>
                  <h3 className="mt-3 font-heading text-headline text-ink text-balance">{s.scene.title}</h3>
                  <p className="mt-4 text-copy text-body text-pretty">{s.scene.body}</p>
                </div>
              )}
              {s.kind === "closing" && (
                <div data-flight-copy={s.id} className="flight-copy">
                  <h3 className="font-heading text-headline text-ink text-balance">{FLIGHT_CLOSING.title}</h3>
                  <p className="mt-4 text-copy text-body text-pretty">{FLIGHT_CLOSING.body}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
        <a href="#selected-work" className={cn(buttonClasses({ variant: "secondary", size: "sm" }), "flight-skip")}>
          {FLIGHT_SKIP}
        </a>
      </div>
    </section>
  );
}
