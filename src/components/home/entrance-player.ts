/**
 * Entrance player (Fase 12.1): loaded with import() by EntranceLoader only on desktop (lg+) with
 * motion allowed, so phones and reduced motion download no entrance JS at all. Plays the clip of the
 * active theme once (muted, inline, no loop) and drives `data-state` on the container
 * (poster → playing → done; "still" after a later theme switch or an error). A second visit in the
 * same session (sessionStorage) starts at 1.5 s.
 */
const BASE = "/3d/entrance";
const PLAYED_KEY = "fz-entrance";
const SHORT_FROM = 1.5;

export type EntranceTheme = "light" | "dark";

export function playEntrance(root: HTMLElement, v: HTMLVideoElement, initial: EntranceTheme) {
  let finished = false;
  let stop: (() => void) | null = null;
  const set = (state: string) => {
    root.dataset.state = state;
  };

  function start(theme: EntranceTheme) {
    stop?.();
    let short = false;
    try {
      short = sessionStorage.getItem(PLAYED_KEY) === "1";
    } catch {}
    let cancelled = false;
    const onPlaying = () => {
      finished = true;
      set("playing");
    };
    const onEnded = () => {
      try {
        sessionStorage.setItem(PLAYED_KEY, "1");
      } catch {}
      set("done");
    };
    const onError = () => !cancelled && set("still");
    v.addEventListener("playing", onPlaying);
    v.addEventListener("ended", onEnded);
    v.addEventListener("error", onError);
    // preload="none" loads nothing until play(); a media fragment starts the short version at 1.5 s.
    v.src = `${BASE}/${theme}.mp4${short ? `#t=${SHORT_FROM}` : ""}`;
    v.play().catch(onError);
    stop = () => {
      cancelled = true;
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("error", onError);
      v.pause();
      v.removeAttribute("src");
      v.load();
    };
  }

  start(initial);
  return {
    setTheme(theme: EntranceTheme) {
      if (!finished) return start(theme);
      // Theme switched after the entrance: the final frame of the new theme, no replay.
      stop?.();
      stop = null;
      set("still");
    },
    destroy() {
      stop?.();
      stop = null;
    },
  };
}
