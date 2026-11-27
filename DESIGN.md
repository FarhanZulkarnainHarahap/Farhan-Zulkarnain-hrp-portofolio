---
version: kinetic-1
name: Kinetic Systems
description: >-
  Visual system for the portfolio of Farhan Zulkarnain Harahap, full-stack engineer and creative
  developer in Medan, Indonesia. "FARHAN — KINETIC SYSTEMS: Immersive Digital Engineering": a
  premium dark, cinematic spatial interface. Swiss typography set large and tight, a visible
  12-column grid, hairline structure, one ice accent used sparingly, and real-time 3D (WebGL) as
  the main source of light and depth. Dark by default, with a complete light variant.
supersedes: Quiet Editorial (Fase 1–12.11, until 2026-11-27)
colors:
  dark:
    canvas: "#08090B"
    surface: "#101216"
    raised: "#171A20"
    ink: "#F2F3F5"
    body: "#A1A1AA"
    muted: "#80808A"
    hairline: "#272B33"
    hairline-strong: "#3A404B"
    field: "#5A616D"
    accent: "#B9F5FF"
    accent-hover: "#93E9F7"
    on-accent: "#08090B"
    accent-soft: "#0D2A30"
    metal: "#A8B3C2"
    focus: "#B9F5FF"
    success: "#7FE0B0"
    danger: "#FF8A80"
    warning: "#F2C46D"
  light:
    canvas: "#F3F4F6"
    surface: "#E9EBEF"
    raised: "#FFFFFF"
    ink: "#0B0C0E"
    body: "#3F434B"
    muted: "#5D626C"
    hairline: "#D5D9E0"
    hairline-strong: "#A9B0BC"
    field: "#7B828E"
    accent: "#0B6E7F"
    accent-hover: "#08525F"
    on-accent: "#FFFFFF"
    accent-soft: "#D7F1F5"
    metal: "#5B6573"
    focus: "#0B6E7F"
    success: "#1F6B48"
    danger: "#B3261E"
    warning: "#8A5A00"
typography:
  families:
    display: Geist (600, tight tracking, uppercase for display sizes)
    body: Geist (400–500)
    meta: Geist Mono (400–500, uppercase labels)
  scale:
    display-hero: { size: "clamp(3rem, 0.75rem + 8vw, 9.5rem)", line: 0.86, tracking: -0.045em, weight: 600 }
    display-xl: { size: "clamp(2.75rem, 1.25rem + 5.5vw, 6.5rem)", line: 0.9, tracking: -0.04em, weight: 600 }
    display-lg: { size: "clamp(2.25rem, 1.25rem + 3.6vw, 4.75rem)", line: 0.95, tracking: -0.035em, weight: 600 }
    headline: { size: "clamp(1.75rem, 1.35rem + 1.6vw, 3rem)", line: 1.02, tracking: -0.03em, weight: 550 }
    title: { size: "clamp(1.25rem, 1.15rem + 0.45vw, 1.625rem)", line: 1.2, tracking: -0.015em, weight: 500 }
    copy-lg: { size: "clamp(1.0625rem, 1.02rem + 0.19vw, 1.1875rem)", line: 1.55 }
    copy: { size: 1rem, line: 1.6 }
    small: { size: 0.875rem, line: 1.5 }
    meta: { size: 0.8125rem, line: 1.45, family: mono }
    label: { size: 0.6875rem, line: 1.35, tracking: 0.12em, weight: 500, family: mono, case: upper }
layout:
  grid: 12 columns, gap clamp(1rem, 0.6rem + 1.1vw, 1.75rem)
  gutter: "clamp(1.25rem, 0.75rem + 2.2vw, 3rem)"
  section: "clamp(5rem, 3.5rem + 6.5vw, 10rem)"
  section-sm: "clamp(3rem, 2.25rem + 3.3vw, 5.5rem)"
  container: { page: 78rem, wide: 96rem, reading: 40rem }
  breakpoints: { sm: 40rem, md: 48rem, lg: 64rem, xl: 80rem, 2xl: 96rem, 3xl: 120rem, 4xl: 160rem }
  nav-height: 4.5rem
rounded: { control: 0.125rem, card: 0.25rem, pill: 9999px }
borders: { hairline: 1px, strong: 1.5px, focus-ring: 2px, focus-offset: 3px }
depth-layers: [environment 0, canvas 1, mask 2, content 3, ui 4, raised 10, sticky 20, header 30, overlay 40, modal 50, toast 60, transition 70, cursor 80]
motion:
  duration: { instant: 90ms, fast: 150ms, base: 240ms, slow: 420ms, reveal: 800ms, cinematic: 1400ms, page-exit: 450ms, page-enter: 700ms, camera: 1200ms }
  # Semantic durations (Fase K3; ranges checked by src/lib/animation/config.ts)
  semantic: { micro: 150ms (120–180), hover: 280ms (200–350), press: 140ms (100–180), enter: 560ms (400–700), section: 800ms (600–1000), page: 800ms (600–1000), camera: 1200ms (800–1500) }
  orbit-period: { inner: 21s, middle: 30s, outer: 38s }  # 12–40 s per revolution
  scroll: { lerp: 0.1, wheel-multiplier: 1 }  # Lenis; lerp 1 under reduced motion
  ease:
    standard: cubic-bezier(0.2, 0, 0, 1)
    enter: cubic-bezier(0.16, 1, 0.3, 1)
    exit: cubic-bezier(0.4, 0, 1, 1)
    cinematic: cubic-bezier(0.83, 0, 0.17, 1)
    mask: cubic-bezier(0.77, 0, 0.175, 1)
  spring: { default: [260, 26, 1], soft: [120, 20, 1] }
  stagger: { base: 60ms, chars: 18ms, words: 40ms, lines: 90ms }
  mask: { hidden: "inset(100% 0 0 0)", shown: "inset(0 0 0 0)", exit: "inset(0 0 100% 0)", feather: 12%, direction: bottom-to-top }
  hover: { scale: 1.03, lift: -0.125rem, tilt: 6deg, magnetic-strength: 0.3, magnetic-radius: 6rem }
  press: { scale: 0.96 }
  idle: { float-amplitude: 0.06, float-period: 6s, rotation-speed: 0.15 rad/s, breath-scale: 1.015, light-period: 12s }
  camera: { fov: 35, fov-mobile: 45, smooth-time: 0.35s }
---

# Kinetic Systems

## Overview

**FARHAN — KINETIC SYSTEMS: Immersive Digital Engineering.** A cinematic spatial-computing portfolio
for a full-stack engineer. The page reads as an engineering instrument: a dark void, a visible grid,
precise hairlines, technical labels, and large Swiss type. Real-time 3D (from Fase 4) supplies the
light, the depth and the motion; the interface stays quiet so the objects can carry the attention.

Principles:
1. **Space before decoration.** Whitespace, type hierarchy, spatial depth, lighting and motion are the
   design. No ornaments without a job.
2. **Asymmetry on a strict grid.** Labels live in a narrow column, content in a wide one; compositions
   are off-centre but every edge lands on the 12-column grid.
3. **One accent, used rarely.** Ice (#B9F5FF) marks focus, current state, the "z" of the monogram and
   emissive details in 3D. Never large fills, never gradients.
4. **Content never depends on effects.** Everything is server-rendered HTML first; 3D, masks and
   transitions are layers on top, with complete fallbacks.

Avoid: card grids as the default answer, glassmorphism, purple/blue gradients, neon glows, rounded
corners on everything, symmetrical hero templates, badges without a function.

## Colors

Dark is the default scheme (`:root { color-scheme: dark }`); `<html data-theme="light">` (toggle, ⌘K,
stored in localStorage) opts into the light variant. All semantic tokens are `light-dark()` pairs in
`src/app/globals.css`; components use only semantic tokens (`bg-canvas`, `text-ink`, `border-hairline`…).

| Role | Use |
|---|---|
| canvas / surface / raised | page, bands and panels, popovers and 3D core plates |
| ink / body / muted | headings, reading text, metadata |
| hairline / hairline-strong | structure, rules, rings in diagrams |
| field | form control borders (≥ 3:1 against canvas) |
| accent | focus ring, current state, hover target colour, small emissive details |
| metal | 3D brushed materials, secondary highlights |
| success / danger / warning | status, always with text or an icon |

Contrast (computed, WCAG 2): dark on canvas — ink 17.9, body 7.8, muted 5.1 (4.8 on surface),
accent 16.7, field 3.2 (non-text). Light on canvas — ink 17.8, body 9.0, muted 5.6, accent 5.4 (5.0 on
surface), field 3.5. White on the light accent 5.9.

`--legacy-render-canvas` is temporary: it frames the pre-rendered Blender assets of Fase 10.5/12.5
(fly-through, Fz card) in the colour baked into them, until the WebGL scenes replace them.

## Typography

Two families with three roles (max three, by rule):
- **Display — Geist 600**, uppercase at display sizes, tracking −0.035 to −0.045em, line-height
  0.86–0.95. Hero name and page H1s. Each display line can sit in a `.mask-line` box so it can rise
  from behind its mask (Fase 3+).
- **Body — Geist 400/500**, sentence case, line-height 1.5–1.6, measure ≤ 40rem.
- **Meta — Geist Mono**, uppercase labels (0.6875rem, +0.12em) for coordinates, indices, captions,
  form labels and navigation; mono `meta` (0.8125rem) for API-derived data lines.

All sizes are fluid (`clamp()`), tuned for 360 → 1440 px and capped for 4K. Headings use
`text-balance`, paragraphs `text-pretty`. Nothing moves continuously except where Motion says so.

## Layout

- 12-column grid (`--spacing-grid-gap`), drawn as faint hairlines by `.layer-environment` on lg+.
- Containers: page 78rem, wide 96rem, reading 40rem; fluid gutter.
- **Editorial section header:** label in columns 1–3, heading + description in 4–12, action aligned
  right, a hairline rule on top.
- **Page header:** label, display H1 across the width, full-width drawn rule, lead and actions in
  columns 7–12 (asymmetric).
- **Hero:** full viewport. Desktop: text block in columns 1–7, orbit stage in 8–12. Mobile: text,
  CTAs within thumb reach, then the orbit in its own area — the 3D never overlaps text.
- Breakpoints: Tailwind defaults plus `3xl` (120rem, 1920 px) and `4xl` (160rem, 2560 px+).

### Layer stack (public pages)

| # | Layer | Element | z |
|---|---|---|---|
| 1 | Background environment | `.layer-environment` (grid, vignette) | 0 |
| 2 | WebGL canvas | `#webgl-root` (persistent R3F canvas, Fase 4) | 1 |
| 3 | 3D masking | `#mask-root` (Fase 7) | 2 |
| 4 | Main content | `.layer-content` → `<main>`, footer | 3 |
| 5 | Interactive UI | in-content controls, orbit labels | 4 |
| 6 | Navigation | sticky header | 30 |
| 7 | Page transition overlay | `#transition-root` (Fase 8) | 70 |
| 8 | Modal / dialog | native `<dialog>` (browser top layer) | — |

Background layers are `position: fixed; pointer-events: none` and `display: none` while empty. The
canvas opts into pointer events only where 3D is interactive. Custom cursor (Fase 12): z 80.

## Elevation & Depth

Depth comes from tone steps (canvas → surface → raised), hairlines and real 3D light — not from soft
drop shadows. `shadow-overlay` only for popovers and dialogs; `shadow-glow` (accent hairline + soft
glow) only for a focused 3D/interactive object, never for static cards.

## Shapes

Industrial and nearly square: controls 2px, panels and media 4px. Pills only for status dots and
toggles. Diamonds (rotated squares) mark nodes in technical diagrams.

## Motion & Micro-interaction

Motion tokens live in CSS and reach every engine through `src/lib/design-tokens.ts`
(`getMotionTokens()`, `getColorTokens()`, `springTransition()`). Reduced motion is applied in CSS:
durations → 1ms, staggers → 0, hover/press/idle → neutral, so engines inherit it for free.

Engine ownership (one owner per property; one shared scroll progress):
- Three.js + React Three Fiber: rendering and 3D interaction. maath: damping.
- Architecture, ownership and the single loop: docs/ANIMATION_ARCHITECTURE.md (Fase K3); Theatre: docs/THEATRE.md.
- Theatre.js (`@theatre/core` only; Studio in development only): cinematic timelines, camera
  choreography, 3D keyframes. State JSON is committed.
- GSAP (+ ScrollTrigger, Flip, SplitText): scroll-driven sequencing and DOM timelines.
- Motion: DOM transitions and micro-interactions (springs from tokens).
- Lenis: smooth scrolling. GLSL: masking, dissolve, distortion.
- CSS: simple states (hover, focus, press, the scroll rail, the status pulse, the skeleton sheen).

### Interaction states (every interactive element)

| State | Treatment |
|---|---|
| Idle | 3D floats/breathes/orbits (idle tokens); UI is still. Only the scroll rail and status pulse loop in CSS. |
| Hover | colour shift to accent or ink fill, trailing icon travels, underline grows from the left, hairline strengthens; magnetic pull on `[data-magnetic]` (Fase 12) |
| Click | press compression `--press-scale`, then the next action (navigation, toggle) |
| Focus | 2px accent outline, 3px offset, always visible; fields also get an accent bottom bar |
| Active / current | `aria-current` → accent index + full underline |
| Disabled | 40% opacity, no pointer events |
| Loading | skeleton sized like the content with a light sheen; `aria-busy` on buttons |
| Success / error | icon + text (role status / alert); error panels carry a danger rule on the left |
| Entrance / exit | masked line reveal (`--mask-*`, ease `mask`), staggered; exit is the reverse, faster |

Hooks prepared in markup: `.mask-line` (text masking), `[data-magnetic]`, `[data-cursor="explore|
external|view|drag"]` (cursor labels), `[data-intro]` / `[data-reveal]` (MotionController),
`[data-orbit-stage]` (hero 3D slot), `#webgl-root`, `#mask-root`, `#transition-root`.

## Voice & Content Strategy

- Professional, confident English; short declarative sentences; no exclamation marks.
- The Kinetic identity name may appear as a signature (footer colophon), not as sci-fi role-play in
  body copy. Say what the work is.
- Sentence case for headings in body sections, buttons and descriptions; uppercase for display H1s
  and mono labels.
- API content is never rewritten, only presented (display normalisation lives in `src/lib/display/`).
- Empty, loading and error states say what will appear / what failed and offer a next step.

## Components

- **Button** (`ui/button.tsx`): primary = ink fill → accent on hover; secondary = hairline-strong
  border → ink border; ghost; link. Heights 36/44/56px, hit area ≥ 44px.
- **Eyebrow / technical label** (`ui/section.tsx`): rule + optional index + mono uppercase text.
- **SectionHeader / Section / PageHeader**: the editorial grid patterns above.
- **Header**: Fz monogram + name, paired technical labels (xl+), mono indexed nav, ⌘K, theme toggle.
  Transparent at the top, canvas 78% + blur + hairline once scrolled.
- **Mobile menu**: full-height modal sheet, indexed display-size links, elsewhere links and theme at
  the bottom; focus trapped, Esc closes, scroll locked.
- **Footer**: always dark; display-size "Get in touch" CTA, brand, index, elsewhere, Fz card, colophon.
- **Fields**: surface fill, field border, mono uppercase labels, accent border + bottom bar on focus.
- **Orbit fallback** (`hero/OrbitFallback.tsx`): static SVG of the orbit model — the no-WebGL fallback
  and the stand-in until the WebGL orbit (Fase 6).

## 3D

3D is the core of the experience. Rules:
- One persistent canvas for public routes (Fase 4); scene switching per route and section.
- Brand: the original Fz monogram glyphs (`src/app/icon.svg`, `components/brand/FzMark.tsx`).
- The hero orbit model (`src/lib/display/orbit.ts`) is shared by the SVG fallback and the WebGL
  scene: ring 1 Frontend, ring 2 Backend, ring 3 Tools & platforms — API skills only.
- Materials: dark brushed metal, restrained emissive accents, PBR. Lighting from the scene, not baked
  gradients. Bloom/DOF/grain low and selective; text always readable.
- Budgets: GLB ≤ 1.5 MB (Draco/Meshopt), textures ≤ 2K (WebP/KTX2), ≤ 3 MB 3D on the home page.
- Adaptive quality (DPR, post-processing off on mobile/low-end), stop when hidden, WebGL context-loss
  handling, full fallback without WebGL.

## Accessibility

- Text contrast ≥ 4.5:1 (all text tokens), UI contrast ≥ 3:1; never colour alone for status.
- Visible focus on every control; skip link first; landmarks; one H1 per page.
- `prefers-reduced-motion`: no tweens, no idle motion, no smooth scroll; content final.
- 3D and decorative layers are `aria-hidden`; the orbit carries an accessible text summary.
- Touch targets ≥ 44px; custom cursor only on fine pointers without reduced motion.

## Implementation

- Tokens: `src/app/globals.css` (primitives → semantic `--ui-*` + `@theme` → component → runtime).
- Runtime bridge: `src/lib/design-tokens.ts`. GSAP setup: `src/lib/gsap.ts`.
- Dashboard isolation: `src/app/dashboard/admin.css` is scoped to `.dashboard-root` and pins its own
  scheme; do not reset Tailwind's default theme namespaces; `tests/admin-visual.spec.ts` guards it.

## Owner taste rules (carried over from Fase 12.10; superseded items marked)

Still in force:
- Claims only when the owner confirmed them; no vendor or repository names in copy. Copy changes go
  through docs/COPY.md.
- Lettering is one composed unit: the Fz monogram stays balanced and legible at its smallest size.
- Prefer the thin, precise object over the chunky one.
- No device mockups around project screenshots unless a page phase decides otherwise with the owner.
- API data is never changed; missing data hides its section or shows a calm empty state.
- Long collections disclose progressively (+N, "Show all").
- Decorative effects never change the click or focus area; the keyboard ring stays visible.
- Form failure is announced assertively, success politely; with several invalid fields focus goes to
  the error summary.
- Theme follows the site toggle everywhere without a reload or flash; only the active theme's asset
  downloads.
- Performance is a time budget: report First Load JS and Lighthouse before/after each step.

Superseded by the Kinetic direction (2026-11-27):
- ~~3D is an accent, never the theme~~ → 3D is the core.
- ~~No system/sci-fi metaphors, no "Kinetic"~~ → the Kinetic identity is allowed as a signature.
- ~~No ScrollTrigger, no loops, nothing idles~~ → scroll-driven 3D and gentle idle motion are part of
  the experience (still reduced-motion aware, still 0 work when the tab is hidden).
- ~~Serif headlines, warm paper canvas, terracotta accent~~ → Geist display, void canvas, ice accent.
- ~~Light-first, OS-following theme~~ → dark by default, light on request.
