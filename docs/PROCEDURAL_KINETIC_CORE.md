# Procedural KineticCore

## Audit

The existing application is Next.js 16 / React 19 / TypeScript, with Three.js 0.185 and React Three Fiber 9. The homepage is assembled by `LandingPage`, `Shell`, and `Hero`. `Hero` already dynamically imports an isolated `HeroKineticCore` Canvas. Other sections retain their own viewers and shared `SceneHost`; this change does not replace that architecture.

Before this change, the hero loaded `public/models/fzh-kinetic-core/FZH_Hero_Kinetic_Core.glb` (3.1 MB) or `_LOD.glb` (1.2 MB), cloned its scene, and played its `idle` animation with Drei's animation mixer. Both model variants were preloaded in responsive link tags. Text was outside the hero Suspense, but the global `src/app/loading.tsx` route boundary still emitted a loading screen with streamed content hidden until React’s reveal script ran. The no-JavaScript browser test exposed this; removing that global loading boundary makes the statically generated content visible directly. Model downloads, parsing, and GPU upload also delayed the interactive centerpiece and competed with initial page resources. Those downloads and preloads are now removed from the hero.

The checked-out hero already contained uncommitted fixes for continuous animation, so a historical desktop freeze cannot be conclusively reproduced from this checkout. Identified failure paths: the old hero relied on an optional embedded `idle` clip for internal motion; `SceneHost` can choose static presentation based on hardware/memory/save-data heuristics (that shared scene is separate from the hero); reduced-motion settings intentionally pause motion; invisible viewers suspend their loop. The new hero has explicit procedural animation and never gates animation on desktop/low-end classification.

Existing source assets remain in `assets/blender/`, including the hero, identity capsule, capability matrix, devices, symbols, and tech nodes. Runtime GLBs and posters remain in `public/models/`, with capability icons in `public/icons/`. Existing shader sources include `src/components/three/shaders/signal.ts`; no HDR/EXR or standalone GLTF files were found in public/assets. Existing assets for other sections are retained. The hero reuses its 72 KB WebP poster as the loading/error presentation.

## Architecture

- `kinetic/geometry.ts`: beveled extruded annular sectors with closed side walls, plus a custom extruded F emblem.
- `kinetic/materials.ts`: titanium, silver, gunmetal, graphite, blue-gray, cyan energy, and translucent glass. A deterministic 128px brushed texture supplies roughness/bump variation without downloads.
- `kinetic/createKineticCore.ts`: owns the assembly and GPU resources. Sixteen outer segments, twelve secondary sections, thirty-two inner modules, layered central hub, and three separate orbital radii. Instanced bolts, panels, brackets, indicators, and recessed calibration ticks share geometry/materials.
- `kinetic/KineticCore.tsx`: one `useFrame` subscription updates every mechanical assembly, damped pointer/camera response, scroll influence, floating hub and energy pulse. Delta is capped after interruptions. No private RAF loop or per-frame React state updates. `HeroKineticCoreModel` remains an exported compatibility alias.
- `HeroKineticCore.tsx`: retained Canvas host, procedural studio reflections, directional/hemisphere/point lighting, responsive DPR, fade-in, error boundary and context-loss cleanup.

The hero uses Fiber's existing scheduler, not a second `renderer.setAnimationLoop`. Existing section canvases retain their own Fiber subscriptions. Visibility and touch/pointer listeners remain owned by `useAssetViewport`. Offscreen and hidden-tab rendering pauses and resumes; reduced motion draws a still mechanical presentation and retains the existing opt-in motion control.

Mobile reduces curve/radial subdivisions and caps DPR at 1.25; tablet caps at 1.5 and desktop at 1.75. Panels/fittings are instanced, reflections are generated once at 128px, and there are no runtime shadow maps or postprocessing passes. Construction/disposal happen in a paired React effect, including Strict Mode cleanup. Geometries, instance buffers, materials and the procedural texture are explicitly disposed; environment maps are owned by Drei.

## Run

From `nexxus-portofolio/web`:

```sh
npm run dev
# Production validation:
npm run build
npx playwright test tests/procedural-core.spec.ts
```

The Playwright configuration starts the production application on port 3101. Tests require installed Chromium and its Linux runtime libraries. On the current environment, libraries were extracted locally, so use:

```sh
LD_LIBRARY_PATH=/tmp/kinetic-browser-libs/usr/lib/x86_64-linux-gnu npx playwright test tests/procedural-core.spec.ts
```

## Scope and limitations

No dependency changes, deployment, or changes to unrelated sections. Pre-existing uncommitted changes were preserved. No real Chrome/Edge installations or physical Android device are available here; Chromium responsive automation is not equivalent to those browser/device certifications. Real GPU frame-rate and long-running memory soak measurements remain hardware QA tasks.

## Files in this change

Created:

- `src/components/three/kinetic/geometry.ts`
- `src/components/three/kinetic/materials.ts`
- `src/components/three/kinetic/createKineticCore.ts`
- `src/components/three/kinetic/KineticCore.tsx`
- `tests/procedural-core.spec.ts`
- `docs/PROCEDURAL_KINETIC_CORE.md`

Modified:

- `src/components/three/HeroKineticCore.tsx`: procedural model integration, responsive quality, error/lifecycle handling and transition.
- `src/components/kinetic/Hero.tsx`: removed obsolete GLB preloads.

Other files shown as modified by Git were already changed before this task.

Removed: `src/app/loading.tsx`, the global page loader that hid streamed content before JavaScript. Collection-level loading states remain intact.

Screenshots created: `docs/screenshots/kinetic-core-mobile.png`, `kinetic-core-tablet.png`, and `kinetic-core-desktop.png`.

## Validation results

- `npm run build`: passed after removing the global loading screen.
- `npx tsc --noEmit` and `git diff --check`: passed.
- Chromium lifecycle tests at 390, 900 and 1440px: passed. Actual canvas screenshots change without pointer input; animation time advances. Each exercises pointer/touch events, reduced-motion pause, simulated document visibility pause/resume, context-loss fallback and reload. No hero GLB requests or uncaught page errors; no horizontal overflow.
- WebGL unavailable: passed; headline, poster and work link remain accessible.
- JavaScript disabled: passed after the global loading-boundary fix; headline and placeholder are visible with no canvas.

The first browser run exposed the loading-boundary bug; the final focused run uses the rebuilt application. Lifecycle screenshots are in `docs/screenshots/kinetic-core-{mobile,tablet,desktop}.png`. These are actual Chromium captures, not generated mockups. Pointer/touch and tab visibility are automated simulations. Browser tests use empty API fixtures to isolate rendering from backend availability. Physical mobile, branded Chrome/Edge, long-duration GPU memory profiling and hardware frame-rate certification remain unverified.

Navigation test: passed. Navigating to Contact removes the hero, and returning mounts exactly one ready hero canvas. Six targeted scenarios passed across the lifecycle and final focused runs. Resource disposal was reviewed in source; this is not a long-duration memory leak certification.
