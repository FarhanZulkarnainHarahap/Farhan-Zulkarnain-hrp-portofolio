/**
 * Scroll-scrub engine for the home fly-through (Fase 10.5). A TypeScript port of the core of the
 * scroll-world skill's `references/scrub-engine.js`, adapted to one section of a Next.js page:
 *
 * Kept from the skill engine:
 *  - the segment chain (scene clips + connectors) with per-segment scroll weights and `linger`
 *    (the camera settles mid-scene; f(0) = 0, f(1) = 1 so seam frames are untouched);
 *  - clips fetched as Blobs and played from object URLs (always seekable, no byte-range need);
 *  - lazy loading when a segment comes within 1.6 screens (after the first scroll, so nothing
 *    competes with the first paint); a short opacity crossfade at seams;
 *  - seek coalescing (never a new currentTime while the decoder is still seeking), a coarser seek
 *    step on phones, iOS priming on the first gesture, and ignoring URL-bar-only resizes.
 *
 * Changed for this site:
 *  - scoped to a section: the stage is sticky inside it (no fixed full-page layers, no global
 *    html/body styles, no injected CSS — styles live in globals.css with design tokens);
 *  - no top nav, brand, route rail, scroll bar, hint or particles/atmosphere (DESIGN.md: no loops);
 *    the copy is server-rendered markup that the caller animates from the progress callback;
 *  - requestAnimationFrame runs only while a clip is converging on its target (0 rAF when idle);
 *  - destroy() removes every listener, aborts fetches, removes the videos and revokes their URLs;
 *  - sources are per theme (the renders carry the canvas colour) and can be swapped.
 */

export type ScrubSegment = {
  /** Element the <video> is appended to (it holds the still poster too). */
  media: HTMLElement;
  /** Clip URL for the current theme / viewport, or null (still only). */
  clip: () => string | null;
  /** Scroll length of this segment, in screens. */
  weight: number;
  /** 0..1, camera dwell mid-segment (≤ 0.6). */
  linger?: number;
};

export type ScrubOptions = {
  root: HTMLElement;
  segments: ScrubSegment[];
  /** Seam dissolve width, in screens. */
  crossfade?: number;
  /** Called on every scroll read with each segment's local progress (0..1) and opacity. */
  onUpdate?: (state: { progress: number[]; opacity: number[]; active: number; total: number }) => void;
};

type Seg = ScrubSegment & {
  start: number;
  end: number;
  video: HTMLVideoElement | null;
  url: string | null;
  loading: AbortController | null;
  ready: boolean;
  cur: number;
  target: number;
  visible: boolean;
};

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
const lingerEase = (x: number, l: number) => {
  l = clamp(l);
  const c = x - 0.5;
  return (1 - l) * x + l * (4 * c * c * c + 0.5);
};

export function mountScrub({ root, segments, crossfade = 0.12, onUpdate }: ScrubOptions) {
  const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const small = window.matchMedia("(max-width: 53.75rem)");
  const isMobile = () => coarse || small.matches;
  const segs: Seg[] = segments.map((s) => ({
    ...s,
    start: 0,
    end: 0,
    video: null,
    url: null,
    loading: null,
    ready: false,
    cur: 0,
    target: 0,
    visible: false,
  }));
  const total = segs.reduce((sum, s) => sum + s.weight, 0);
  let vh = window.innerHeight;
  let top = 0;
  let laidOutW = window.innerWidth;
  let frame = 0;
  let reading = 0;
  let userReady = false;
  let scrolled = false;
  let destroyed = false;

  function layout() {
    vh = window.innerHeight;
    laidOutW = window.innerWidth;
    root.style.setProperty("--flight-length", String(total + 1));
    let off = 0;
    for (const s of segs) {
      s.start = off * vh;
      off += s.weight;
      s.end = off * vh;
    }
    top = root.getBoundingClientRect().top + window.scrollY;
    read();
  }

  function unload(s: Seg) {
    s.loading?.abort();
    s.loading = null;
    if (s.video) {
      s.video.pause();
      s.video.removeAttribute("src");
      s.video.load();
      s.video.remove();
    }
    if (s.url) URL.revokeObjectURL(s.url);
    s.video = null;
    s.url = null;
    s.ready = false;
    s.media.classList.remove("has-clip");
  }

  function prime(v: HTMLVideoElement | null) {
    if (!isMobile() || !v) return;
    v.play()
      .then(() => v.pause())
      .catch(() => {});
  }

  function load(s: Seg) {
    const src = s.clip();
    if (s.loading || s.video || !src) return;
    const ctrl = new AbortController();
    s.loading = ctrl;
    fetch(src, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => {
        if (ctrl.signal.aborted || destroyed) return;
        const v = document.createElement("video");
        v.className = "flight-video";
        v.muted = true;
        v.playsInline = true;
        v.preload = "auto";
        v.setAttribute("muted", "");
        v.setAttribute("playsinline", "");
        v.setAttribute("aria-hidden", "true");
        v.tabIndex = -1;
        s.url = URL.createObjectURL(blob);
        v.src = s.url;
        v.addEventListener("loadedmetadata", () => {
          s.ready = true;
          // One seek right away, even to 0: the still is hidden on the first "seeked".
          s.cur = s.target;
          v.currentTime = clamp(s.target, 0, 0.999) * (v.duration || 1);
          kick();
        });
        // Hide the still only once a real frame has painted (iOS paints nothing before a seek).
        v.addEventListener("seeked", () => s.media.classList.add("has-clip"), { once: true });
        v.addEventListener("loadeddata", () => {
          v.pause();
          if (userReady) prime(v);
        });
        s.media.appendChild(v);
        s.video = v;
        s.loading = null;
      })
      .catch(() => {
        s.loading = null;
      });
  }

  function read() {
    reading = 0;
    const y = window.scrollY - top;
    const fade = crossfade * vh;
    let active = 0;
    segs.forEach((s, i) => {
      if (y >= s.start) active = i;
    });
    const progress: number[] = [];
    const opacity: number[] = [];
    segs.forEach((s, i) => {
      // Prefetch within 1.6 screens, but only once the visitor scrolls (or the segment is on screen):
      // nothing competes with the first paint.
      const near = y > s.start - 1.6 * vh && y < s.end + 1.6 * vh;
      if (near && (scrolled || y > s.start - 0.25 * vh)) load(s);
      const local = clamp((y - s.start) / (s.end - s.start));
      s.target = s.linger ? lingerEase(local, s.linger) : local;
      const outside = y < s.start ? s.start - y : y > s.end ? y - s.end : 0;
      // The first segment is fully visible before the section starts, the last one after it ends.
      const op = (i === 0 && y < s.start) || (i === segs.length - 1 && y > s.end) ? 1 : smooth(1 - outside / fade);
      s.media.style.opacity = String(op);
      s.media.style.zIndex = i === active ? "2" : "1";
      s.visible = op > 0.001;
      progress.push(local);
      opacity.push(op);
    });
    onUpdate?.({ progress, opacity, active, total });
    kick();
  }

  function tick() {
    frame = 0;
    const eps = isMobile() ? 0.02 : 0.008;
    let busy = false;
    for (const s of segs) {
      const v = s.video;
      if (!v || !s.ready) continue;
      if (v.seeking) {
        busy = true;
        continue;
      }
      if (Math.abs(s.cur - s.target) < 0.0005) {
        s.cur = s.target;
        continue;
      }
      s.cur += (s.target - s.cur) * 0.18;
      const t = clamp(s.cur, 0, 0.999) * (v.duration || 1);
      if (Math.abs(v.currentTime - t) > eps) v.currentTime = t;
      busy = true;
    }
    if (busy) frame = requestAnimationFrame(tick);
  }

  /** Starts the rAF loop if a clip still has to reach its target; it stops by itself when idle. */
  function kick() {
    if (!frame && !destroyed) frame = requestAnimationFrame(tick);
  }

  const onScroll = () => {
    scrolled = true;
    if (!reading) reading = requestAnimationFrame(read);
  };
  const onResize = () => {
    if (coarse && window.innerWidth === laidOutW) return;
    layout();
  };
  const onGesture = () => {
    if (userReady) return;
    userReady = true;
    for (const s of segs) prime(s.video);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", layout);
  window.addEventListener("pointerdown", onGesture, { once: true, passive: true });
  window.addEventListener("touchstart", onGesture, { once: true, passive: true });
  layout();

  return {
    /** Reload the clips (e.g. after a theme switch); the stills stay up until the new frames paint. */
    reload() {
      for (const s of segs) unload(s);
      read();
    },
    relayout: layout,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(reading);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", layout);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      for (const s of segs) {
        unload(s);
        s.media.style.opacity = "";
        s.media.style.zIndex = "";
      }
      root.style.removeProperty("--flight-length");
    },
  };
}
