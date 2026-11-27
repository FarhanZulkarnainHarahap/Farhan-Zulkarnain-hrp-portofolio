/**
 * Runtime bridge from the CSS design tokens (src/app/globals.css, DESIGN.md) to the JS animation
 * engines: GSAP (seconds + ease strings), Motion (spring config), Theatre.js and React Three Fiber
 * (scene units, colours as hex). CSS stays the single source of truth; this module only reads it.
 *
 * - Values are read from getComputedStyle(:root) once and cached; call `invalidateDesignTokens()`
 *   after a theme change (colours) — ThemeProvider-aware consumers re-read on `theme` change.
 * - Reduced motion is already applied in CSS (durations → 1ms, idle → 0, press/hover → 1), so the
 *   numbers returned here respect the user's preference without extra branching.
 * - On the server (no DOM) the fallbacks below are returned; they mirror the CSS defaults.
 */

export type Seconds = number;

export type MotionTokenSet = {
  duration: {
    instant: Seconds;
    fast: Seconds;
    base: Seconds;
    slow: Seconds;
    reveal: Seconds;
    cinematic: Seconds;
    pageExit: Seconds;
    pageEnter: Seconds;
    camera: Seconds;
    /** Semantic durations (Fase K3), see src/lib/animation/config.ts for the allowed ranges. */
    micro: Seconds;
    hover: Seconds;
    press: Seconds;
    enter: Seconds;
    section: Seconds;
    page: Seconds;
  };
  stagger: { base: Seconds; chars: Seconds; words: Seconds; lines: Seconds };
  /** Distance of small reveals, in px. */
  revealDistance: number;
  /** cubic-bezier control points, usable by GSAP CustomEase, Motion and CSS. */
  ease: Record<"standard" | "enter" | "exit" | "cinematic" | "mask", [number, number, number, number]>;
  spring: {
    default: { stiffness: number; damping: number; mass: number };
    soft: { stiffness: number; damping: number; mass: number };
  };
  mask: { hidden: string; shown: string; exit: string; feather: string; direction: 1 | -1 };
  hover: { scale: number; liftPx: number; tiltDeg: number; magneticStrength: number; magneticRadiusPx: number };
  press: { scale: number };
  idle: {
    floatAmplitude: number;
    floatPeriod: Seconds;
    rotationSpeed: number;
    breathScale: number;
    lightPeriod: Seconds;
  };
  camera: { fov: number; fovMobile: number; smoothTime: Seconds };
  /** Seconds per revolution of the three hero orbit rings (inner → outer). */
  orbit: { inner: Seconds; middle: Seconds; outer: Seconds };
  /** Lenis smooth scroll. */
  scroll: { lerp: number; wheelMultiplier: number };
};

export type ColorTokenSet = Record<
  "canvas" | "surface" | "raised" | "ink" | "body" | "muted" | "hairline" | "hairlineStrong" | "accent" | "accentGlow" | "metal",
  string
>;

const FALLBACK: MotionTokenSet = {
  duration: {
    instant: 0.09,
    fast: 0.15,
    base: 0.24,
    slow: 0.42,
    reveal: 0.8,
    cinematic: 1.4,
    pageExit: 0.45,
    pageEnter: 0.7,
    camera: 1.2,
    micro: 0.15,
    hover: 0.28,
    press: 0.14,
    enter: 0.56,
    section: 0.8,
    page: 0.8,
  },
  stagger: { base: 0.06, chars: 0.018, words: 0.04, lines: 0.09 },
  revealDistance: 12,
  ease: {
    standard: [0.2, 0, 0, 1],
    enter: [0.16, 1, 0.3, 1],
    exit: [0.4, 0, 1, 1],
    cinematic: [0.83, 0, 0.17, 1],
    mask: [0.77, 0, 0.175, 1],
  },
  spring: {
    default: { stiffness: 260, damping: 26, mass: 1 },
    soft: { stiffness: 120, damping: 20, mass: 1 },
  },
  mask: {
    hidden: "inset(100% 0 0 0)",
    shown: "inset(0 0 0 0)",
    exit: "inset(0 0 100% 0)",
    feather: "12%",
    direction: 1,
  },
  hover: { scale: 1.03, liftPx: -2, tiltDeg: 6, magneticStrength: 0.3, magneticRadiusPx: 96 },
  press: { scale: 0.96 },
  idle: { floatAmplitude: 0.06, floatPeriod: 6, rotationSpeed: 0.15, breathScale: 1.015, lightPeriod: 12 },
  camera: { fov: 35, fovMobile: 45, smoothTime: 0.35 },
  orbit: { inner: 21, middle: 30, outer: 38 },
  scroll: { lerp: 0.1, wheelMultiplier: 1 },
};

const FALLBACK_COLORS: ColorTokenSet = {
  canvas: "#08090b",
  surface: "#101216",
  raised: "#171a20",
  ink: "#f2f3f5",
  body: "#a1a1aa",
  muted: "#80808a",
  hairline: "#272b33",
  hairlineStrong: "#3a404b",
  accent: "#b9f5ff",
  accentGlow: "#b9f5ff",
  metal: "#a8b3c2",
};

let motionCache: MotionTokenSet | null = null;
let colorCache: ColorTokenSet | null = null;

/** "240ms" | "1.4s" | "6" → seconds. */
export function toSeconds(value: string, fallback: Seconds): Seconds {
  const v = value.trim();
  if (!v) return fallback;
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallback;
  if (v.endsWith("ms")) return n / 1000;
  return n;
}

/** "cubic-bezier(a, b, c, d)" → [a, b, c, d]. */
export function toBezier(
  value: string,
  fallback: [number, number, number, number],
): [number, number, number, number] {
  const match = /cubic-bezier\(([^)]+)\)/.exec(value);
  if (!match) return fallback;
  const points = match[1].split(",").map((n) => parseFloat(n));
  return points.length === 4 && points.every(Number.isFinite)
    ? (points as [number, number, number, number])
    : fallback;
}

function toNumber(value: string, fallback: number) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

/** rem / px / deg → number in px (rem) or the raw unit. */
function toPx(value: string, fallback: number) {
  const v = value.trim();
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallback;
  if (v.endsWith("rem")) {
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return n * root;
  }
  return n;
}

export function getMotionTokens(): MotionTokenSet {
  if (typeof window === "undefined") return FALLBACK;
  if (motionCache) return motionCache;
  const css = getComputedStyle(document.documentElement);
  const get = (name: string) => css.getPropertyValue(name);
  const f = FALLBACK;
  motionCache = {
    duration: {
      instant: toSeconds(get("--duration-instant"), f.duration.instant),
      fast: toSeconds(get("--duration-fast"), f.duration.fast),
      base: toSeconds(get("--duration-base"), f.duration.base),
      slow: toSeconds(get("--duration-slow"), f.duration.slow),
      reveal: toSeconds(get("--duration-reveal"), f.duration.reveal),
      cinematic: toSeconds(get("--duration-cinematic"), f.duration.cinematic),
      pageExit: toSeconds(get("--duration-page-exit"), f.duration.pageExit),
      pageEnter: toSeconds(get("--duration-page-enter"), f.duration.pageEnter),
      camera: toSeconds(get("--camera-duration"), f.duration.camera),
      micro: toSeconds(get("--duration-micro"), f.duration.micro),
      hover: toSeconds(get("--duration-hover"), f.duration.hover),
      press: toSeconds(get("--duration-press"), f.duration.press),
      enter: toSeconds(get("--duration-enter"), f.duration.enter),
      section: toSeconds(get("--duration-section"), f.duration.section),
      page: toSeconds(get("--duration-page"), f.duration.page),
    },
    stagger: {
      base: toSeconds(get("--stagger"), f.stagger.base),
      chars: toSeconds(get("--stagger-chars"), f.stagger.chars),
      words: toSeconds(get("--stagger-words"), f.stagger.words),
      lines: toSeconds(get("--stagger-lines"), f.stagger.lines),
    },
    revealDistance: toPx(get("--reveal-distance"), f.revealDistance),
    ease: {
      standard: toBezier(get("--ease-standard"), f.ease.standard),
      enter: toBezier(get("--ease-enter"), f.ease.enter),
      exit: toBezier(get("--ease-exit"), f.ease.exit),
      cinematic: toBezier(get("--ease-cinematic"), f.ease.cinematic),
      mask: toBezier(get("--ease-mask"), f.ease.mask),
    },
    spring: {
      default: {
        stiffness: toNumber(get("--spring-stiffness"), f.spring.default.stiffness),
        damping: toNumber(get("--spring-damping"), f.spring.default.damping),
        mass: toNumber(get("--spring-mass"), f.spring.default.mass),
      },
      soft: {
        stiffness: toNumber(get("--spring-soft-stiffness"), f.spring.soft.stiffness),
        damping: toNumber(get("--spring-soft-damping"), f.spring.soft.damping),
        mass: toNumber(get("--spring-mass"), f.spring.soft.mass),
      },
    },
    mask: {
      hidden: get("--mask-hidden").trim() || f.mask.hidden,
      shown: get("--mask-shown").trim() || f.mask.shown,
      exit: get("--mask-exit").trim() || f.mask.exit,
      feather: get("--mask-feather").trim() || f.mask.feather,
      direction: toNumber(get("--mask-direction"), 1) < 0 ? -1 : 1,
    },
    hover: {
      scale: toNumber(get("--hover-scale"), f.hover.scale),
      liftPx: toPx(get("--hover-lift"), f.hover.liftPx),
      tiltDeg: toNumber(get("--hover-tilt"), f.hover.tiltDeg),
      magneticStrength: toNumber(get("--magnetic-strength"), f.hover.magneticStrength),
      magneticRadiusPx: toPx(get("--magnetic-radius"), f.hover.magneticRadiusPx),
    },
    press: { scale: toNumber(get("--press-scale"), f.press.scale) },
    idle: {
      floatAmplitude: toNumber(get("--idle-float-amplitude"), f.idle.floatAmplitude),
      floatPeriod: toSeconds(get("--idle-float-period"), f.idle.floatPeriod),
      rotationSpeed: toNumber(get("--idle-rotation-speed"), f.idle.rotationSpeed),
      breathScale: toNumber(get("--idle-breath-scale"), f.idle.breathScale),
      lightPeriod: toSeconds(get("--idle-light-period"), f.idle.lightPeriod),
    },
    camera: {
      fov: toNumber(get("--camera-fov"), f.camera.fov),
      fovMobile: toNumber(get("--camera-fov-mobile"), f.camera.fovMobile),
      smoothTime: toSeconds(get("--camera-smooth-time"), f.camera.smoothTime),
    },
    orbit: {
      inner: toSeconds(get("--orbit-period-inner"), f.orbit.inner),
      middle: toSeconds(get("--orbit-period-middle"), f.orbit.middle),
      outer: toSeconds(get("--orbit-period-outer"), f.orbit.outer),
    },
    scroll: {
      lerp: Math.min(1, Math.max(0.01, toNumber(get("--scroll-lerp"), f.scroll.lerp))),
      wheelMultiplier: toNumber(get("--scroll-wheel-multiplier"), f.scroll.wheelMultiplier),
    },
  };
  return motionCache;
}

/**
 * Resolved scheme colours as hex/rgb strings (three.js Color accepts both). light-dark() only
 * resolves on a computed *property*, so each token is resolved through a hidden probe element.
 */
export function getColorTokens(): ColorTokenSet {
  if (typeof window === "undefined") return FALLBACK_COLORS;
  if (colorCache) return colorCache;
  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden";
  document.body.appendChild(probe);
  const resolve = (token: string, fallback: string) => {
    probe.style.color = `var(${token})`;
    return getComputedStyle(probe).color || fallback;
  };
  const f = FALLBACK_COLORS;
  colorCache = {
    canvas: resolve("--ui-canvas", f.canvas),
    surface: resolve("--ui-surface", f.surface),
    raised: resolve("--ui-raised", f.raised),
    ink: resolve("--ui-ink", f.ink),
    body: resolve("--ui-body", f.body),
    muted: resolve("--ui-muted", f.muted),
    hairline: resolve("--ui-hairline", f.hairline),
    hairlineStrong: resolve("--ui-hairline-strong", f.hairlineStrong),
    accent: resolve("--ui-accent", f.accent),
    accentGlow: resolve("--ui-accent", f.accentGlow),
    metal: resolve("--ui-metal", f.metal),
  };
  probe.remove();
  return colorCache;
}

/** Drop cached values (theme switch, reduced-motion change). */
export function invalidateDesignTokens() {
  motionCache = null;
  colorCache = null;
}

/** Server-safe defaults (identical to the CSS values without reduced motion). */
export const MOTION_TOKEN_DEFAULTS: Readonly<MotionTokenSet> = FALLBACK;

/** Motion-style transition from the spring tokens (DOM micro-interactions). */
export function springTransition(kind: "default" | "soft" = "default") {
  const { stiffness, damping, mass } = getMotionTokens().spring[kind];
  return { type: "spring" as const, stiffness, damping, mass };
}
