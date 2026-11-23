"use client";
/**
 * Hero visual (Fase 10.5): the Fz card entrance, rendered in Blender (scene `Card`, frames 1–61 of
 * the film timeline; see docs/3D_PLAN.md). Decorative (aria-hidden), desktop only (lg+): on phones
 * it would out-size the H1 and take the LCP; the fly-through opens with the same stack there.
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
const PLAYED_KEY = "fz-entrance";
const SHORT_FROM = 1.5;

type State = "poster" | "playing" | "done" | "still";

const poster = (name: "start" | "end") => ({
  base: "/3d/entrance",
  name,
  widths: [284, 568] as const,
  width: 568,
  height: 930,
  // sizes must be a literal length: keep in step with --entrance-width (globals.css).
  sizes: "(min-width: 64rem) 14rem, 1px",
});

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
    v.src = `/3d/entrance/${theme}.mp4${short ? `#t=${SHORT_FROM}` : ""}`;
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
