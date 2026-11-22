"use client";
/**
 * One small client component drives the page motion (Fase 8, docs/MOTION_PLAN.md):
 *  - [data-intro]: hero intro, one timeline in DOM order (the H1 is never marked);
 *  - [data-reveal]: reveal once when entering the viewport; [data-reveal="group"] staggers its
 *    children (stagger capped at 6 steps).
 * Markup stays server-rendered; this only reads attributes. Everything is created inside useGSAP's
 * context and reverted when the pathname changes or the component unmounts, so no ScrollTrigger
 * leaks between pages. Reduced motion: nothing runs (see motion()).
 */
import { usePathname } from "next/navigation";
import {
  gsap,
  markMotionReady,
  motion,
  ScrollTrigger,
  setupGsap,
  tokens,
  useGSAP,
} from "@/lib/gsap";

if (typeof window !== "undefined") setupGsap();

// The hero intro plays once per visit; returning to "/" client-side shows it settled (8.6).
let introPlayed = false;

export function MotionController() {
  const pathname = usePathname();

  useGSAP(
    () => {
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
        const reveals = gsap.utils
          .toArray<HTMLElement>("[data-reveal]", main)
          .map((el) => ({
            trigger: el,
            targets:
              el.dataset.reveal === "group"
                ? (Array.from(el.children) as HTMLElement[])
                : [el],
          }));
        // Hide what we animate before the first paint (same frame as markMotionReady).
        const hidden = [...intro, ...reveals.flatMap((r) => r.targets)];
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

        for (const { trigger, targets } of reveals) {
          ScrollTrigger.create({
            trigger,
            start: "top 85%",
            once: true,
            onEnter: () =>
              gsap.to(targets, {
                opacity: 1,
                y: 0,
                duration: t.reveal,
                ease: "enter",
                stagger: (index: number) => Math.min(index, 5) * t.stagger,
                clearProps: "transform",
              }),
          });
        }
      });
      markMotionReady();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
