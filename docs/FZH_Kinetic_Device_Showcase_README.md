# FZH Kinetic Device Showcase — Project Vault upgrade

This upgrades only the Project / Selected Work visualization. Hero, Identity Capsule, Capability Matrix, project data and detail routes are preserved. As requested in the preceding revision, the showcase displays the title, device visualization and Explore project link; long explanations remain on the project detail page.

## Measured causes of softness

Before modifying the design, a Chromium browser visited the production `/projects` page with deviceScaleFactor 2. The measured output is preserved in `docs/audits/FZH_Device_Render_Before.json`.

| Viewport | Canvas CSS size | Actual buffer | Effective DPR | Native antialias | CSS transform |
| --- | --- | --- | ---: | --- | --- |
| 1366 × 768 | 972.20 × 464.44 | 1458 × 696 | 1.50 | on | none |
| 390 × 844 | 348 × 300 | 348 × 300 | 1.00 | off | none |

Confirmed contributors: mobile's one-pixel-per-CSS-pixel buffer on a DPR-2 display, disabled mobile antialiasing, capped desktop DPR, downsampled screenshot variants, and default anisotropy 1 on angled screens. Existing texture min/mag defaults already used linear/mipmap filtering; their absence in source code did not mean nearest-neighbor filtering. Existing sRGB/non-tone-mapped screen materials were appropriate and are retained. CSS canvas scaling and old screen UV distortion were **not** identified as causes. A small display cannot make every text label in a full desktop screenshot readable; inspection improves presentation, but cannot recover missing source information.

All eight real production screenshot URLs were downloaded and inspected with sharp. Original assets are roughly 1900 × 900 PNGs; no native portrait screenshots were supplied by the API. The former pipeline generated padded 1280 × 720 desktop / 640 × 360 mobile WebP at quality 82. The new main variant uses `f_webp,q_90,c_limit,w_1920`; `c_limit` preserves original aspect and never invents detail by upscaling. Full measurements, original URLs and old/new byte sizes are in `docs/audits/FZH_Device_Screenshot_Audit.json`.

| Project | Original dimensions | Original bytes | New main dimensions | WebP bytes |
| --- | --- | ---: | --- | ---: |
| Kasirku | 1917 × 907 | 279,413 | 1917 × 907 | 99,020 |
| Portofolio Ahamad Fadillah | 1902 × 908 | 292,778 | 1902 × 908 | 60,332 |
| BLP Beauty E-Commerce Website Redesign | 1904 × 909 | 1,169,313 | 1904 × 909 | 91,870 |
| Learnova | 1901 × 905 | 322,663 | 1901 × 905 | 79,966 |
| Nexxora | 1897 × 910 | 347,998 | 1897 × 910 | 59,514 |
| Raserva | 1896 × 908 | 1,820,162 | 1896 × 908 | 128,158 |
| Market-Snap | 1897 × 912 | 596,158 | 1897 × 912 | 122,476 |
| Callender Season | 1917 × 907 | 2,281,005 | 1917 × 907 | 245,564 |

## Device assets and hierarchy

`assets/blender/FZH_Kinetic_Devices.blend` contains three editable devices. `scripts/blender/create_fzh_devices.py` generates them from the existing FZH materials and geometry helpers. No external device models or new npm dependencies are used.

| GLB under `public/models/projects/devices/` | Triangles | Meshes | Hierarchy nodes | Base materials | Bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| FZH_Kinetic_Monitor.glb | 4,264 | 10 | 13 | 6 | 294,472 |
| FZH_Kinetic_Laptop.glb | 10,208 | 16 | 20 | 6 | 689,720 |
| FZH_Kinetic_Mobile.glb | 4,484 | 11 | 14 | 6 | 309,696 |

Including the reused Project_Rail (3,612 triangles / 255,964 bytes), the complete three-device scene is **22,568 triangles**, plus 24 procedural connection/pulse triangles. The former three-artifact composition used 42,264. A single laptop plus rail is 13,844 triangles. Four geometry downloads total **1,549,852 bytes**; they load once near the section and remain cached across mode/project changes.

- Monitor: FZH_Monitor_ROOT → Monitor_Chassis, Monitor_Bezel, Monitor_Screen, Monitor_Glass, Monitor_Status, Monitor_Left_Module, Monitor_Right_Module, Monitor_Back, Monitor_System_Rail and fasteners.
- Laptop: FZH_Laptop_ROOT → Laptop_Base, Laptop_KeyboardDeck, Laptop_Keys (batched lightweight geometry), Laptop_Trackpad, Laptop_Hinge_L/R, Laptop_Accent; Laptop_ScreenFrame owns the complete screen assembly, glass, bezel, status and side modules. The lid's -15° rest angle corresponds to a 105° opening relative to the keyboard deck. Its screen never moves independently of the hinge except a 0.0015-unit hover depth differential inside the bezel.
- Mobile: FZH_Mobile_ROOT → Mobile_Chassis, Mobile_Bezel, Mobile_Screen, Mobile_Glass, Mobile_Status, Mobile_Top_Module, Mobile_Bottom_Module, side rails and back detailing. Screen is 9:19.5, not a branded phone replica.

Screens are separate two-triangle UV-mapped surfaces with full normalized 0–1 coordinates. Normals point toward the viewer; the generator explicitly corrects standalone planar winding after optimization, rather than hiding a reversed face with double-sided material. Geometry retains small manufactured bevels without subdivision. Glass opacity is 0.018, with no transmission. No screenshots, cameras, lights or baked animation clips are embedded in GLBs. Runtime state controls animation.

Blender previews: `previews/FZH_Kinetic_Monitor.png`, `FZH_Kinetic_Laptop.png`, `FZH_Kinetic_Mobile.png`. Landscape previews use a genuine project screenshot only during rendering; the mobile Blender preview retains a neutral replaceable screen. The saved source and exports contain no permanently baked screenshot.

## Rendering and texture pipeline

`useProjectSceneLayout.ts` centralizes stage dimensions, device spacing, quality ranges and breakpoints. Canvas uses its real container dimensions, R3F resizing and a fitted orthographic camera; no CSS `transform: scale` is used. The laptop camera is elevated to expose the deck and align with the open lid. Camera position and zoom damp between modes; portrait mode is fitted by height as well as width.

DPR targets: desktop 1.5–2, tablet 1.25–1.5, phone 1.25–1.75. Native MSAA is enabled on all devices. A 2.8-million-pixel drawing-buffer budget caps excessive large-screen cost. Sustained slow frames over a four-second sample can reduce quality by one bounded 20% step. This is a performance response, not a promise of a particular FPS. Reduced motion does not run the adaptive sampling loop.

Screens use MeshBasicMaterial, `toneMapped=false`, explicit sRGB texture and renderer output, LinearMipmapLinearFilter, LinearFilter, generated mipmaps and anisotropy capped at min(hardware maximum, 8). No screen bloom, blur, heavy glass or realtime shadows.

`src/data/projects.ts` supports optional `project.screenshots.desktop/laptop/mobile`, plus an explicit `projectScreenshotOverrides` map for authored captures without backend schema changes. Empty by default: production data is not replaced.

- Main landscape: up to 1920px, quality 90.
- Compact landscape: up to 1280px, quality 90.
- Secondary: up to 960px, quality 90.
- Inspection landscape: up to 2560px, quality 92, loaded only when requested; original ~1900px screenshots remain ~1900px because c_limit does not upscale.
- Native portrait: up to 1080px wide. If absent, use the genuine landscape source at up to 1920px and a centered, aspect-preserving cover crop. The UI explicitly labels this as a cropped desktop preview, not a claim that a mobile screenshot exists.

Landscape fitting resizes the screen plane inside its recess to contain the image without distortion. Portrait cover adjusts UV repeat/offset instead of stretching. Textures are disposed when replaced. Current visible devices load first; an abortable near-viewport request preloads only the next project into HTTP cache. No full-resolution preload of the entire portfolio. A neutral loading/error state and DOM Explore link remain usable on texture failure; model/WebGL failure shows the normal screenshot fallback.

## Motion and state priority

`deviceMotion.ts` resolves idle, hovered, transitioning and selected targets. Each device applies those targets in one damped frame update, preventing independent animations from fighting. Camera and rail updates have separate, narrow responsibilities.

- Idle: active float amplitude 0.026 units over 5.8 seconds, pitch ~±0.52°, yaw ~±0.92°, status breath 3.2 seconds, tiny side-module movement. Laptop lid breathes about ±0.46° around its actual hinge; deck stays part of the stable root. Secondary float is 0.012.
- Hover: up to 1.04 scale, +0.13 depth, pitch ±2.5° and yaw ±4° from cursor normalized against projected device bounds. Touch pointer events do not activate tilt. Screen stays attached, with only a 0.0015-unit depth differential. Side modules extend 0.018.
- Inspection: main scale 1.12, +0.26 depth, near-frontal target, rails extend 0.027, one decaying status pulse; idle yields. Secondary devices recede. Exit smoothly restores idle.
- Device/project change: outgoing device/screen retract, turn by ~8° and fade during a 280ms departure; the next configuration settles with damping over the following ~400ms. One Canvas and cached GLBs are retained. Screenshots remain tied to their project identity and fade when newly loaded.
- Scroll: rail first, main chassis next, then secondary devices; LEDs activate over 70–85% entrance. Small scroll rotation is limited to ~2.3° in this implementation, intentionally below the allowed maximum for readability.
- Viewport/visibility: rendering pauses away from the section and in hidden tabs. Reduced motion disables repeated float, tilt, lid breathing and pulse, using demand rendering and immediate functional state updates.

## Responsive presentation

At widths ≥1280, one active device is accompanied by smaller devices of the **same project**. The monitor/laptop secondary scale is 0.60, mobile 0.43. Clicking a secondary makes that device active. Below 1280 the single-device layout keeps the main screen readable instead of squeezing a triplet; tablet depth is reduced. Phones show title/Explore, one dominant device, DOM device selector, inspection button, and project navigation. Portrait framing is height-constrained to avoid clipping a tall phone; it cannot occupy 90% width and fit a short viewport simultaneously.

Detailed project explanations remain exclusively on `/projects/[slug]`. No hover is required for navigation or inspection. `touch-action: pan-y` preserves native vertical scrolling. All three device modes remain selectable after WebGL failure.

## Validation and reproducibility

```sh
# From web; Blender 4.5 and existing Asset 01–04 helpers required.
blender -b --python scripts/blender/create_fzh_devices.py
node scripts/blender/validate_fzh_devices.mjs
npm run build
npx playwright test tests/project-devices.spec.ts
```

`tests/project-devices.spec.ts` checks real renderer buffer/CSS ratio, MSAA, pixel budget, model bounds, screenshot loading/filter settings, actual moving poses, hover, selection, device/project changes, persistent canvas, reduced motion, touch-sized layouts and context loss. A genuine 1917 × 907 Kasirku screenshot is used as a deterministic local fixture; this fixture is test-only. Original production URLs were audited independently. Screenshots are saved under `.qa/results/`.

Validation results: production build, ESLint and GLB validation passed. The combined device suite and existing Project Vault regression checks passed **22 tests** across the 16 viewports below. Visual review then caught compressed multiline project titles at tablet width; navigation rows now retain their content height. After that CSS correction, the production build and ESLint passed again, and both 1024×1366 and 390×844 browser checks passed with an added assertion that every title fits vertically inside its button.

Requested viewport coverage: 1366×768, 1440×900, 1536×864, 1920×1080, 1024×768, 768×1024, 820×1180, 1024×1366, 360×800, 375×812, 390×844, 412×915, 430×932, 2560×1440, 2560×1600 and 3840×2160.

Limits: Chromium software WebGL and emulated touch/DPR validate functionality and framing, not physical GPU or battery performance. Target desktop 60 FPS and mobile 30–60 FPS are not measured hardware guarantees. True responsive mobile captures are not yet provided by the production API; portrait fallback is a truthful crop. No source is enhanced beyond its actual resolution.
