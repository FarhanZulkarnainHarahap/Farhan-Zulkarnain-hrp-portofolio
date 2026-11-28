"use client";
/**
 * /dev/animation-lab (Fase K3, development only): twelve working demos proving the engines run
 * together through the shared infrastructure — not just that they are installed.
 *
 *  1 GSAP masked text reveal         7 Theatre.js timeline (play / pause / reverse / reset)
 *  2 Lenis smooth scrolling          8 React Three Fiber scene (sticky, right column)
 *  3 ScrollTrigger progress          9 GSAP ScrollTrigger ↔ Theatre sequence sync
 *  4 Motion hover                   10 Scroll + hover + click + idle on ONE 3D object
 *  5 Motion click / states          11 Bottom-to-top masking (GLSL on the object, clip-path DOM)
 *  6 Idle floating                  12 Reduced-motion mode (live override)
 *
 * Everything is registered in the AnimationRegistry with its owner, so the debug panel lists what
 * runs and a conflicting claim is refused (demo 10).
 *
 * Fase K4 adds 13 (persistent global canvas & scene manager) and 14 (3D masking prototype), see
 * CanvasLab.tsx. The K3 demo canvas (8) stays a separate canvas of its own, only on this dev page.
 */
import dynamic from "next/dynamic";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { m } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { AnimatedIcon } from "@/components/animated/AnimatedIcon";
import { AnimatedLink } from "@/components/animated/AnimatedLink";
import { AnimatedPanel } from "@/components/animated/AnimatedPanel";
import { AnimatedSection } from "@/components/animated/AnimatedSection";
import { MagneticButton } from "@/components/animated/MagneticButton";
import { MaskedText } from "@/components/animated/MaskedText";
import { StaggerContainer, StaggerItem } from "@/components/animated/StaggerContainer";
import { MotionProvider } from "@/components/animation/MotionProvider";
import { setReducedMotionOverride } from "@/components/animation/ReducedMotionProvider";
import { TheatreProvider, useTheatre } from "@/components/animation/TheatreProvider";
import { useAnimationState } from "@/components/animation/hooks";
import { ENGINE_RESPONSIBILITY, OWNERSHIP_RULES, TRANSFORM_LAYERS, type AnimationEngine } from "@/lib/animation/config";
import { directionalReveal, maskedTextReveal, registerGsap, scrollProgress } from "@/lib/animation/gsap-utils";
import { idleVariants, type UiState } from "@/lib/animation/motion-variants";
import { animationRegistry, OwnershipError } from "@/lib/animation/registry";
import { acquireScrollLock, scrollToTarget } from "@/lib/animation/scroll";
import { animationStore } from "@/lib/animation/state";
import { addTick } from "@/lib/animation/ticker";
import { Container } from "@/components/ui/container";
import { CanvasLab } from "./CanvasLab";
import { DebugPanel } from "./DebugPanel";
import type { LabSignals } from "./LabScene";

const LabScene = dynamic(() => import("./LabScene"), {
  ssr: false,
  loading: () => <p className="p-6 font-meta text-label text-muted uppercase">Loading WebGL scene…</p>,
});

/** Writes `read()` into the element ~10× per second from the shared ticker (no React state). */
function useLiveText(ref: RefObject<HTMLElement | null>, read: () => string) {
  const reader = useRef(read);
  useEffect(() => {
    reader.current = read;
  });
  useEffect(() => {
    let last = 0;
    return addTick("render", (_t, _d, now) => {
      if (now - last < 100 || !ref.current) return;
      last = now;
      ref.current.textContent = reader.current();
    });
  }, [ref]);
}

function Demo({ n, id, title, owner, children, tall, intro }: { n: number; id: string; title: string; owner: AnimationEngine[]; children: ReactNode; tall?: boolean; intro: string }) {
  return (
    <section id={id} data-section={id} aria-labelledby={`${id}-title`} className={`border-t border-hairline py-12 ${tall ? "min-h-[140svh]" : "min-h-[70svh]"}`}>
      <p className="font-meta text-label text-muted uppercase">
        {String(n).padStart(2, "0")} · {owner.join(" + ")}
      </p>
      <h2 id={`${id}-title`} className="mt-3 font-display text-headline text-ink uppercase">
        {title}
      </h2>
      <p className="mt-3 max-w-reading text-small text-body">{intro}</p>
      <div className="mt-8 flex flex-col gap-6">{children}</div>
    </section>
  );
}

const status = "font-meta text-meta text-muted";

// ── 1 ─────────────────────────────────────────────────────────────────────────
function MaskedTextDemo() {
  const ref = useRef<HTMLHeadingElement>(null);
  const [run, setRun] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.state = "playing";
    const { timeline, revert } = maskedTextReveal(el, { type: "lines" });
    timeline.eventCallback("onComplete", () => {
      el.dataset.state = "done";
    });
    const handle = registerGsap({ id: "lab:masked-text", owner: "gsap", target: "lab-masked-text", properties: ["transform"], timeline: "Masked text reveal" }, timeline, revert);
    return () => handle.dispose();
  }, [run]);
  return (
    <>
      <h3 ref={ref} data-testid="lab-masked" className="font-display text-display-lg text-ink uppercase">
        Kinetic systems reveal line by line
      </h3>
      <div>
        <AnimatedButton variant="secondary" onClick={() => setRun((r) => r + 1)}>
          Replay reveal
        </AnimatedButton>
      </div>
    </>
  );
}

// ── 2 ─────────────────────────────────────────────────────────────────────────
function LenisDemo() {
  const smooth = useAnimationState((s) => s.smoothScroll);
  const locks = useAnimationState((s) => s.scrollLocks);
  const lock = () => {
    const release = acquireScrollLock();
    window.setTimeout(release, 2000);
  };
  return (
    <>
      <p data-testid="lab-lenis-engine" className={status}>
        Engine: {smooth ? "Lenis (smooth wheel, native touch)" : "native scrolling"} · scroll locks: {locks}
      </p>
      <div className="flex flex-wrap gap-3">
        <AnimatedButton variant="secondary" data-testid="lab-scroll-to" onClick={() => scrollToTarget("#lab-theatre")}>
          Programmatic scroll to 07
        </AnimatedButton>
        <a href="#lab-scene" data-testid="lab-anchor" className="inline-flex min-h-(--hit-area-min) items-center text-small text-ink underline underline-offset-4">
          Anchor link to 08
        </a>
        <AnimatedButton variant="ghost" data-testid="lab-lock" onClick={lock}>
          Lock scroll for 2 s
        </AnimatedButton>
      </div>
    </>
  );
}

// ── 3 ─────────────────────────────────────────────────────────────────────────
function ScrollProgressDemo({ section }: { section: RefObject<HTMLDivElement | null> }) {
  const bar = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!section.current) return;
    const st = scrollProgress(
      section.current,
      (p) => {
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
        if (label.current) label.current.textContent = `${(p * 100).toFixed(1)}%`;
      },
      { start: "top center", end: "bottom center" },
    );
    const handle = registerGsap({ id: "lab:scroll-progress", owner: "scrolltrigger", target: "lab-progress-bar", properties: ["scaleX"], timeline: "Section progress" }, st);
    return () => handle.dispose();
  }, [section]);
  return (
    <div className="sticky top-[calc(var(--nav-height)+1rem)] flex flex-col gap-2">
      <div className="h-1 w-full bg-hairline">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
      <p ref={label} data-testid="lab-progress" className={status}>
        0.0%
      </p>
    </div>
  );
}

// ── 4 / 5 ─────────────────────────────────────────────────────────────────────
function MotionHoverDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <AnimatedButton variant="secondary" data-testid="lab-hover-button">
        Hover lift
      </AnimatedButton>
      <MagneticButton>
        <AnimatedButton variant="primary">
          Magnetic <ArrowUpRight aria-hidden="true" />
        </AnimatedButton>
      </MagneticButton>
      <AnimatedLink href="#lab-motion-hover" icon={<ArrowUpRight className="size-4" />}>
        Animated link
      </AnimatedLink>
      <span className="inline-flex items-center gap-2 text-small text-body">
        Icon <AnimatedIcon motion="spin"><Sparkles className="size-5 text-accent" /></AnimatedIcon>
      </span>
    </div>
  );
}

function MotionClickDemo() {
  const [state, setState] = useState<UiState>("idle");
  // Every state the button went through (the test reads it, so slow frames cannot hide a state).
  const [history, setHistory] = useState<UiState[]>(["idle"]);
  const [open, setOpen] = useState(false);
  const turn = useRef(0);
  // A ref, not the rendered state: two clicks before the next render must not start two requests.
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const go = (next: UiState) => {
    setState(next);
    setHistory((h) => [...h, next]);
  };
  const submit = () => {
    if (busy.current) return; // rapid clicks are ignored while busy
    busy.current = true;
    go("loading");
    const ok = turn.current++ % 2 === 0;
    timers.current.push(
      window.setTimeout(() => go(ok ? "success" : "error"), 700),
      window.setTimeout(() => {
        busy.current = false;
        go("idle");
      }, 1900),
    );
  };
  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <AnimatedButton data-testid="lab-click-button" state={state} onClick={submit}>
          {state === "loading" ? "Sending…" : state === "success" ? "Sent" : state === "error" ? "Failed, retry" : "Submit (alternates success / error)"}
        </AnimatedButton>
        <AnimatedButton variant="secondary" state="disabled">
          Disabled
        </AnimatedButton>
        <AnimatedButton variant="ghost" aria-expanded={open} aria-controls="lab-panel" data-testid="lab-panel-toggle" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide panel" : "Show panel"}
        </AnimatedButton>
      </div>
      <p data-testid="lab-click-state" data-history={history.join(",")} className={status}>
        State: {state}
      </p>
      <AnimatedPanel open={open} id="lab-panel" className="border border-hairline bg-surface p-5 text-small text-body">
        AnimatePresence panel: spam the toggle — each click interrupts the running enter/exit instead of stacking.
      </AnimatedPanel>
      <StaggerContainer as="ul" className="grid grid-cols-3 gap-3">
        {["Stagger", "Container", "Items"].map((label) => (
          <StaggerItem as="li" key={label} className="border border-hairline p-3 font-meta text-label text-ink uppercase">
            {label}
          </StaggerItem>
        ))}
      </StaggerContainer>
    </>
  );
}

// ── 6 ─────────────────────────────────────────────────────────────────────────
function IdleDemo() {
  const variants = useMemo(() => idleVariants(), []);
  return (
    <div className="flex items-center gap-6">
      <m.div variants={variants} animate="idle" className="size-16 border border-accent bg-accent/10" data-testid="lab-idle" />
      <p className={status}>DOM idle: Motion loop (--idle-float-period). 3D idle: float + breath + spin in the scene&apos;s idle layer.</p>
    </div>
  );
}

// ── 7 ─────────────────────────────────────────────────────────────────────────
function TheatreDemo({ setTimelineReader }: { setTimelineReader: (read: () => string) => void }) {
  const { status: theatreStatus, runtime } = useTheatre();
  const reduced = useAnimationState((s) => s.reducedMotion);
  const [, rerender] = useState(0);
  useEffect(() => animationRegistry.subscribe(() => rerender((n) => n + 1)), []);

  useEffect(() => {
    if (!runtime) return;
    const sheet = runtime.sheet("lab");
    const seq = sheet.sequence;
    const play = (direction: "normal" | "reverse") => void seq.play({ iterationCount: Infinity, direction, rafDriver: runtime.driver });
    const handle = animationRegistry.register(
      { id: "lab:theatre", owner: "theatre", target: "lab-object/choreography", properties: ["position", "rotation", "scale"], timeline: "Animation Lab" },
      {
        play: () => play("normal"),
        resume: () => play("normal"),
        reverse: () => play("reverse"),
        pause: () => seq.pause(),
        reset: () => {
          seq.pause();
          seq.position = 0;
        },
        dispose: () => seq.pause(),
      },
    );
    const material = animationRegistry.register(
      { id: "lab:theatre-material", owner: "theatre", target: "lab-object/material", properties: ["roughness", "metalness", "emissiveIntensity"] },
      { dispose: () => {} },
    );
    const length = runtime.length(sheet);
    setTimelineReader(() => `Animation Lab · ${seq.position.toFixed(2)} / ${length} s · ${handle.status()}`);
    if (!animationStore.get().reducedMotion) handle.play();
    return () => {
      handle.dispose();
      material.dispose();
      setTimelineReader(() => "–");
    };
  }, [runtime, setTimelineReader]);

  useEffect(() => {
    if (reduced) animationRegistry.get("lab:theatre")?.reset();
  }, [reduced, runtime]);

  const h = animationRegistry.get("lab:theatre");
  return (
    <>
      <p data-testid="lab-theatre-status" className={status}>
        Theatre: {theatreStatus}
        {runtime ? ` · studio ${runtime.studio ? "loaded (development)" : "off"} · sequence ${h?.status() ?? "–"}` : ""}
      </p>
      <div className="flex flex-wrap gap-3">
        <AnimatedButton variant="secondary" data-testid="lab-theatre-play" disabled={!h || reduced} onClick={() => h?.play()}>
          Play
        </AnimatedButton>
        <AnimatedButton variant="secondary" data-testid="lab-theatre-pause" disabled={!h} onClick={() => h?.pause()}>
          Pause
        </AnimatedButton>
        <AnimatedButton variant="secondary" disabled={!h || reduced} onClick={() => h?.reverse()}>
          Reverse
        </AnimatedButton>
        <AnimatedButton variant="ghost" disabled={!h} onClick={() => h?.reset()}>
          Reset
        </AnimatedButton>
      </div>
    </>
  );
}

// ── 9 / 10 / 11 ───────────────────────────────────────────────────────────────
function TheatreSyncDemo({ range, signals }: { range: RefObject<HTMLDivElement | null>; signals: RefObject<LabSignals> }) {
  const { runtime } = useTheatre();
  const out = useRef<HTMLParagraphElement>(null);
  useLiveText(out, () => {
    const m = signals.current.mask;
    const pos = runtime ? runtime.sheet("scrollMask").sequence.position : 0;
    return `Scroll Masking position ${pos.toFixed(3)} → mask progress ${m.progress.toFixed(3)}, dissolve ${m.dissolve.toFixed(3)}`;
  });
  useEffect(() => {
    if (!runtime || !range.current) return;
    const sheet = runtime.sheet("scrollMask");
    const length = runtime.length(sheet) || 1;
    const st = scrollProgress(range.current, (p) => {
      sheet.sequence.position = p * length;
    }, { start: "top center", end: "bottom center" });
    const handle = registerGsap(
      { id: "lab:theatre-sync", owner: "scrolltrigger", target: "theatre:Scroll Masking", properties: ["sequence.position"], timeline: "Scroll Masking (scroll-synced)" },
      st,
    );
    return () => handle.dispose();
  }, [runtime, range]);
  return (
    <p ref={out} data-testid="lab-sync" className={status}>
      –
    </p>
  );
}

function CombinedDemo({ section, signals }: { section: RefObject<HTMLDivElement | null>; signals: RefObject<LabSignals> }) {
  const hovered = useAnimationState((s) => s.hovered);
  const selected = useAnimationState((s) => s.selected);
  const out = useRef<HTMLParagraphElement>(null);
  const [conflict, setConflict] = useState("");
  useLiveText(out, () => `Scroll layer rotation ${(signals.current.scrollProgress * 180).toFixed(0)}° · frames ${signals.current.frames}`);
  useEffect(() => {
    if (!section.current) return;
    const st = scrollProgress(section.current, (p) => {
      signals.current.scrollProgress = p;
    }, { start: "top bottom", end: "bottom top" });
    const handle = registerGsap({ id: "lab:object-scroll", owner: "scrolltrigger", target: "lab-object/scroll", properties: ["rotation"], timeline: "Object scroll layer" }, st);
    const interaction = animationRegistry.register(
      { id: "lab:object-interaction", owner: "maath", target: "lab-object/interaction", properties: ["position", "rotation", "scale"], scope: "route" },
      { dispose: () => {} },
    );
    const idle = animationRegistry.register({ id: "lab:object-idle", owner: "r3f", target: "lab-object/idle", properties: ["position", "rotation", "scale"] }, { dispose: () => {} });
    return () => {
      handle.dispose();
      interaction.dispose();
      idle.dispose();
    };
  }, [section, signals]);
  const tryConflict = () => {
    try {
      const h = animationRegistry.register({ id: "lab:conflict", owner: "motion", target: "lab-object/scroll", properties: ["rotation"] }, { dispose: () => {} });
      h.dispose();
      setConflict("Accepted (unexpected)");
    } catch (error) {
      setConflict(error instanceof OwnershipError ? `Refused: ${error.message}` : String(error));
    }
  };
  return (
    <>
      <p ref={out} data-testid="lab-combined" className={status}>
        –
      </p>
      <p data-testid="lab-pointer" className={status}>
        Hovered: {hovered ?? "–"} · selected: {selected ?? "–"} (hover / click the object)
      </p>
      <div>
        <AnimatedButton variant="secondary" data-testid="lab-conflict" onClick={tryConflict}>
          Try a conflicting claim (Motion on the scroll layer)
        </AnimatedButton>
      </div>
      {conflict ? (
        <p data-testid="lab-conflict-result" className="text-small text-ink">
          {conflict}
        </p>
      ) : null}
      <ol className="grid gap-1 font-meta text-meta text-body">
        {TRANSFORM_LAYERS.map((l) => (
          <li key={l.layer}>
            {l.layer} — {l.owner}: {l.drives}
          </li>
        ))}
      </ol>
    </>
  );
}

function MaskDemo() {
  const panel = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!run || !panel.current) return;
    const tween = directionalReveal(panel.current, "up");
    const handle = registerGsap({ id: "lab:dom-mask", owner: "gsap", target: "lab-mask-panel", properties: ["clipPath"], timeline: "DOM clip-path reveal" }, tween);
    return () => handle.dispose();
  }, [run]);
  return (
    <>
      <p className={status}>3D: the object dissolves away (top → bottom) and is revealed again bottom → top while 09–11 scroll past (GLSL uniforms from Theatre).</p>
      <div ref={panel} data-testid="lab-mask-panel" className="border border-hairline bg-raised p-6 font-display text-headline text-ink uppercase">
        Bottom-to-top mask
      </div>
      <div>
        <AnimatedButton variant="secondary" data-testid="lab-mask-run" onClick={() => setRun((r) => r + 1)}>
          Run DOM mask
        </AnimatedButton>
      </div>
    </>
  );
}

// ── 12 ────────────────────────────────────────────────────────────────────────
function ReducedMotionDemo() {
  const reduced = useAnimationState((s) => s.reducedMotion);
  const smooth = useAnimationState((s) => s.smoothScroll);
  const [forced, setForced] = useState(false);
  useEffect(() => () => setReducedMotionOverride(null), []);
  const toggle = () => {
    const next = !forced;
    setForced(next);
    setReducedMotionOverride(next ? true : null);
  };
  return (
    <>
      <div>
        <AnimatedButton variant="secondary" aria-pressed={forced} data-testid="lab-reduced-toggle" onClick={toggle}>
          {forced ? "Stop simulating reduced motion" : "Simulate reduced motion"}
        </AnimatedButton>
      </div>
      <ul data-testid="lab-reduced-effects" className="grid gap-1 font-meta text-meta text-body">
        <li>Reduced motion: {reduced ? "on" : "off"}</li>
        <li>Scroll engine: {smooth ? "Lenis" : "native"}</li>
        <li>Theatre sequence: {reduced ? "reset, play disabled" : "may play"}</li>
        <li>3D idle + interaction: {reduced ? "at rest" : "running"}</li>
        <li>GSAP split reveals: {reduced ? "final state, no split" : "masked"}</li>
      </ul>
      <p className={status}>The OS setting (prefers-reduced-motion) also collapses every duration token in CSS; this switch only drives the engines.</p>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function LabBody() {
  const signals = useRef<LabSignals>({ scrollProgress: 0, frames: 0, mask: { progress: 1, dissolve: 0 } });
  const live = useRef<{ timeline: () => string }>({ timeline: () => "–" });
  const progressSection = useRef<HTMLDivElement>(null);
  const maskRange = useRef<HTMLDivElement>(null);
  const combinedSection = useRef<HTMLDivElement>(null);
  const readTimeline = useCallback(() => live.current.timeline(), []);
  const setTimelineReader = useCallback((read: () => string) => {
    live.current.timeline = read;
  }, []);
  const debugLive = useMemo(() => ({ timeline: readTimeline }), [readTimeline]);

  return (
    <Container size="wide" className="grid gap-x-(--spacing-grid-gap) pb-section lg:grid-cols-12">
      <header className="pt-section-sm pb-10 lg:col-span-12">
        <p className="font-meta text-label text-muted uppercase">Development only · Fase K3</p>
        <h1 className="mt-4 font-display text-display-xl text-ink uppercase">Animation lab</h1>
        <MaskedText as="p" text="Every engine, one loop, one owner per property." className="mt-4 max-w-reading text-copy-lg text-body" />
        <dl className="mt-8 grid gap-x-6 gap-y-1 font-meta text-meta sm:grid-cols-2">
          {(Object.keys(ENGINE_RESPONSIBILITY) as AnimationEngine[]).map((engine) => (
            <div key={engine} className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink">{engine}</dt>
              <dd className="text-body">{ENGINE_RESPONSIBILITY[engine]}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="order-2 lg:order-1 lg:col-span-7">
        <Demo n={1} id="lab-masked" title="GSAP masked text" owner={["gsap"]} intro="SplitText lines inside clipping masks slide up, then the split is reverted to the original markup.">
          <MaskedTextDemo />
        </Demo>
        <Demo n={2} id="lab-lenis" title="Lenis smooth scrolling" owner={["lenis"]} intro="Wheel scrolling is smoothed; touch, keyboard and form controls stay native. Programmatic scroll, anchors and the scroll lock use the same engine.">
          <LenisDemo />
        </Demo>
        <div ref={progressSection}>
          <Demo n={3} id="lab-progress" title="ScrollTrigger progress" owner={["scrolltrigger"]} tall intro="This section's progress (top at centre → bottom at centre) drives the bar. ScrollTrigger reads the same scroll position Lenis writes.">
            <ScrollProgressDemo section={progressSection} />
          </Demo>
        </div>
        <Demo n={4} id="lab-motion-hover" title="Motion hover" owner={["motion"]} intro="Spring hover lift, magnetic pull (motion values, no re-render per move), underline draw, icon spin.">
          <MotionHoverDemo />
        </Demo>
        <Demo n={5} id="lab-motion-click" title="Motion click & states" owner={["motion"]} intro="Tap press, loading → success / error, disabled, AnimatePresence enter / exit, stagger.">
          <MotionClickDemo />
        </Demo>
        <AnimatedSection section="lab-idle-wrap">
          <Demo n={6} id="lab-idle" title="Idle floating" owner={["motion", "r3f"]} intro="Slow loops from the idle tokens; they stop under reduced motion.">
            <IdleDemo />
          </Demo>
        </AnimatedSection>
        <Demo n={7} id="lab-theatre" title="Theatre.js timeline" owner={["theatre"]} intro="The 'Animation Lab' sheet sequence (keyframes in src/theatre/kinetic-systems.theatre.json) drives the object's choreography layer and material. Studio opens here in development.">
          <TheatreDemo setTimelineReader={setTimelineReader} />
        </Demo>
        <Demo n={8} id="lab-scene" title="React Three Fiber scene" owner={["r3f", "three", "drei", "postprocessing"]} intro="The sticky canvas: frameloop driven by the shared ticker, adaptive DPR, postprocessing by quality tier, WebGL fallback and context-loss reporting.">
          <p className={status}>Hover and click the object. Watch FPS, WebGL and quality in the debug panel.</p>
        </Demo>
        <div ref={maskRange}>
          <Demo n={9} id="lab-sync" title="GSAP ↔ Theatre sync" owner={["scrolltrigger", "theatre"]} intro="ScrollTrigger maps scroll progress through 09–11 to the 'Scroll Masking' sequence position; Theatre interpolates the keyframes; R3F writes the uniforms.">
            <TheatreSyncDemo range={maskRange} signals={signals} />
          </Demo>
          <div ref={combinedSection}>
            <Demo n={10} id="lab-combined" title="Scroll + hover + click + idle" owner={["scrolltrigger", "theatre", "maath", "r3f"]} tall intro="Four engines move the same object through nested groups; none overwrites another. A second owner for a claimed property is refused.">
              <CombinedDemo section={combinedSection} signals={signals} />
            </Demo>
          </div>
          <Demo n={11} id="lab-mask" title="Bottom-to-top masking" owner={["glsl", "gsap"]} intro="GLSL discard above a noisy edge with an emissive band; the DOM equivalent is a clip-path inset wipe.">
            <MaskDemo />
          </Demo>
        </div>
        <Demo n={12} id="lab-reduced" title="Reduced motion" owner={["css", "lenis", "theatre", "r3f"]} intro="Engines follow the shared reduced-motion state live.">
          <ReducedMotionDemo />
        </Demo>
        <section aria-labelledby="lab-ownership-title" className="border-t border-hairline py-12">
          <h2 id="lab-ownership-title" className="font-display text-headline text-ink uppercase">
            Ownership rules
          </h2>
          <ul className="mt-6 grid gap-2 text-small text-body">
            {OWNERSHIP_RULES.map((rule) => (
              <li key={rule.property}>
                <span className="text-ink">{rule.property}</span> → {rule.owner} ({rule.note})
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="order-1 lg:order-2 lg:col-span-5">
        <div className="sticky top-(--nav-height) z-(--z-ui) h-[40svh] border border-hairline bg-canvas lg:top-[calc(var(--nav-height)+1rem)] lg:h-[calc(100svh-var(--nav-height)-2rem)]">
          <LabScene signals={signals} />
        </div>
      </div>
      <div className="order-3 lg:col-span-12">
        <CanvasLab />
      </div>
      <DebugPanel live={debugLive} />
    </Container>
  );
}

export default function AnimationLab() {
  return (
    <TheatreProvider>
      <MotionProvider>
        <LabBody />
      </MotionProvider>
    </TheatreProvider>
  );
}
