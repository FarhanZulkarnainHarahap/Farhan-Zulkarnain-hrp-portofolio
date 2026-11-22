"use client";
/**
 * One small client component drives the page motion (docs/MOTION_PLAN.md):
 *  - [data-intro]: hero intro, one GSAP tween in DOM order (the H1 is never marked), once per visit;
 *  - [data-reveal]: revealed once when it enters the viewport, detected with IntersectionObserver
 *    (no ScrollTrigger, no scroll listeners, no idle rAF loop); [data-reveal="group"] staggers its
 *    children (capped at 6 steps). Each element is unobserved after it is shown.
 * Markup stays server-rendered; this only reads attributes. The observer and tweens live in
 * useGSAP's context and are cleaned up when the pathname changes or on unmount. Reduced motion:
 * nothing runs (see motion()); late content (e.g. after a retry) is never hidden.
 */
import { usePathname } from "next/navigation";
import {
  gsap,
  markMotionReady,
  motion,
  setupGsap,
  tokens,
  useGSAP,
} from "@/lib/gsap";

if (typeof window !== "undefined") setupGsap();

// The hero intro plays once per visit; returning to "/" client-side shows it settled.
let introPlayed = false;

/** Elements still waiting to be revealed (test hook: must never outlive their page). */
const pending = new Set<Element>();
if (typeof window !== "undefined")
  (window as unknown as { __motion?: { pending: () => number } }).__motion = {
    pending: () => pending.size,
  };

export function MotionController() {
  const pathname = usePathname();

  useGSAP(
    (_context, contextSafe) => {
      const main = document.getElementById("main-content");
      if (!main) {
        markMotionReady();
        return;
      }
      const t = tokens();
      motion(() => {
        const intro = introPlayed
          ? []
          : gsap.utils.toArray<HTMLElement>("[data-intro]", main);
        const reveals = new Map<Element, HTMLElement[]>();
        for (const el of gsap.utils.toArray<HTMLElement>("[data-reveal]", main))
          reveals.set(
            el,
            el.dataset.reveal === "group"
              ? (Array.from(el.children) as HTMLElement[])
              : [el],
          );

        // Hide what we animate before the first paint (same frame as markMotionReady).
        const hidden = [...intro, ...[...reveals.values()].flat()];
        if (hidden.length) gsap.set(hidden, { opacity: 0, y: t.distance });

        if (intro.length)
          gsap.to(intro, {
            opacity: 1,
            y: 0,
            duration: t.slow,
            ease: "enter",
            stagger: t.stagger,
            clearProps: "transform",
            onComplete: () => {
              introPlayed = true;
            },
          });

        if (!reveals.size) return;
        const show = contextSafe!((targets: HTMLElement[]) =>
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: t.reveal,
            ease: "enter",
            stagger: (index: number) => Math.min(index, 5) * t.stagger,
            clearProps: "transform",
          }),
        );
        // Bottom margin ≈ "top of element at 85% of the viewport".
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              observer.unobserve(entry.target);
              pending.delete(entry.target);
              show(reveals.get(entry.target) ?? []);
            }
          },
          { rootMargin: "0px 0px -15% 0px" },
        );
        for (const el of reveals.keys()) {
          pending.add(el);
          observer.observe(el);
        }
        return () => {
          observer.disconnect();
          for (const el of reveals.keys()) pending.delete(el);
        };
      });
      markMotionReady();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
