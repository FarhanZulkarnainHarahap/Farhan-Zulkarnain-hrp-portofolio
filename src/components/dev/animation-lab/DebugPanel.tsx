"use client";
/**
 * Lab debug panel (Fase K3). Low-frequency values come from the shared snapshot / registry
 * (React, re-render on change only). Per-frame values (FPS, scroll, velocity, Theatre position)
 * are written into the DOM from the shared ticker's render phase, ~10 times per second, through
 * refs — the panel itself never re-renders per frame.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAnimationState } from "@/components/animation/hooks";
import { durationViolations } from "@/lib/animation/config";
import { animationRegistry } from "@/lib/animation/registry";
import { getScrollEngine } from "@/lib/animation/scroll";
import { animationStore } from "@/lib/animation/state";
import { addTick, tickerStats } from "@/lib/animation/ticker";

type Live = { timeline: () => string };

function useRegistryVersion() {
  const version = useRef(0);
  return useSyncExternalStore(
    (cb) =>
      animationRegistry.subscribe(() => {
        version.current++;
        cb();
      }),
    () => version.current,
    () => 0,
  );
}

export function DebugPanel({ live }: { live: Live }) {
  const s = useAnimationState((x) => x);
  useRegistryVersion();
  const animations = animationRegistry.list();
  const playing = animations.filter((a) => a.status === "playing");
  const [violations] = useState(() => durationViolations());
  const fps = useRef<HTMLElement>(null);
  const scroll = useRef<HTMLElement>(null);
  const velocity = useRef<HTMLElement>(null);
  const timeline = useRef<HTMLElement>(null);
  const ticker = useRef<HTMLElement>(null);
  const liveRef = useRef(live);
  useEffect(() => {
    liveRef.current = live;
  });

  useEffect(() => {
    let frames = 0;
    let since = performance.now();
    return addTick("render", (_t, _d, now) => {
      frames++;
      if (now - since < 100) return;
      const rate = (frames * 1000) / (now - since);
      frames = 0;
      since = now;
      const f = animationStore.frame.scroll;
      if (fps.current) fps.current.textContent = rate.toFixed(0);
      if (scroll.current) scroll.current.textContent = `${(f.progress * 100).toFixed(1)}% · ${Math.round(f.y)} px`;
      if (velocity.current) velocity.current.textContent = `${f.velocity.toFixed(2)} (${f.direction > 0 ? "down" : f.direction < 0 ? "up" : "rest"})`;
      if (timeline.current) timeline.current.textContent = liveRef.current.timeline();
      if (ticker.current) {
        const st = tickerStats();
        ticker.current.textContent = `scroll ${st.scroll} · timeline ${st.timeline} · render ${st.render}`;
      }
    });
  }, []);

  const rows: [string, React.ReactNode, string?][] = [
    ["FPS", <span key="fps" ref={fps} data-testid="debug-fps">–</span>],
    ["Scroll progress", <span key="sp" ref={scroll} data-testid="debug-scroll">–</span>],
    ["Scroll velocity", <span key="sv" ref={velocity} data-testid="debug-velocity">–</span>],
    ["Scroll engine", s.smoothScroll ? "Lenis (smooth wheel)" : (getScrollEngine()?.kind ?? "none"), "debug-engine"],
    ["Active section", s.activeSection ?? "–", "debug-section"],
    ["Active animations", playing.length ? playing.map((a) => `${a.id} (${a.owner})`).join(", ") : `none playing · ${animations.length} registered`, "debug-animations"],
    ["Active timeline", <span key="tl" ref={timeline} data-testid="debug-timeline">–</span>],
    ["Device quality", s.quality, "debug-quality"],
    ["WebGL", s.webgl, "debug-webgl"],
    ["Reduced motion", s.reducedMotion ? "on" : "off", "debug-reduced"],
    ["Hovered / selected", `${s.hovered ?? "–"} / ${s.selected ?? "–"}`, "debug-pointer"],
    ["Ticker phases", <span key="tk" ref={ticker} data-testid="debug-ticker">–</span>],
    ["Duration tokens", violations.length ? violations.join("; ") : "all within range", "debug-tokens"],
  ];

  return (
    <aside
      aria-label="Animation debug"
      data-lenis-prevent
      className="site-scheme fixed bottom-3 left-3 z-(--z-overlay) max-h-[45svh] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto border border-hairline bg-(--nav-bg) p-3 font-meta text-[0.6875rem] leading-relaxed text-body backdrop-blur-md"
    >
      <p className="mb-2 text-label text-ink uppercase">Debug</p>
      <dl className="grid grid-cols-[8.5rem_1fr] gap-x-3">
        {rows.map(([label, value, testid]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="min-w-0 break-words text-ink" data-testid={testid}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
