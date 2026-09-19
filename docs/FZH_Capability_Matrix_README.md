# Asset 03 — FZH Kinetic Capability Matrix

The right-hand capability graph now uses actual Blender geometry: an octagonal processor, reusable chamfered technology cartridges, thin data connections and partial support rails. Existing section heading, six category tabs and live API counts remain intact. Asset 01 and Asset 02 are unchanged.

## Delivered files

- `assets/blender/FZH_Capability_Matrix.blend`: editable modular source, with reusable idle animation; preview logos are not baked into this source.
- `scripts/blender/create_fzh_capability_matrix.py`: Blender 4.5 generator using existing Asset 01 material library and geometry helpers.
- `scripts/blender/create_capability_icons.mjs`: produces local SVG icons from the installed react-icons catalog, plus temporary PNGs for Blender previews.
- `scripts/blender/validate_fzh_capability_matrix.mjs`: checks exported hierarchy, geometry, normals, UVs, material limits and idle clip.
- `public/models/capability/`: four reusable GLB components below.
- `public/icons/capability/`: 25 replaceable transparent SVG logo textures, including neutral unknown-technology fallback.
- `previews/FZH_Capability_Matrix_{frontend,hover,selected,angle}.png`: four 1400 × 1000 Blender renders using React, Next.js, Redux, CSS and TailwindCSS.
- `docs/FZH_Capability_Matrix_stats.json`: generator geometry statistics.
- `src/components/three/{CapabilityMatrix,CapabilityCore,SkillNode,CapabilityConnections}.tsx`: runtime renderer and interactions.
- `src/components/three/capabilityLayout.ts`: deterministic layouts for variable counts.
- `src/data/techStack.ts`: category mapping, icon mapping and clearly separated preview examples.
- `src/components/kinetic/Capabilities.tsx`, `src/app/globals.css`: website integration.
- `tests/kinetic.spec.ts`: integration and layout regression checks.

## Export measurements

| GLB in `public/models/capability/` | Triangles | Mesh objects | Hierarchy nodes | Base materials | Bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| FZH_Capability_Core.glb | 10,836 | 6 | 16 | 5 | 646,228 |
| FZH_Skill_Node.glb | 2,954 | 7 | 9 | 5 | 192,700 |
| FZH_Capability_Support.glb | 7,992 | 4 | 5 | 2 | 483,340 |
| FZH_Energy_Rail.glb | 216 | 2 | 3 | 2 | 16,344 |

Five named base materials are inherited from Asset 01: Dark_Matte, Brushed_Gunmetal, Polished_Graphite, Cyan_Signal and Titanium_Accent. Runtime logo textures require a material per visible logo; independent brightness requires a cloned indicator per visible cartridge and one core cyan material. GLB loaders cache components, and cartridge clones share geometry and other materials. This is object cloning rather than GPU instancing. Material instances across independently exported GLBs are not globally deduplicated.

Five-node desktop geometry totals 33,598 triangles before procedural connections. Eight-node desktop geometry totals 42,460; with connections it stays below 43,228 triangles (conservative bound). Three-node mobile mode uses 19,698 before connections and omits support drawing. Models total 1,322,268 bytes for the three runtime downloads; the optional straight rail export is not loaded because flexible connections are generated at runtime. No external textures, cameras or lights are embedded in the GLBs.

## Hierarchy and animation

```text
FZH_Capability_ROOT (runtime)
├── Category_Core
│   ├── Category_Core_Body
│   ├── Category_Core_Frame
│   ├── Category_Core_Inner
│   │   └── Processor_Floating_Die
│   ├── Category_Label_Surface
│   ├── Core_Signal_Channels
│   ├── Detail_Core_Fasteners
│   └── Core_Connection_Anchor_01 … 08
├── Capability_Support
│   ├── Orbit_Rail_Main
│   ├── Orbit_Rail_Secondary
│   ├── Background_Data_Ring
│   └── Micro_Data_Node
├── Skill_Node_Template (cloned per visible technology)
│   ├── Skill_Node_Frame / Skill_Node_Face / Node_Recess
│   ├── Skill_Node_LogoPlane (square UV, front +Z in glTF)
│   ├── Skill_Node_Indicator / Node_Technical_Grooves
│   ├── Connector_Node
│   └── Connection_Anchor
└── Runtime_Data_Connections
```

The Blender source also contains Energy_Rail_Template with Energy_Rail and Energy_Rail_Signal. Only the core embeds an animation: `idle`, 10 seconds, approximately ±3.4° inner-processor movement. Hover, scroll, selection and category resets are runtime interactions, not baked clips. Category labels and technology names use HTML, with no text geometry.

## Category and interaction architecture

Production skills continue to come from `/api/skills`. Name-based category mapping preserves the existing database/infrastructure grouping and assigns Figma to Tools. Unknown technology icons use a neutral code symbol. `capabilityExamples` is for preview/test use and does not populate missing production skills. Detail panels only show known name and category; no invented experience, project totals or proficiency claims.

`Capabilities` owns category and selectedSkillId. `CapabilityMatrix` retains the same canvas and cached models across category changes. Old nodes retract for 320 ms; incoming nodes expand with damping and stagger, settling in roughly one second. The core frame resets by 60°. Rapid category changes cancel the previous timer. Selecting the active category clears the node lock.

`SkillNode` implements independent 0.022-unit idle float, hover lift 0.11, selected lift 0.19, scale 1.06/1.08, and cursor tilt capped at approximately 3°/4°. Other logos dim 20%, while indicators dim and nodes recede slightly. Clicking another node transfers the lock. Clicking canvas background or Clear selection releases it. All technologies also have keyboard-accessible DOM buttons and a live HTML detail panel outside WebGL.

`CapabilityCore` plays the idle clip, adds a small float and cyan breathing, acknowledges active nodes and turns slightly toward the selected position. `CapabilityConnections` draws dark narrow rails, cyan lines and outward moving pulses. Hover/selection strengthens the corresponding connection.

`useAssetViewport` samples native scroll into a mutable ref, starts loading near the viewport and stops continuous rendering outside it or in hidden tabs. Scroll progressively reveals core, staggered nodes and connections, with small overall parallax. No scroll capture or added animation dependencies.

## Responsive and accessibility behavior

- Desktop: 1–5 tailored arc arrangements, 6+ staggered rows, maximum 8 visible nodes per page. Pointer hover, selection and parallax; DPR capped at 1.5.
- Tablet: smaller pointer sensitivity and one background detail ring hidden.
- Mobile: core above a shallow row, at most 3 cartridges per page, previous/next controls, no support geometry drawing or pointer tilt, DPR 1. Touch selection and `touch-action: pan-y` preserve vertical scrolling.
- Reduced motion: no float, rail movement or pulses; demand rendering and immediate node changes preserve interaction.
- WebGL failure/context loss: canvas is removed, but category navigation, skill buttons, pagination and selection details remain usable.
- Empty categories show the core plus a factual empty message.

## Rebuild and validate

Run from `web/`:

```sh
node scripts/blender/create_capability_icons.mjs
blender -b --python scripts/blender/create_fzh_capability_matrix.py
node scripts/blender/validate_fzh_capability_matrix.mjs
npm run build
npx playwright test --grep 'capability matrix|capability layouts|desktop spatial scene'
```

Requires Blender 4.5 and existing Asset 01/02 generator helpers. Icon generation uses the project's existing dependencies; no packages were added. Preview PNGs are recreated under `.qa/capability-icons` before Blender renders.

## Practical limits

Geometry and automated browser behavior are measured; hardware FPS, battery usage and physical iOS/Android devices have not been benchmarked. Browser coverage here is Chromium software WebGL and responsive viewports. Mobile hides the support component but still downloads it through the common cached loader. The flat accessible control list stays available below the 3D stage. Optional boot/core_reset clips, opening cartridge faces and custom shaders were not added. The dark glass material remains available in the source library, but this asset uses recessed graphite faces for clean logo contrast.
