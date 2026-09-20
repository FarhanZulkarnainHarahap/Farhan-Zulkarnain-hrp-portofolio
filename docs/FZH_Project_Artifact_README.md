# Asset 04 — FZH Kinetic Project Vault

The Project section uses reusable mechanical display capsules with actual project screenshots. It preserves the global design, heading, project index, live API data and DOM links. Project motion is calmer than the Capability Matrix. No new dependencies, laptop models, browser chrome, invented project content, or subsequent asset were added.

## Delivered files

- `assets/blender/FZH_Project_Artifact.blend`: editable source including one capsule and structural rail. The screenshot plane is neutral, without baked project imagery.
- `scripts/blender/create_fzh_project_artifact.py`: Blender 4.5 generator. Imports existing Asset 01 geometry/materials and Asset 02/03 helper functions without modifying their sources or assets.
- `scripts/blender/validate_fzh_project_artifact.mjs`: GLTFLoader validation of hierarchy, finite geometry, normals, correct screen UV orientation, glass opacity and budgets.
- `public/models/projects/FZH_Project_Artifact.glb`: reusable capsule.
- `public/models/projects/FZH_Project_Rail.glb`: separate support rail.
- `previews/FZH_Project_Artifact_front.png`, `FZH_Project_Artifact_angle.png`, `FZH_Project_Vault_idle.png`, `FZH_Project_Vault_hover.png`, `FZH_Project_Vault_selected.png`: five 1400 × 900 Blender renders. The same genuine Kasirku screenshot is repeated to illustrate chassis reuse, not to claim three different projects.
- `docs/FZH_Project_Artifact_stats.json`: generator measurements.
- `src/data/projects.ts`: typed adapter, responsive screenshot URLs and active/previous/next window.
- `src/components/three/projects/ProjectVault.tsx`: canvas lifecycle, reduced motion, viewport suspension and image fallback.
- `ProjectScene.tsx`: cached models, camera fitting, lights, and three-instance window.
- `ProjectArtifact.tsx`: screenshot textures, mechanical motion, selection and pointer events.
- `ProjectRail.tsx`, `ProjectConnections.tsx`: structural entrance and occasional data pulse.
- `src/components/projects/ProjectNavigation.tsx`, `ProjectDetails.tsx`: keyboard/touch navigation and real HTML content.
- `src/components/kinetic/Projects.tsx`, `src/app/globals.css`: integration into both selected work and `/projects`.
- `tests/kinetic.spec.ts`: project selection, persistent canvas/downloads, context loss, mobile tap, reduced motion and overflow checks.

## Measurements

| Component | Triangles | Mesh objects | Hierarchy nodes | Materials | Bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| Artifact | 12,876 | 19 | 25 | 6 | 851,164 |
| Rail | 3,612 | 5 | 6 | 3 | 255,964 |

Three capsules plus rail total **42,240 triangles**, plus 24 triangles for two runtime connection/pulse boxes. Mobile renders one capsule: **16,512 triangles** including those boxes. Models together are 1,107,128 bytes before HTTP compression. The six material families are Dark_Matte, Brushed_Gunmetal, Polished_Graphite, Titanium_Accent, Cyan_Signal and Screen_Glass_Subtle. Glass derives from Asset 01, uses alpha 0.035 and no transmission, to keep the screenshot legible.

Clones share geometry and static materials. Each instance owns a screenshot material/texture and independently animated cyan materials. These runtime variants increase material instances beyond the six base families. The system uses cloning, not GPU instancing. No cameras, lights, screenshot images or animation clips are exported. Standby is implemented entirely in R3F; the optional Blender idle clip was intentionally omitted.

## Model hierarchy

```text
PROJECT_ROOT
├── Artifact_Chassis
├── Artifact_Frame
├── Screen_Frame
├── Screenshot_Plane
├── Screen_Glass
├── Left_Rail
│   └── Left_Rail_Segments
├── Right_Rail
│   └── Right_Rail_Segments
├── Tech_Slot_Group
│   └── Tech_Slot_01 … Tech_Slot_05
├── Status_Module
│   ├── Status_Display_Surface
│   └── Status_Light
├── Project_Index_Surface
├── Connector_Module
├── Accent_Light
├── Detail_Plates
├── Mechanical_Back
└── Connection_Anchor
Project_Rail
├── Rail_Segments
├── Rail_Data_Trace
└── Dock_01 … Dock_03
```

Blender faces -Y; glTF faces +Z with Y up. Screenshot_Plane is a separate two-triangle 2.8 × 1.575 (16:9) plane. Runtime textures use `flipY=false`, sRGB and an unlit, non-tone-mapped material. No cyan tint is applied. Side rails have independent pivots; project index/title are runtime HTML overlays.

## Interaction and data

`/api/portofolios` remains the source. Selected work keeps its existing four-project limit; the full project page exposes every returned project. There is no fabricated role, deployment status, proficiency or result. Status lights indicate interaction, not verified uptime. Up to five tech indicator slots appear according to actual stack length; stack names stay in HTML.

- Standby: active float amplitude 0.019 units, inactive 0.007; slow status breathing. Rail pulse travels for 2.5 seconds per nine-second cycle.
- Hover: +0.12 camera depth, scale 1.045, pitch ≤2.5°, yaw contribution ≤4°, side rails shift 0.02. Neighbors retain 88% screenshot brightness. Pointer hover does not select a different project or navigate away.
- Inspection: clicked project becomes central, scale 1.12, +0.25 depth, front-facing, rails extend 0.03, cyan detail activates. Neighbors move back to -0.65. The showcase retains only the project title and Explore project link. Inspection changes the 3D presentation only; description, stack, problem, solution, outcome, features and external links live on the dedicated project detail route.
- Change: keyed project instances keep their screenshots while positions interpolate; cached GLBs and canvas remain mounted. Typical settling is around 0.5–0.9 seconds. The incoming neighbor gently appears instead of replacing a screenshot on the wrong chassis.
- Scroll: native page progress reveals rail (0–15%), main artifact (15–35%), neighbors (35–60%), then settles. Small positional/rotational parallax stays readable; no wheel interception, scroll snapping or capture.
- Deselect: Exit inspection or canvas background. Click/tap another capsule, project index, or previous/next to change the inspected project. Live/Source/Explore links are normal DOM anchors and require their own activation.

## Responsive behavior, fallbacks and performance

Desktop shows at most three artifacts. Tablet uses the same three-instance arrangement fitted to its available width, with depth and parallax reduced to 65%; neighboring capsules remain smaller and behind the active one. Mobile uses one artifact with explicit previous/next controls and disables cursor hover. Canvas uses `touch-action: pan-y`. The title and Explore project link remain below the canvas without requiring inspection. Explore project navigates to the dedicated detail page for descriptions, stack and links.

DPR is capped at 1.5 desktop, 1 mobile. Lightweight fixed environment plus two directional lights; no realtime shadows, bloom or postprocessing dependencies. Intersection/visibility state pauses rendering outside the viewport or in hidden tabs. Reduced motion uses demand rendering, disables floating, pulses and tilt, and applies selection targets immediately.

Only visible project textures load: current plus neighbors on desktop, current on mobile. Cloudinary URLs request padded WebP 1280 × 720 or 640 × 360 at quality 82. Textures are disposed when their instance leaves the window. Other valid local/HTTP image sources load directly and must supply appropriate resolution, aspect ratio and CORS. Loading/failed textures show an explicit loading/unavailable label on a neutral screen while the title and Explore project link remain available. Model/WebGL failure and context loss show a normal screenshot fallback alongside the title, Explore project link and navigation.

## Reproduce

From `web/`, optionally put the existing project's screenshot at `.qa/project-preview.png` for render-only use. The generator never embeds it into exported GLBs or the saved source.

```sh
blender -b --python scripts/blender/create_fzh_project_artifact.py
node scripts/blender/validate_fzh_project_artifact.mjs
npm run build
npx playwright test --grep 'project vault'
```

Requires Blender 4.5 and the existing Asset 01–03 helper scripts/material source. No new npm dependencies. Browser test artifacts are written under ignored `.qa/results/`.

## Limits

Validation covers geometry and Chromium browser behavior, including an emulated touch viewport. Screenshot regression tests use a local WebP fixture derived from the genuine Kasirku image; the production Cloudinary URL was separately checked for a successful image response and CORS. Physical iOS/Android and hardware FPS/battery measurements remain untested. The source model has no baked idle clip. Status strings are not displayed because the current API does not provide verified deployment state. Runtime external screenshots depend on their host/CORS. Arbitrary jumps in a long project list mount the newly visible neighbors; the canvas and base GLB assets are retained.
