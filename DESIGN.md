---
version: alpha
name: Quiet Editorial
description: >-
  Visual system for the personal portfolio of Farhan Zulkarnain Harahap, a full-stack
  engineer in Medan, Indonesia. A warm paper canvas, an optical-size serif for headlines,
  a neutral sans for reading, a monospaced face for metadata, hairline structure, and one
  terracotta accent. Light-first with a complete dark theme.
colors:
  primary: "#A34A27"
  on-primary: "#FFFFFF"
  secondary: "#4A4843"
  neutral: "#FAF8F4"
  error: "#B3261E"
  light:
    canvas: "#FAF8F4"
    surface: "#F2EEE7"
    raised: "#FFFFFF"
    ink: "#1A1917"
    body: "#4A4843"
    muted: "#6B6760"
    hairline: "#E4DED3"
    hairline-strong: "#BDB4A6"
    field: "#8F877A"
    accent: "#A34A27"
    accent-hover: "#873C1F"
    on-accent: "#FFFFFF"
    accent-soft: "#F5E6DD"
    focus: "#A34A27"
    success: "#2E6A4C"
    danger: "#B3261E"
    warning: "#8A5A00"
  dark:
    canvas: "#141311"
    surface: "#1D1B18"
    raised: "#24221E"
    ink: "#F2EFE8"
    body: "#BAB5AB"
    muted: "#94907F"
    hairline: "#2E2B26"
    hairline-strong: "#4A463F"
    field: "#77716A"
    accent: "#DE916C"
    accent-hover: "#E9A887"
    on-accent: "#141311"
    accent-soft: "#3A2419"
    focus: "#DE916C"
    success: "#7CC29C"
    danger: "#F2928A"
    warning: "#E3B45C"
typography:
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  meta:
    fontFamily: Geist Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.08em
  display-xl-sm:
    fontFamily: Newsreader
    fontSize: 44px
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: -0.025em
  display-lg-sm:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.015em
  title-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.01em
  body-lg-sm:
    fontFamily: Geist
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.6
  display-xl-lg:
    fontFamily: Newsreader
    fontSize: 80px
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: -0.025em
  display-lg-lg:
    fontFamily: Newsreader
    fontSize: 60px
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.015em
  title-lg:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.01em
  body-lg-lg:
    fontFamily: Geist
    fontSize: 19px
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: 8px
  card: 12px
  pill: 9999px
spacing:
  base: 4px
  container-page: 1152px
  container-wide: 1280px
  container-reading: 672px
  nav-height: 64px
  sm:
    gutter: 20px
    section: 72px
    section-sm: 48px
    card-padding: 20px
    columns: 4
  lg:
    gutter: 40px
    section: 128px
    section-sm: 80px
    card-padding: 28px
    columns: 12
components:
  button-primary:
    backgroundColor: "{colors.light.accent}"
    textColor: "{colors.light.on-accent}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    height: 44px
    padding: 20px
  button-primary-hover:
    backgroundColor: "{colors.light.accent-hover}"
    textColor: "{colors.light.on-accent}"
  button-primary-dark:
    backgroundColor: "{colors.dark.accent}"
    textColor: "{colors.dark.on-accent}"
  button-secondary:
    backgroundColor: "{colors.light.canvas}"
    textColor: "{colors.light.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    height: 44px
    padding: 20px
  button-secondary-hover:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.ink}"
  link:
    textColor: "{colors.light.ink}"
    typography: "{typography.body-md}"
  chip:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.body}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    height: 26px
    padding: 10px
  badge-case-type:
    backgroundColor: "{colors.light.accent-soft}"
    textColor: "{colors.light.ink}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.pill}"
    padding: 10px
  card-project:
    backgroundColor: "{colors.light.canvas}"
    textColor: "{colors.light.ink}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.card}"
    padding: 20px
  card-project-hover:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.ink}"
  input-field:
    backgroundColor: "{colors.light.raised}"
    textColor: "{colors.light.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.control}"
    height: 48px
    padding: 14px
  input-field-error:
    backgroundColor: "{colors.light.raised}"
    textColor: "{colors.light.danger}"
  nav-bar:
    backgroundColor: "{colors.light.canvas}"
    textColor: "{colors.light.ink}"
    typography: "{typography.body-sm}"
    height: 64px
  timeline-entry:
    backgroundColor: "{colors.light.canvas}"
    textColor: "{colors.light.body}"
    typography: "{typography.body-md}"
  meta-text:
    backgroundColor: "{colors.light.canvas}"
    textColor: "{colors.light.muted}"
    typography: "{typography.meta}"
  footer:
    backgroundColor: "{colors.dark.canvas}"
    textColor: "{colors.dark.body}"
    typography: "{typography.body-sm}"
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.light.ink}"
  page-dark:
    backgroundColor: "{colors.dark.canvas}"
    textColor: "{colors.dark.ink}"
  divider:
    backgroundColor: "{colors.light.hairline}"
  divider-dark:
    backgroundColor: "{colors.dark.hairline}"
  button-secondary-outline:
    backgroundColor: "{colors.light.hairline-strong}"
  button-secondary-outline-dark:
    backgroundColor: "{colors.dark.hairline-strong}"
  button-primary-hover-dark:
    backgroundColor: "{colors.dark.accent-hover}"
    textColor: "{colors.dark.on-accent}"
  focus-ring:
    backgroundColor: "{colors.light.focus}"
  focus-ring-dark:
    backgroundColor: "{colors.dark.focus}"
  input-field-outline:
    backgroundColor: "{colors.light.field}"
  input-field-outline-dark:
    backgroundColor: "{colors.dark.field}"
  input-field-dark:
    backgroundColor: "{colors.dark.raised}"
    textColor: "{colors.dark.ink}"
  card-project-hover-dark:
    backgroundColor: "{colors.dark.surface}"
    textColor: "{colors.dark.ink}"
  chip-dark:
    backgroundColor: "{colors.dark.surface}"
    textColor: "{colors.dark.body}"
  badge-case-type-dark:
    backgroundColor: "{colors.dark.accent-soft}"
    textColor: "{colors.dark.ink}"
  meta-text-dark:
    backgroundColor: "{colors.dark.canvas}"
    textColor: "{colors.dark.muted}"
  status-success:
    backgroundColor: "{colors.light.canvas}"
    textColor: "{colors.light.success}"
  status-danger:
    backgroundColor: "{colors.light.canvas}"
    textColor: "{colors.light.danger}"
  status-warning:
    backgroundColor: "{colors.light.canvas}"
    textColor: "{colors.light.warning}"
  status-success-dark:
    backgroundColor: "{colors.dark.canvas}"
    textColor: "{colors.dark.success}"
  status-danger-dark:
    backgroundColor: "{colors.dark.canvas}"
    textColor: "{colors.dark.danger}"
  status-warning-dark:
    backgroundColor: "{colors.dark.canvas}"
    textColor: "{colors.dark.warning}"
---

# Quiet Editorial

## Overview

**Brand essence:** a calm, well-edited record of an engineer's work. The site should read like a
thoughtful engineering publication, not a product launch and not a control panel.

- **Audience:** recruiters and hiring managers (10–30 seconds to judge fit), and prospective clients
  (looking for proof that work ships and solves problems).
- **Feeling:** professional, trustworthy, modern, calm, refined. Confidence comes from restraint:
  generous whitespace, one accent, precise metadata, real project evidence.
- **Personality in three words:** precise, warm, unhurried.
- **What it is not:** sci-fi, neon, glowing grids, terminal cosplay, "system" vocabulary, dense
  dashboards on public pages, decorative motion.

The editorial serif carries the voice; the mono metadata (years, roles, stack, case type) carries the
engineering precision. Everything else stays out of the way of the content that comes from the API.

## Colors

The palette is warm neutrals with a single terracotta accent. Light theme is the default; the dark
theme is a full counterpart, not an inversion.

- **Paper (#FAF8F4) / Night (#141311):** the page canvas. Warmer than pure white or black, so long
  reading feels soft.
- **Surface (#F2EEE7 / #1D1B18):** tonal step for hover states, chips, media placeholders, and
  quiet panels. **Raised (#FFFFFF / #24221E)** is reserved for inputs and overlays.
- **Ink (#1A1917 / #F2EFE8):** headlines and primary text. **Body (#4A4843 / #BAB5AB)** for running
  text. **Muted (#6B6760 / #94907F)** for metadata and captions; still AA on every surface.
- **Hairline (#E4DED3 / #2E2B26):** dividers and card outlines. **Hairline strong** for secondary
  button borders. **Field (#8F877A / #77716A)** for input borders (3:1 non-text contrast).
- **Terracotta accent (#A34A27 / #DE916C):** primary CTA, link underlines, focus ring, active nav
  marker, the one highlighted word or number per view. Never used for large fills or backgrounds.
- **Status:** success moss, danger brick, warning ochre. Always paired with text or an icon.

Verified contrast (WCAG 2.x): ink ≥ 13.8:1, body ≥ 7.1:1, muted ≥ 4.5:1, accent text ≥ 4.8:1 on
every surface in both themes; on-accent on accent 5.9:1 (light) and 7.4:1 (dark).

Implementation: semantic colors are `--ui-*` in `src/app/globals.css`, each defined as
`light-dark(light, dark)` over primitives (`--paper-*`, `--night-*`, `--clay-*`) and exposed to
Tailwind as `--color-*` utilities through `@theme inline`. Components use the
semantic Tailwind utilities (`bg-canvas`, `text-ink`, `border-hairline`, `text-accent`) or component
tokens, never primitives or hex values.

## Typography

Three families, each with one job.

- **Newsreader** (serif, variable optical size): display, headlines, card and section titles. Weight
  400 for display sizes, 500 for headline and title. Tight negative tracking at large sizes. Italic is
  allowed for a single emphasized phrase in a hero or pull quote.
- **Geist** (sans): body copy, UI labels, buttons, navigation, forms. 16px base, line-height 1.65.
- **Geist Mono:** metadata only: dates, durations, roles, stack lists, case type, counts, file sizes.
  `label-caps` (12px, uppercase, 0.08em tracking) for eyebrows and small section labels.

Sizes are fluid between a 360px and a 1440px viewport (`clamp()` in `globals.css`): the `-sm` tokens
are the 360px values and the `-lg` tokens the 1440px values (for example `display-xl-sm` 44px →
`display-xl-lg` 80px). Utilities: `text-display-xl`,
`text-display-lg`, `text-headline`, `text-title`, `text-copy-lg` (body-lg), `text-copy` (body-md),
`text-small`, `text-meta`, `text-label`; families `font-heading`, `font-body`, `font-meta`. Body
sizes are named `copy` in CSS because `text-body` is the body text *color* utility.

Rules: one `h1` per page; headings never skip levels; body measure 60–75 characters
(`max-w-reading`); `text-wrap: balance` on short headings, `pretty` on paragraphs; tabular figures for
dates and counts; long URLs and tokens wrap with `overflow-wrap: anywhere`.

## Layout

- **Container:** `max-w-page` (1152px) for most sections, `max-w-wide` (1280px) for project grids
  and hero media, `max-w-reading` (672px) for prose. Horizontal padding is `px-gutter`
  (20px → 40px).
- **Grid:** 4 columns on mobile, 12 on desktop. Editorial layouts use asymmetric spans (for example
  4/8 for label + content, 7/5 for hero text + media).
- **Rhythm:** Tailwind's 4px spacing scale for components; `py-section` (72px → 128px) between page
  sections and `py-section-sm` (48px → 80px) inside long pages.
- **Breakpoints:** Tailwind defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536). Test at 360, 390,
  768, 1024, 1440. No horizontal scroll at any width.
- **Header:** sticky, 64px, translucent canvas with a hairline bottom border after scroll. Content
  anchors use `scroll-margin-top` equal to the header height.

## Elevation & Depth

Depth comes from tone and hairlines, not shadows. Pages are flat: canvas, a surface step, a hairline.
`shadow-raised` is used only for floating elements (menu, toast, command palette trigger) and
`shadow-overlay` only for modals and the command palette. Overlays sit on a `scrim` backdrop. Z-index
uses the scale `--z-base` (0) → `--z-raised` (10) → `--z-sticky` (20) → `--z-header` (30) →
`--z-overlay` (40) → `--z-modal` (50) → `--z-toast` (60).

## Shapes

Soft but disciplined. Cards and media use 12px (`rounded-card`); inputs and small controls 8px
(`rounded-control`); buttons, chips, and badges are pills (`rounded-pill`). Borders are 1px hairlines.
No mixed radii inside one component, no sharp corners next to rounded ones.

## Motion & Micro-interaction

Motion is slow, soft, and purposeful: it confirms an action or guides the eye, never decorates.

| Token | Duration | Easing | CSS |
|---|---|---|---|
| `state-change` | 150ms | `cubic-bezier(0.2, 0, 0, 1)` | `--duration-fast`, `ease-standard` |
| `surface-enter` | 240ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `--duration-base`, `ease-enter` |
| `surface-exit` | 150ms | `cubic-bezier(0.4, 0, 1, 1)` | `--duration-fast`, `ease-exit` |
| `emphasis` | 420ms | `cubic-bezier(0.2, 0, 0, 1)` | `--duration-slow`, `ease-standard` |
| `reveal` | 700ms, 60ms stagger | `cubic-bezier(0.16, 1, 0.3, 1)` | `--duration-reveal`, `--stagger`, `ease-enter` |

These live in prose rather than a `motion:` YAML map because the current linter
(`@google/design.md` 0.4.0) does not yet accept that key.

- **State changes** (hover, press, focus, color): `state-change`, 150ms.
- **Surfaces entering** (menus, dialogs, toasts): `surface-enter`, 240ms, decelerating; exits are
  faster (`surface-exit`, 150ms, accelerating).
- **Scroll reveal:** headings and blocks fade up 8px (`--reveal-distance`) over `reveal` (700ms) with
  a 60ms stagger; maximum one or two revealed groups per viewport. Content is visible without JS.
- **Media hover:** images scale 1.00 → 1.02 over `emphasis` (420ms); link underlines draw in from the
  left.
- **Never:** scroll-jacking, pinned scroll scenes on mobile, looping ambient animation, parallax on
  text, animating width/height/top/left, blocking input during an animation.
- **Reduced motion:** `prefers-reduced-motion: reduce` collapses durations and the reveal distance to
  zero (tokens do this automatically); 3D shows its static poster. Motion must not move LCP elements
  or cause layout shift.

## Voice & Content Strategy

- **Tone:** professional, clear, confident without hype. Short declarative sentences. No exclamation
  marks, no "system", "transmission", "initialize", or sci-fi metaphors.
- **Language:** professional English.
- **Capitalization:** sentence case for headings, buttons, labels, and navigation. Mono
  `label-caps` is the only uppercase text.
- **Terminology:** "Projects" (not "Vault" or "Works"), "Journey" for experience, "Case study" for a
  project page, "Stack" for skills, "Documents" for CV and certificates.
- **Actions:** verb phrases naming the outcome: "View case study", "Download CV", "Send message",
  "Show all features".
- **Empty, loading, error:** empty states say what will appear and offer a next step ("Experience
  entries will appear here. Meanwhile, browse the projects."). Loading uses skeletons sized like the
  content. Errors say what failed and offer a retry.
- **Numbers and dates:** `MMM YYYY` for ranges ("Jan 2024 – Present"), en dash between dates, file
  sizes as "1.2 MB".
- **API content is never rewritten**, only presented (see Page Patterns for display normalisation).

## Components

Component tokens live in `src/app/globals.css` (`--button-*`, `--link-*`, `--card-*`, `--media-*`,
`--chip-*`, `--field-*`, `--nav-*`, `--focus-ring-*`).

- **Buttons:** primary (accent fill, on-accent text) for the single most important action per view;
  secondary (hairline-strong outline, ink text, surface on hover); text link (ink with accent
  underline). Height 44px (36px only for dense desktop toolbars), pill shape, visible focus ring,
  `aria-busy` + spinner while submitting.
- **Project card:** fixed 16:10 media frame with `media-bg` placeholder, then case type badges, title
  (serif `title`, max 2 lines), description (max 3 lines), and metadata. Tags show at most 4 chips plus
  a "+N" chip that reveals the rest on focus or click; `features` never appear on cards. The whole card
  is one link with a single accessible name. Hover: surface background and a 1.02 media scale.
- **Chips and badges:** mono `meta` text on surface with a hairline; case type badges use accent-soft.
  Chips wrap; labels are never truncated.
- **Timeline entry:** two columns on desktop (mono date range left, role + company + description +
  technologies right), stacked on mobile, separated by hairlines. No dots or glowing rails.
- **Input fields:** visible label above, 48px height, field border, accent border and focus ring on
  focus, error text below the field linked with `aria-describedby`, error summary on failed submit.
- **Navigation bar:** name on the left, primary links (Projects, About, Journey, Contact), theme
  toggle, ⌘K trigger. Active link uses an accent underline. Mobile uses a full-height sheet.
- **Footer:** dark band (`color-scheme: dark` locally) with name, short positioning line, links,
  and copyright. No live clock.
- **Section header:** mono `label-caps` eyebrow, serif headline, optional lead paragraph in
  `body-lg`, optional text link aligned right on desktop.

## Page Patterns

Follows `docs/PAGE_MAP.md`. All data comes from the API; the display layer (`src/lib/display/`) only
normalises presentation.

- **Home `/`:** editorial hero (eyebrow "Full-Stack Engineer · Medan, Indonesia", serif name and
  one-line positioning, two CTAs, a mono proof line from API counts, one 3D accent on the right on
  desktop). Then selected projects (projects with a case study, max 6; filled from API order when
  fewer than 3), stack summary by API category, a short journey preview (hidden automatically when
  there are no experiences), and a contact CTA band.
- **About `/about`:** profile, approach, full stack grouped by API category (FRONTEND, BACKEND,
  TOOLS, OTHERS, with Database/DevOps sub-groups from the display map), and documents. Anchors
  `#profile`, `#stack`, `#documents` must exist (308 redirects point to them).
- **Journey `/journey`:** full timeline from `experiences`. When empty: a calm empty state with a link
  to Projects.
- **Projects `/projects`:** all projects in a 2-column grid (1 on mobile), filterable by case type and
  stack; filter state lives in the URL.
- **Case study `/projects/[slug]`:** article layout. Header with case type badges, title, description,
  demo and repository links, and the hero image. A sticky aside (desktop) holds role, stack, and links.
  Body chapters 01 Problem, 02 Solution, 03 Result in `max-w-reading`. Features show 6 first with a
  "Show all features" control. Previous / Next project at the end, then a contact CTA.
- **Contact `/contact`:** short intro, the working form (name, email, subject, message), direct email,
  GitHub, and LinkedIn. Success and error states inline.
- **Auth, 404, error:** same canvas and type, minimal content, one clear way back.

## Imagery & 3D

- **Project media:** real screenshots from the API in a fixed-ratio frame; never stretched; lazy
  loaded below the fold; meaningful `alt` from the project title.
- **3D is an accent, never the theme:** one sculptural object in the home hero on desktop: the
  HeroModel, five matte clay plates (Interface → API → Service → Database → Deployment) on one
  terracotta axis, warm procedural studio light. It eases towards the pointer (max ±8°) and rests
  when the pointer leaves; nothing loops. No 3D on project cards or forms. The former WebGL DotGrid
  accent is gone; only the static CSS dot pattern stays behind the hero visual.
- **Case study lead image:** the plain project screenshot (`ProjectImage`) in a quiet frame: 16:10
  locked ratio, `--media-radius`, hairline border, `--media-bg` while loading; priority because it
  sits above the fold under the title and CTAs. No device mockup (removed in Fase 10.5).
- **Theme-aware renders:** posters exist per theme and follow the site theme (toggle and
  `data-theme`, OS by default) through `ThemedPicture`: only the active variant is downloaded, and a
  toggle swaps it after decoding, without a reload. 3D material colours come from the `--model-*`
  tokens.
- **Budgets:** each GLB ≤ 1.5 MB (Draco or Meshopt), textures ≤ 2K WebP, total 3D on the home page
  ≤ 3 MB. Sources in `design/blender/`, exports in `public/3d/`.
- **Fallbacks:** a WebP/AVIF poster rendered from the same scene is shown on mobile, with reduced
  motion, when WebGL is unavailable, and until the model loads, then cross-fades to the canvas.
  three.js and the GLB load only on capable desktops, after the slot is visible. Neither the poster
  nor the canvas may become the LCP element: the model is framed small enough (`MODEL_SCALE`) that
  the H1 stays larger.
- **Illustration:** none beyond the 3D accent; no stock photos, no AI-generated people.

## Accessibility

- WCAG 2.2 AA: text contrast ≥ 4.5:1 (verified above), non-text ≥ 3:1 (field borders, focus ring).
- Visible focus on every interactive element (2px accent outline, 3px offset); focus never hidden by
  the sticky header.
- Skip-to-content link first in the tab order; landmarks (`header`, `nav`, `main`, `footer`).
- Targets ≥ 44px on touch, ≥ 24px minimum on pointer devices.
- Color is never the only signal (status has text or an icon).
- `prefers-reduced-motion` and `prefers-color-scheme` respected; the theme choice persists without a
  flash.
- Forms: visible labels, inline errors with `aria-describedby`, an error summary, `aria-live` for the
  result.

## Implementation

- `src/app/globals.css`: primitives; `@theme static` for type, spacing, radius, easing; `--ui-*`
  semantic colors and component tokens in one rule on `:root, .site-scheme, .scheme-dark`;
  `@theme inline` maps color/shadow utilities to them; a minimal `@layer base`.
- Lightning CSS compiles `light-dark()` into variables that resolve where a token is declared, so
  every element that sets its own scheme must re-declare the tokens: use `.site-scheme` (follows the
  site theme) or `.scheme-dark` (always dark). Do not set `color-scheme` on other elements.
- `src/app/layout.tsx`: `next/font` (Newsreader with `opsz`, Geist, Geist Mono) and the inline theme
  script. `<html data-theme>` pins a stored choice; otherwise the OS preference applies.
- Do not use Tailwind `dark:` utilities; semantic tokens adapt by themselves. A section can force a
  dark band with the `scheme-dark` class (not a bare `color-scheme` declaration).
- Base components live in `src/components/ui/` (Button, Chip/Badge/ChipList, Card, Container,
  Section, Separator, Avatar, Tooltip, ThemeToggle, Skeleton, EmptyState, ErrorState, form fields);
  the site frame (header, mobile menu, ⌘K palette, footer) in `src/components/site/`.
- `cn()` (`src/lib/utils.ts`) knows the custom token names so tailwind-merge does not drop them;
  add new token names there.
- Do not redefine Tailwind's default theme namespaces; the dashboard depends on them.

## Do's and Don'ts

- Do let real project evidence lead; every section answers "who, what can he do, where is the proof".
- Do use the accent for one primary action and one highlight per view.
- Do keep metadata in Geist Mono and prose in Geist; serif only for headings.
- Do design empty states for every API-driven section.
- Don't use hex values, raw pixel sizes, or ad-hoc durations in components; use tokens.
- Don't use glow, neon gradients, grids of dots, scanlines, or terminal styling.
- Don't use emoji as icons; use one stroke icon set (Lucide) at consistent sizes.
- Don't truncate chip labels or hide information behind hover only.
- Don't animate layout properties or delay content behind animations.
- Don't place 3D where it competes with text or project images.
