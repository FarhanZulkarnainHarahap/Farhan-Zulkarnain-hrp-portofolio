"use client";
/**
 * One small client component drives the page motion (docs/MOTION_PLAN.md):
 *  - [data-intro]: hero intro, once per visit (the H1 and the header are never marked). Fase 10.5
 *    timeline, start times from the --intro-* tokens: accent line under the H1 draws left → right,
 *    eyebrow, lead line by line (SplitText, reverted afterwards), CTAs one after the other, status
 *    (+ the ShinyText sweep), then the scroll hint with a single nudge. Unnamed [data-intro]
 *    elements follow the lead;
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
  SplitText,
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
        const line = introPlayed
          ? null
          : main.querySelector<HTMLElement>("[data-intro-line]");
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
        if (line) gsap.set(line, { scaleX: 0 });

        let split: SplitText | null = null;
        if (intro.length || line) {
          const step = (name: string) => intro.filter((el) => el.dataset.intro === name);
          const known = ["eyebrow", "lead", "cta", "status", "hint"];
          const rise = { opacity: 1, y: 0, duration: t.slow, ease: "enter", clearProps: "transform" };
          const tl = gsap.timeline({
            onComplete: () => {
              introPlayed = true;
            },
          });
          if (line)
            tl.to(line, { scaleX: 1, duration: t.base, ease: "standard", clearProps: "transform" }, t.intro.line);
          tl.to(step("eyebrow"), rise, t.intro.eyebrow);
          const lead = step("lead");
          if (lead.length) {
            tl.set(lead, { opacity: 1, y: 0 }, t.intro.lead);
            split = SplitText.create(lead, { type: "lines", mask: "lines" });
            tl.from(
              split.lines,
              { yPercent: 100, duration: t.slow, ease: "enter", stagger: t.stagger, onComplete: () => split?.revert() },
              t.intro.lead,
            );
          }
          const others = intro.filter((el) => !known.includes(el.dataset.intro ?? ""));
          if (others.length) tl.to(others, { ...rise, stagger: t.stagger }, t.intro.lead);
          for (const cta of step("cta")) {
            tl.set(cta, { opacity: 1, y: 0 }, t.intro.cta);
            tl.from(
              Array.from(cta.children),
              { opacity: 0, y: t.distance, duration: t.slow, ease: "enter", stagger: t.stagger * 2, clearProps: "transform" },
              t.intro.cta,
            );
          }
          tl.to(step("status"), rise, t.intro.status);
          const hint = step("hint");
          if (hint.length) {
            tl.to(hint, rise, t.intro.hint);
            // One gentle nudge of the arrow, no loop.
            tl.to(
              hint.map((el) => el.querySelector("span > span")),
              { y: t.distance / 2, duration: t.base, ease: "standard", yoyo: true, repeat: 1 },
              ">",
            );
          }
        }

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

        const revertSplit = () => split?.revert();
        if (!reveals.size && !drawings.length) return revertSplit;
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
          revertSplit();
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
