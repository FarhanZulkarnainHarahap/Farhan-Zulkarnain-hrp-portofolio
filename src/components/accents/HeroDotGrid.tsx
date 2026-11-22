"use client";
/**
 * Background accent for the hero visual slot (removable: Fase 10 puts <HeroModel/> in the slot).
 *  - Always renders a light static CSS dot pattern (tokens).
 *  - Loads the WebGL DotGrid (dynamic import, ssr:false) ONLY on desktop with a fine pointer,
 *    without reduced motion, with WebGL2, and once the slot is on screen. Otherwise nothing loads.
 *  - Dot colors are the resolved tokens --dotgrid-base / --dotgrid-active and update on theme
 *    change without a reload.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const DotGrid = dynamic(() => import("./DotGrid"), { ssr: false });

const CAPABLE =
  "(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

let webgl2: boolean | null = null;
function hasWebGL2() {
  if (webgl2 === null) {
    try {
      webgl2 = Boolean(document.createElement("canvas").getContext("webgl2"));
    } catch {
      webgl2 = false;
    }
  }
  return webgl2;
}

function subscribeCapable(onChange: () => void) {
  const media = window.matchMedia(CAPABLE);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const getCapable = () => window.matchMedia(CAPABLE).matches && hasWebGL2();

/** Resolved token colors; changes with data-theme or the OS scheme. */
let probe: HTMLSpanElement | null = null;
function readColors() {
  if (!probe) {
    probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden";
    document.body.appendChild(probe);
  }
  probe.style.color = "var(--dotgrid-base)";
  const base = getComputedStyle(probe).color;
  probe.style.color = "var(--dotgrid-active)";
  const active = getComputedStyle(probe).color;
  const root = getComputedStyle(document.documentElement);
  return [
    base,
    active,
    root.getPropertyValue("--dotgrid-gap"),
    root.getPropertyValue("--dotgrid-size"),
  ].join("|");
}
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

const px = (value: string, fallback: number) => {
  const number = parseFloat(value);
  return Number.isFinite(number) ? number : fallback;
};

export function HeroDotGrid({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const capable = useSyncExternalStore(
    subscribeCapable,
    getCapable,
    () => false,
  );
  const colors = useSyncExternalStore(subscribeTheme, readColors, () => "");

  useEffect(() => {
    const el = ref.current;
    if (!el || !capable) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [capable]);

  const live = capable && visible && Boolean(colors);
  const [base, active, gap, size] = colors.split("|");

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-live={live}
      className={cn(
        "dot-pattern pointer-events-none absolute inset-0 data-[live=true]:bg-none",
        className,
      )}
    >
      {live && (
        <DotGrid
          baseColor={base}
          activeColor={active}
          gap={px(gap, 22)}
          dotSize={px(size, 2)}
          proximity={140}
          intro={false}
          clickShock={false}
          glow={0.3}
          swell={0.5}
          dpr={Math.min(window.devicePixelRatio || 1, 1.5)}
        />
      )}
    </div>
  );
}
