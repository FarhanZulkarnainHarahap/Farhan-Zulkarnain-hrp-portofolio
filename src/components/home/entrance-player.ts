/**
 * Entrance player (Fase 12.1): loaded with import() by EntranceLoader only on desktop (lg+) with
 * motion allowed, so phones and reduced motion download no entrance JS at all. Plays the clip of the
 * active theme once (muted, inline, no loop) and drives `data-state` on the container
 * (poster → playing → done; "still" after a later theme switch or an error). A second visit in the
 * same session (sessionStorage) starts at 1.5 s.
 *
 * Fase 12.5: when the clip ends, a 4 s idle loop takes over (float + the axis "breathing"); its first
 * frame is the entrance's last frame, so the hand-over has no jump. It plays only while visible and the
 * tab is visible. On precise pointers, hovering tilts the stack (5 × 3 pre-rendered frames, eased,
 * rAF only while moving); leaving eases back to the rest frame and the loop restarts from frame 0.
 */
import { FINE_HOVER, follow, loadFrames, whileVisible, type Follower } from "@/components/interactive/frames";

const BASE = "/3d/entrance";
const COLS = 5;
const ROWS = 3;
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
      startIdle(theme);
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

  // ---- idle loop + hover tilt (after the entrance)
  const idle = root.querySelector<HTMLVideoElement>(".hero-entrance__idle");
  const seq = root.querySelector<HTMLImageElement>(".hero-entrance__seq");
  let idleTheme: EntranceTheme | null = null;
  let stopVisible: (() => void) | null = null;
  let tilt: string[] | null = null;
  let follower: Follower | null = null;
  let hovering = false;
  const tiltUrl = (theme: EntranceTheme, r: number, c: number) => `${BASE}/${theme}/tilt-r${r}c${c}.avif`;
  const playIdle = () => {
    if (!idle || hovering) return;
    idle.play().then(() => !hovering && set("idle")).catch(() => {});
  };
  function startIdle(theme: EntranceTheme) {
    if (!idle) return;
    stopIdle();
    idleTheme = theme;
    idle.src = `${BASE}/${theme}-idle.mp4`;
    stopVisible = whileVisible(root, (active) => (active ? playIdle() : idle.pause()));
  }
  function stopIdle() {
    stopVisible?.();
    stopVisible = null;
    if (idle) {
      idle.pause();
      idle.removeAttribute("src");
      idle.load();
    }
    idleTheme = null;
    tilt = null;
  }
  const onEnter = () => {
    if (!idleTheme || !seq || !window.matchMedia(FINE_HOVER).matches) return;
    const theme = idleTheme;
    hovering = true;
    if (!tilt) {
      const urls: string[] = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) urls.push(tiltUrl(theme, r, c));
      loadFrames(urls).then((ok) => (tilt = ok));
    }
    follower ??= follow(
      (x, y) => {
        if (!tilt || !idleTheme) return;
        const url = tiltUrl(idleTheme, Math.round(y * (ROWS - 1)), Math.round(x * (COLS - 1)));
        if (seq.getAttribute("src") !== url) seq.src = url;
      },
      {
        onRest: () => {
          if (hovering || !idle) return;
          idle.currentTime = 0;
          playIdle();
        },
      },
    );
    idle?.pause();
    seq.src = tiltUrl(theme, 1, 2);
    set("tilt");
  };
  const onMove = (e: PointerEvent) => {
    if (!hovering || !follower) return;
    const box = root.getBoundingClientRect();
    follower.to((e.clientX - box.left) / box.width, (e.clientY - box.top) / box.height);
  };
  const onLeave = () => {
    if (!hovering) return;
    hovering = false;
    follower?.to(0.5, 0.5);
  };
  root.addEventListener("pointerenter", onEnter);
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);

  start(initial);
  return {
    setTheme(theme: EntranceTheme) {
      if (!finished) return start(theme);
      // Theme switched after the entrance: the final frame of the new theme, no replay; the idle loop
      // continues with the new theme's clip.
      stop?.();
      stop = null;
      set("still");
      startIdle(theme);
    },
    destroy() {
      stop?.();
      stop = null;
      stopIdle();
      follower?.stop();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    },
  };
}
