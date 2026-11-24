"use client";
/**
 * Motion runtime (Fase 12.1): everything that needs GSAP, loaded with import() by MotionController
 * after hydration, so GSAP + SplitText (±42 KB gzip) are off the first-paint path and never loaded
 * under reduced motion. Behaviour is unchanged from Fase 8 / 10.5 (see MotionController for the list).
 */
import { gsap, markMotionReady, MOTION_OK, setupGsap, SplitText, tokens } from "@/lib/gsap";

export type MotionState = { introPlayed: Set<string>; pending: Set<Element> };

/** Runs the page motion for `main`; returns the cleanup (reverts every tween and observer). */
export function runMotion(main: HTMLElement, pathname: string, { introPlayed, pending }: MotionState) {
  setupGsap();
  const t = tokens();
  const mm = gsap.matchMedia();
  mm.add(MOTION_OK, (ctx) => {
    // Context-safe wrapper (what useGSAP's contextSafe did): tweens created later, e.g. in the
    // IntersectionObserver callback, are recorded in this context and reverted with it. An empty
    // name makes Context.add return the wrapped function instead of running it.
    const safe = <A extends unknown[]>(fn: (...args: A) => unknown) =>
      ctx.add("", fn as never) as unknown as (...args: A) => void;
        const played = introPlayed.has(pathname);
        const intro = played
          ? []
          : gsap.utils.toArray<HTMLElement>("[data-intro]", main);
        const line = played
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
              introPlayed.add(pathname);
            },
          });
          // Pages use a subset of the steps (PageHeader: line, lead, cta, visual): skip empty ones
          // so GSAP never gets an empty target.
          const at = (targets: HTMLElement[], vars: gsap.TweenVars, position: number) => {
            if (targets.length) tl.to(targets, vars, position);
          };
          if (line)
            tl.to(line, { scaleX: 1, duration: t.base, ease: "standard", clearProps: "transform" }, t.intro.line);
          at(step("eyebrow"), rise, t.intro.eyebrow);
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
          at(others, { ...rise, stagger: t.stagger }, t.intro.lead);
          for (const cta of step("cta")) {
            tl.set(cta, { opacity: 1, y: 0 }, t.intro.cta);
            tl.from(
              Array.from(cta.children),
              { opacity: 0, y: t.distance, duration: t.slow, ease: "enter", stagger: t.stagger * 2, clearProps: "transform" },
              t.intro.cta,
            );
          }
          at(step("status"), rise, t.intro.status);
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
        const draw = safe((d: (typeof drawings)[number]) =>
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
        const show = safe((targets: HTMLElement[]) =>
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
  return () => mm.revert();
}
