/**
 * Hero visual (Fase 10.5): the Fz card entrance, rendered in Blender (scene `Card`, frames 1–61 of
 * the film timeline; see docs/3D_PLAN.md). Decorative (aria-hidden), desktop only (lg+): on phones
 * the stacked hero puts it below the first screen, so it would play unseen and only cost LCP time;
 * the fly-through opens with the same stack there (Checkpoint B2, variant C).
 *
 *  - Before hydration CSS picks the poster: with `html.js-motion` (JS on, motion allowed) the first
 *    frame (Fz card, whole); otherwise — no JS, reduced motion — the last frame (locked stack). The
 *    hidden posters are display:none + lazy, so they are never downloaded; under reduced motion the
 *    video is never requested at all.
 *  - After hydration EntranceLoader imports ./entrance-player (desktop + motion only, Fase 12.1)
 *    and the clip of the active theme plays once (muted, inline, no loop, no controls)
 *    and stops on its last frame, which is pixel-identical to the stack poster and to the first frame
 *    of the fly-through. A second visit in the same session (sessionStorage) starts at 1.5 s.
 *  - A later theme switch does not replay: the stack poster of the new theme is shown.
 *  - On unmount the video is paused and its source released.
 */
import { ThemedPicture } from "@/components/media/ThemedPicture";
import { EntranceLoader } from "./EntranceLoader";

/** The visual is desktop-only (lg+); below it nothing is played or downloaded. */
const BASE = "/3d/entrance";
// sizes must be a literal length: keep in step with --entrance-width (globals.css).
const SIZES = "(min-width: 64rem) min(34vw, 36rem), 1px";
const WIDTHS = [432, 648, 864] as const;

const poster = (name: "start" | "end") => ({
  base: BASE,
  name,
  widths: WIDTHS,
  width: 864,
  height: 1080,
  sizes: SIZES,
});

/**
 * The poster can be the LCP element: preload exactly the one that will show, with high priority and
 * the right srcset, without waiting for JS. Desktop only; one link per theme × motion preference.
 * The media queries are exclusive, so a single image is fetched (a pinned theme that differs from
 * the OS costs one extra small request).
 */
function PosterPreloads() {
  const links = [];
  for (const theme of ["light", "dark"] as const)
    for (const reduce of [false, true]) {
      const stem = `${BASE}/${theme}-${reduce ? "end" : "start"}`;
      links.push(
        <link
          key={stem}
          rel="preload"
          as="image"
          type="image/avif"
          fetchPriority="high"
          imageSrcSet={WIDTHS.map((w) => `${stem}-${w}.avif ${w}w`).join(", ")}
          imageSizes={SIZES}
          media={`(min-width: 64rem) and (prefers-color-scheme: ${theme}) and (prefers-reduced-motion: ${reduce ? "reduce" : "no-preference"})`}
        />,
      );
    }
  return <>{links}</>;
}

export function HeroEntrance() {
  return (
    <div aria-hidden="true" data-hero-entrance data-state="poster" className="hero-entrance">
      <PosterPreloads />
      <ThemedPicture {...poster("start")} className="hero-entrance__start" />
      <ThemedPicture {...poster("end")} className="hero-entrance__end" />
      <EntranceLoader />
      <video
        className="hero-entrance__video"
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        tabIndex={-1}
      />
      {/* Fase 12.5: after the entrance, a seamless idle loop (its frame 0 is the entrance's last frame)
          and a 5 × 3 hover tilt grid; both loaded by the player, desktop + motion only. */}
      <video className="hero-entrance__idle" muted loop playsInline preload="none" disablePictureInPicture tabIndex={-1} />
      {/* eslint-disable-next-line @next/next/no-img-element -- hover tilt frame */}
      <img className="hero-entrance__seq" alt="" width={864} height={1080} decoding="sync" />
    </div>
  );
}
