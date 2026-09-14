# FZH Hero Kinetic Core — Asset 01

Original geometry generated in Blender 4.5.3 LTS. A standalone asset and optional React Three Fiber viewer; existing portfolio routes and hero layout are unchanged. No dependencies were added.

## Deliverables

All paths below are relative to `web/`:

| File | Purpose |
| --- | --- |
| `assets/blender/FZH_Hero_Kinetic_Core.blend` | Editable desktop scene, animations, studio lights, camera |
| `public/models/fzh-kinetic-core/FZH_Hero_Kinetic_Core.glb` | Desktop GLB |
| `public/models/fzh-kinetic-core/FZH_Hero_Kinetic_Core_LOD.glb` | Mobile GLB, same hierarchy and clips |
| `public/models/fzh-kinetic-core/FZH_Hero_Kinetic_Core_poster.webp` | Static fallback, generated from front render |
| `scripts/blender/create_fzh_kinetic_core.py` | Reproducible, modular Blender generator |
| `scripts/blender/validate_fzh_kinetic_core.mjs` | Three.js loader, animation, geometry and budget checks |
| `scripts/blender/preview_fzh_kinetic_core.mjs` | Optional Playwright browser smoke check |
| `previews/FZH_Hero_Kinetic_Core_front.png` | 1200 × 1200 front product render |
| `previews/FZH_Hero_Kinetic_Core_angle.png` | 1200 × 1200 three-quarter product render |
| `src/components/three/HeroKineticCore.tsx` | Standalone viewer and reusable Canvas child |
| `docs/FZH_Hero_Kinetic_Core_preview.html` | Local interactive Three.js review viewer |
| `docs/FZH_Hero_Kinetic_Core_stats.json` | Blender export statistics |
| `docs/FZH_Hero_Kinetic_Core_validation.json` | Actual GLB validation results |
| `docs/FZH_Hero_Kinetic_Core_README.md` | This report and integration guide |

The optional browser smoke check writes `previews/FZH_Hero_Kinetic_Core_web.png` when it succeeds. That screenshot was **not** generated here: Chromium could not start because its system library `libnspr4.so` is missing.

## Measured asset budget

| Metric | Desktop | Mobile LOD |
| --- | ---: | ---: |
| Triangles | 52,076 | 20,844 |
| Mesh objects | 31 | 31 |
| Total exported nodes, including 12 transform nodes | 43 | 43 |
| Materials | 6 | 6 |
| GLB bytes | 3,226,232 | 1,208,460 |
| GLB MiB | 3.08 | 1.15 |
| Texture images | 0 | 0 |
| Static dimensions, glTF X / Y / Z | 3.568 / 3.568 / 2.077 | 3.568 / 3.568 / 2.077 |

The Blender scene additionally contains four preview lights and one camera, excluded from both GLBs. GLB sizes are uncompressed; HTTP Brotli/gzip can reduce transfer cost without requiring a decoder in the component. The poster is approximately 70 KB.

## Visual and technical decisions

Twelve segmented outer housings establish the silhouette. An interrupted pair of rails and cross braces form the structural ring. Twenty-four data-register segments make the third ring visibly distinct. A gimbal mount tilted 42 degrees carries a partial hoop, bearings, and an orthogonal internal fork. Three small modules float around a central assembly of separated octahedral shell panels, faceted transmissive glass, an emissive polyhedron, and a narrow internal signal bus. A small geometric `FZH / CORE-01` plate provides identity.

The six materials are Dark_Matte, Brushed_Gunmetal, Polished_Graphite, Dark_Glass, Cyan_Signal, and Titanium_Accent. Gunmetal uses a texture-free isotropic PBR approximation rather than actual anisotropic brushing. Cyan is confined to narrow signals and the central core. No external textures or font files are needed. All shaders use exportable Principled inputs; glass uses glTF transmission and cyan uses emissive strength.

Arc meshes are constructed directly, with closed segment ends, strategic chamfers, and recalculated normals. Flat face normals keep panel reflections clean; smooth weighted normals were rejected after render review because they produced ripples along narrow chamfers. No subdivision, booleans, texture atlases, or runtime decoder dependencies are used. Repeated parts are batched by material and moving assembly to keep object counts modest. LOD lowers arc sampling and uses one bevel segment instead of two. Small typography remains geometry but has low curve resolution.

Root position and all mesh scales are neutral. Local geometry is authored around each moving pivot; intentional gimbal tilt and module positions remain on transform parents. Blender uses Z up and front -Y; export converts to glTF Y up, front +Z. Diameter is approximately 3.57 metric scene units. Cameras and studio lighting are only in the `.blend`.

## Animation and interaction

| Clip | Duration | Behavior |
| --- | --- | --- |
| `idle` | 10 s | Slow, opposite angular excursions of the outer and structural rings, data-ring motion, off-axis gyro motion, core pulse, subtle module drift |
| `core_pulse` | 3 s | Independent transform pulse on Core_Energy |
| `boot` | 3 s | Rings expand from 88% scale into alignment; core grows from 12% to full size |

Idle uses a closed sinusoidal motion instead of a rapid full revolution. First and last transforms match. Exported tracks are sampled at 30 fps and begin at time zero. Material emission is static in GLB. All three clips are exported from matching named NLA tracks; only idle is active by default in Blender.

Play `idle` alone for normal display. `core_pulse` and `idle` both target Core_Energy scale: crossfade between them or disable idle's scale track if layering effects. Play boot once using `LoopOnce`, then transition to idle at its rest pose. The example only plays idle.

`FZH_Core_ROOT` contains `Ring_Outer`, `Ring_Structure`, `Ring_Data`, `Gyro_Mount` → `Ring_Gyro` → `Gimbal_Internal`, `Core_Assembly` → `Core_Energy`, and `Module_01` through `Module_03`. Meshes include `Core_Shell`, `Glass_Core`, `Emit_Core`, `Emit_Ring_01`, and `FZH_Brand_Plate`. `Detail_*` nodes can be hidden without affecting structural geometry. Rotate a separate wrapper for pointer and scroll effects so the animation mixer retains ownership of ring transforms.

The sample clones the hierarchy but shares cached GPU meshes/materials. Before changing `Cyan_Signal.emissiveIntensity` per instance, clone that material and dispose the clone when unmounting. Bloom is optional and is not included. Real-time reflections should come from a small environment map; the example generates one locally with Drei Lightformers.

## Regenerate and validate

From `web/`, with Blender 4.5 installed:

```sh
blender -b --python scripts/blender/create_fzh_kinetic_core.py
node scripts/blender/validate_fzh_kinetic_core.mjs
```

This execution used a temporary standalone installation:

```sh
/tmp/blender-4.5.3-linux-x64/blender -b --python scripts/blender/create_fzh_kinetic_core.py
```

The temporary Blender installation is not a project dependency. The generator resolves all output paths relative to its own location. `-- --skip-previews` skips PNG and poster regeneration. Rebuilding overwrites only this asset's generated deliverables. LOD is built/exported first; desktop is then built, saved, and rendered. Rendering uses Cycles CPU with 40 samples and denoising.

The validation script loads both binaries with the installed Three.js GLTFLoader, checks buffer headers, materials, missing external resources, named hierarchy, positive scales, finite positions/normals, valid indices, dimensions, triangle caps, exact clip durations, and matching loop endpoints. It also evaluates every clip using AnimationMixer. Both files pass. This is a targeted pipeline check, not Khronos certification or exhaustive self-intersection analysis.

## Preview in Blender

Open `assets/blender/FZH_Hero_Kinetic_Core.blend`. Use numpad 0 for the prepared front camera, Home to frame the asset, and Space to play the 0–300 frame idle range. Switch to Material Preview or Rendered mode for materials. The NLA editor exposes idle, core_pulse, and boot; unmute only the clip being reviewed. F12 renders the camera. The pre-rendered front and three-quarter images are under `previews/`.

For an interactive local GLB viewer, from `web/` run:

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

Open `http://127.0.0.1:8767/docs/FZH_Hero_Kinetic_Core_preview.html`. Drag to orbit, select either quality, and pause/play idle. This local developer page resolves Three.js from node_modules and is not a production route. With Playwright system dependencies installed, `node scripts/blender/preview_fzh_kinetic_core.mjs` automates loading both variants and takes a screenshot.

## React Three Fiber integration

The repository already includes React Three Fiber, Drei, and Three.js. Import the standalone viewer wherever the asset should appear:

```tsx
import HeroKineticCore from '@/components/three/HeroKineticCore';

// Inside the existing layout; width controls the square responsive presentation.
<div style={{ width: 'min(100%, 800px)' }}>
  <HeroKineticCore />
</div>
```

For an existing Canvas, use the named `HeroKineticCoreModel` export with `mobile`, `tablet`, and `reducedMotion` props. The host supplies camera, lights/environment, DPR, and the accessible/static fallback.

The standalone viewer selects mobile LOD below 768 px, slows idle to 55% on mobile and 80% on tablet, caps mobile DPR at 1 and desktop DPR at 1.5, and adds small pointer parallax. It uses no orbit controls, scroll interception, postprocessing, or real-time shadows. `touchAction: pan-y` preserves page scrolling. With prefers-reduced-motion, idle and parallax stop and the Canvas uses demand rendering. A static WebP appears before hydration, during asset loading, and if WebGL or GLB loading fails. The decorative viewer is aria-hidden; keep the developer name, role, and links as ordinary accessible HTML outside it.

## Verification and remaining limits

- Both PNGs visually reviewed: distinct rings, readable silhouette, restrained cyan, faceted core, subtle FZH marking.
- Both final GLBs pass the recorded Three.js validation, including exact 10 / 3 / 3-second clip timings and loop endpoints.
- Component-specific ESLint passes. Repository-wide TypeScript is blocked by an existing implicit-any `this` at `tests/kinetic.spec.ts:432`; no unrelated test was changed.
- Browser GPU rendering and measured desktop/mobile frame rates remain unverified: Chromium could not start due to missing libnspr4.so, including outside the sandbox. The R3F component has not been mounted in an existing route. Benchmark on actual target devices before assigning a performance SLA.
- Cycles transmission and reflections differ from browser PBR; the web environment must provide suitable reflections. Glass adds a transmission pass even though its geometry is small. For very weak devices, use the static poster or replace glass with opaque graphite in a separately owned material instance.
- No Draco/Meshopt compression, actual anisotropic brushed texture, emissive-material keyframes, or physics/collision guarantees. The model is a visual portfolio asset with intentionally disconnected mechanical parts.
