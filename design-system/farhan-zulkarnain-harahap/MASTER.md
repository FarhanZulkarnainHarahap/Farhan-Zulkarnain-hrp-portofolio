# Design System Master File — Farhan Zulkarnain Harahap

**Source of truth: [`DESIGN.md`](../../DESIGN.md)** (tokens in `src/app/globals.css`, owner taste rules
in DESIGN.md → "Owner taste rules"). This file used to hold the raw `ui-ux-pro-max` generator output from
Fase 2 ("Brutalism", blue accent, Archivo/Space Grotesk), which contradicted the brief; it was replaced in
Fase 12 so tools that read `design-system/<project>/MASTER.md` land on the approved direction.

Summary of the approved direction (details in DESIGN.md):

- Calm, refined, professional portfolio. Warm paper / night neutrals, one terracotta accent (clay).
- Type: Newsreader (headings, opsz) + Geist (body) + Geist Mono (meta), local Latin subsets.
- Light and dark through `light-dark()` semantic tokens (`--ui-*`); no `dark:` utilities.
- Motion: short, token-driven, no loops, H1 never animated, reduced motion = final state.
- 3D is an accent: the Fz card rendered in Blender (entrance + fly-through), never a theme.

There are no page overrides; `pages/` is intentionally empty.
