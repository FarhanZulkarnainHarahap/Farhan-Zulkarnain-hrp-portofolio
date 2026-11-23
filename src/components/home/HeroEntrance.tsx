"use client";
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
 *  - After hydration the clip of the active theme plays once (muted, inline, no loop, no controls)
 *    and stops on its last frame, which is pixel-identical to the stack poster and to the first frame
 *    of the fly-through. A second visit in the same session (sessionStorage) starts at 1.5 s.
 *  - A later theme switch does not replay: the stack poster of the new theme is shown.
 *  - On unmount the video is paused and its source released.
 */
import { useEffect, useRef, useState } from "react";
import { ThemedPicture } from "@/components/media/ThemedPicture";
import { useTheme } from "@/components/site/ThemeProvider";

/** The visual is desktop-only (lg+); below it nothing is played or downloaded. */
const SMALL = "(max-width: 63.98rem)";
const BASE = "/3d/entrance";
// sizes must be a literal length: keep in step with --entrance-width (globals.css).
const SIZES = "(min-width: 64rem) min(34vw, 36rem), 1px";
const WIDTHS = [432, 648, 864] as const;
const PLAYED_KEY = "fz-entrance";
const SHORT_FROM = 1.5;

type State = "poster" | "playing" | "done" | "still";

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
  const { theme } = useTheme();
  const video = useRef<HTMLVideoElement>(null);
  /** Set once the clip has started; a later theme switch then shows the still instead. */
  const finished = useRef(false);
  const [state, setState] = useState<State>("poster");

  useEffect(() => {
    const v = video.current;
    if (!v || !theme) return;
    if (finished.current) {
      // Theme switched after the entrance: show the final frame of the new theme, no replay.
      queueMicrotask(() => setState("still"));
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia(SMALL).matches) return;

    let short = false;
    try {
      short = sessionStorage.getItem(PLAYED_KEY) === "1";
    } catch {}
    const remember = () => {
      try {
        sessionStorage.setItem(PLAYED_KEY, "1");
      } catch {}
    };
    let cancelled = false;
    const onPlaying = () => {
      finished.current = true;
      setState("playing");
    };
    const onEnded = () => {
      remember();
      setState("done");
    };
    const onError = () => !cancelled && setState("still");
    v.addEventListener("playing", onPlaying);
    v.addEventListener("ended", onEnded);
    v.addEventListener("error", onError);
    // preload="none" loads nothing until play(); a media fragment starts the short version at 1.5 s.
    v.src = `${BASE}/${theme}.mp4${short ? `#t=${SHORT_FROM}` : ""}`;
    v.play().catch(onError);
    return () => {
      cancelled = true;
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("error", onError);
      v.pause();
      v.removeAttribute("src");
      v.load();
    };
  }, [theme]);

  return (
    <div aria-hidden="true" data-hero-entrance data-state={state} className="hero-entrance">
      <PosterPreloads />
      <ThemedPicture {...poster("start")} className="hero-entrance__start" />
      <ThemedPicture {...poster("end")} className="hero-entrance__end" />
      <video
        ref={video}
        className="hero-entrance__video"
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        tabIndex={-1}
      />
    </div>
  );
}
