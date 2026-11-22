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

        // [data-draw] (Fase 9.2): technical drawings draw their lines once, then labels fade in.
        const drawings = gsap.utils
          .toArray<SVGElement>("[data-draw]", main)
          .map((svg) => ({
            svg,
            lines: Array.from(svg.querySelectorAll<SVGElement>(".draw")),
            fades: Array.from(svg.querySelectorAll<SVGElement>(".draw-fade")),
          }));
        for (const d of drawings) {
          gsap.set(d.lines, { strokeDasharray: 1, strokeDashoffset: 1 });
          gsap.set(d.fades, { opacity: 0 });
        }
        const draw = contextSafe!((d: (typeof drawings)[number]) =>
          gsap
            .timeline()
            .to(d.lines, {
              strokeDashoffset: 0,
              duration: t.reveal,
              ease: "standard",
              stagger: { amount: t.reveal },
              clearProps: "strokeDasharray,strokeDashoffset",
            })
            .to(
              d.fades,
              {
                opacity: 1,
                duration: t.slow,
                ease: "enter",
                stagger: { amount: t.slow },
              },
              `<${t.slow}`,
            ),
        );

        if (!reveals.size && !drawings.length) return;
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
              const drawing = drawings.find((d) => d.svg === entry.target);
              if (drawing) draw(drawing);
              else show(reveals.get(entry.target) ?? []);
            }
          },
          { rootMargin: "0px 0px -15% 0px" },
        );
        const observed = [...reveals.keys(), ...drawings.map((d) => d.svg)];
        for (const el of observed) {
          pending.add(el);
          observer.observe(el);
        }
        return () => {
          observer.disconnect();
          for (const el of observed) pending.delete(el);
        };
      });
      markMotionReady();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
