/**
 * Image-sequence helpers for the Blender-rendered interactive assets (Fase 12.5): hover tilt grids
 * and short one-shot sequences (flip). No WebGL: every frame is a pre-rendered AVIF with the canvas
 * colour baked in.
 *
 *  - loadFrames(): fetch + decode every frame once, so swapping <img src> never flashes.
 *  - follow(): eases a 2D value toward a target; requestAnimationFrame runs only while it moves and
 *    stops by itself when it arrives (0 rAF at rest).
 *  - playSequence(): steps through frames at a fixed rate, cancellable.
 */

/** Fetches and decodes all frames; resolves with the URLs that decoded (failures are skipped). */
export async function loadFrames(urls: string[]): Promise<string[]> {
  const decoded = await Promise.all(
    urls.map(async (url) => {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      try {
        await img.decode();
        return url;
      } catch {
        return null;
      }
    }),
  );
  return decoded.filter((u): u is string => u !== null);
}

export type Follower = {
  /** Set a new target (0..1 on both axes); starts the loop if needed. */
  to(x: number, y: number): void;
  /** Current eased value. */
  value(): { x: number; y: number };
  stop(): void;
};

/**
 * Eases toward the target with a critically damped step (≈ the "enter" feel); calls onChange with
 * the eased value every frame it moves, and onRest once it has arrived.
 */
export function follow(
  onChange: (x: number, y: number) => void,
  { rate = 0.18, onRest }: { rate?: number; onRest?: () => void } = {},
): Follower {
  let x = 0.5;
  let y = 0.5;
  let tx = 0.5;
  let ty = 0.5;
  let frame = 0;
  const tick = () => {
    frame = 0;
    x += (tx - x) * rate;
    y += (ty - y) * rate;
    if (Math.abs(tx - x) < 0.002 && Math.abs(ty - y) < 0.002) {
      x = tx;
      y = ty;
      onChange(x, y);
      onRest?.();
      return;
    }
    onChange(x, y);
    frame = requestAnimationFrame(tick);
  };
  return {
    to(nx, ny) {
      tx = Math.min(1, Math.max(0, nx));
      ty = Math.min(1, Math.max(0, ny));
      if (!frame) frame = requestAnimationFrame(tick);
    },
    value: () => ({ x, y }),
    stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}

/** Plays frames from → to (inclusive) at `fps`; returns a cancel function. */
export function playSequence(
  count: number,
  show: (index: number) => void,
  { from = 0, to = count - 1, fps = 30, onDone }: { from?: number; to?: number; fps?: number; onDone?: () => void } = {},
) {
  const step = from <= to ? 1 : -1;
  let i = from;
  let last = 0;
  let frame = 0;
  const tick = (t: number) => {
    if (!last || t - last >= 1000 / fps) {
      last = t;
      show(i);
      if (i === to) {
        frame = 0;
        onDone?.();
        return;
      }
      i += step;
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/** Pointer hover is only for precise pointers that can hover (Fase 12.5 rule). */
export const FINE_HOVER = "(hover: hover) and (pointer: fine)";
export const REDUCED = "(prefers-reduced-motion: reduce)";

/** Runs `onChange(active)` when the element is on screen AND the tab is visible. */
export function whileVisible(el: Element, onChange: (active: boolean) => void, rootMargin = "0px") {
  let onScreen = false;
  const emit = () => onChange(onScreen && document.visibilityState === "visible");
  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      emit();
    },
    { rootMargin },
  );
  io.observe(el);
  document.addEventListener("visibilitychange", emit);
  return () => {
    io.disconnect();
    document.removeEventListener("visibilitychange", emit);
  };
}
