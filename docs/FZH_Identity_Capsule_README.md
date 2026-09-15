# FZH About Identity Capsule — Asset 02

Created in Blender 4.5.3 LTS as a continuation of Asset 01. The saved Hero Kinetic Core materials are appended read-only, and its geometry helpers and preview studio are reused. Asset 01 geometry remains unchanged. The capsule is now mounted in the shared Profile section on the homepage, About, and profile detail routes. No project dependencies were added.

## Files

Paths are relative to `web/`, following Asset 01's established folder conventions.

| File | Purpose |
| --- | --- |
| `assets/blender/FZH_About_Identity_Capsule.blend` | Editable desktop model, NLA animations, studio camera/lights |
| `scripts/blender/create_fzh_identity_capsule.py` | Modular Blender generator |
| `public/models/fzh-identity-capsule/FZH_About_Identity_Capsule.glb` | Desktop GLB |
| `public/models/fzh-identity-capsule/FZH_About_Identity_Capsule_LOD.glb` | Mobile GLB, same interactive hierarchy |
| `public/models/fzh-identity-capsule/FZH_About_Identity_Capsule_poster.webp` | Static capsule fallback |
| `previews/FZH_Identity_Capsule_front.png` | 1000 × 1300 front studio render |
| `previews/FZH_Identity_Capsule_angle.png` | 1000 × 1300 three-quarter studio render |
| `previews/FZH_Identity_Capsule_web_uv.png` | Actual browser rendering with a labeled UV test image |
| `previews/FZH_Identity_Capsule_mobile_uv.png` | Mobile-width browser rendering with UV test image |
| `src/components/three/AboutIdentityCapsule.tsx` | Standalone R3F viewer and reusable Canvas child |
| `docs/FZH_Identity_Capsule_preview.html` | Local review page with portrait upload, UV check, LOD and scan controls |
| `scripts/blender/validate_fzh_identity_capsule.mjs` | GLB/Three.js/UV/material/animation validation |
| `scripts/blender/preview_fzh_identity_capsule.mjs` | Playwright browser render check |
| `docs/FZH_Identity_Capsule_stats.json` | Blender export statistics and Asset 01 source checksum |
| `docs/FZH_Identity_Capsule_validation.json` | GLB validation results |
| `docs/FZH_Identity_Capsule_browser_validation.json` | Browser validation results |
| `docs/FZH_Identity_Capsule_README.md` | This report and integration instructions |

The UV test image is generated only in the browser. It is **not** embedded in either GLB or the Blender file. No portrait, fake profile, or external image is embedded in this asset.

## Measured budget

| Metric | Desktop | Mobile LOD |
| --- | ---: | ---: |
| Triangles | 22,594 | 9,026 |
| Mesh objects | 33 | 33 |
| Transform/anchor nodes | 15 | 15 |
| Total exported nodes | 48 | 48 |
| Materials | 7 | 7 |
| GLB bytes | 1,526,876 | 564,568 |
| GLB size, decimal MB | 1.53 | 0.56 |
| Textures | 0 | 0 |

Static glTF dimensions: **1.755 wide × 2.710 high × 0.838 deep**. Width:height is approximately 1:1.54. The root is at zero in a metric scene, with Blender Z up and front -Y; glTF exports Y up and front +Z. Mesh scale is neutral, while intended orbit tilt and local pivots remain separate transforms.

Mobile is below the suggested 10,000–20,000 range because it preserves the silhouette at 9,026 triangles; extra hidden geometry was not added to fill a budget. Both versions are materially lighter than Asset 01. The `.blend` includes four studio lights and one camera; these are excluded from the GLBs.

## Design, materials and optimization

A broad 4:5 portrait surface sits behind a softly chamfered glass display. Four open corner brackets have recessed panels and a slim rear support rail. Two side-arm groups contain four short suspension struts. A tilted, segmented elliptical halo uses two very thin rails and small couplers, retaining Asset 01's circular engineering motif. Four asymmetrically placed data nodes, a compact layered docking base, an upper stabilizer, and a small `FZH / IDENTITY-02` plate complete the silhouette. The front-facing portrait area stays unobstructed by the mechanism.

Five materials reuse Asset 01's exact exported settings: Dark_Matte, Brushed_Gunmetal, Polished_Graphite, Cyan_Signal, and Titanium_Accent. Blender may suffix a material name when appending; validation normalizes only that suffix and compares the actual material data. Brushed gunmetal remains the same texture-free isotropic PBR approximation used in Asset 01.

Two display-specific materials are justified:

- **Dark_Glass_Display** derives from Asset 01's saved Dark_Glass. It retains tint/roughness but sets transmission to zero and alpha to 0.12. This exports as standard glTF `BLEND` glass, avoiding refraction and a transmission render pass over the portrait. Geometry around the panel perimeter makes the glass readable.
- **Portrait_Placeholder** is a separate neutral, non-metallic material so changing the portrait cannot change the metal or glass.

No added noise maps, external textures, large typography, booleans, subdivision surfaces, Draco, Meshopt or runtime decoder packages are used. Repeated parts are batched by material and moving assembly. Bevels use two segments on desktop and one on mobile; orbital and corner arc sampling are lower on mobile. Flat manufactured face normals match Asset 01 and avoid rippled panel reflections. Tiny branding is low-resolution converted text geometry. The portrait is a single two-triangle sheet, intentionally open and without thickness. Unused datablocks are removed before export/save.

## Portrait integration

Mesh name: **`Portrait_Plane`**, parent **`Identity_Display`**. Glass is the separate mesh **`Identity_Display_Glass`**. The portrait sheet is 1.12 × 1.40 units, with a full rectangular UV layout. Front normal is glTF +Z. Glass sits approximately 0.018 units ahead of the portrait; neither surface is coplanar.

Use a **4:5 portrait**, ideally **1024 × 1280**, or an optimized **512 × 640 WebP/AVIF** for smaller screens. The supplied component center-crops other ratios rather than stretching them. Use a same-origin URL or an image host with valid CORS headers. It does not automatically resize an oversized source image.

The reusable model exposes `onPortraitReady(plane)` with the per-instance mesh, and calls it with `null` on cleanup. It clones the loaded scene hierarchy, preserving cached geometry/materials. Dynamic images get a separately owned cloned texture and MeshBasicMaterial with `toneMapped: false`, so studio lighting does not obscure the photograph. Texture flips, color-space settings, cropping, replacement and disposal are handled by the component.

For manual Three.js integration:

```ts
const plane = scene.getObjectByName('Portrait_Plane') as THREE.Mesh;
const map = await new THREE.TextureLoader().loadAsync('/images/portrait.webp');
map.flipY = false; // glTF convention; browser UV check confirms upright orientation
map.colorSpace = THREE.SRGBColorSpace;
const material = new THREE.MeshBasicMaterial({ map, toneMapped: false });
plane.material = material;
// Dispose this owned map/material when replacing or unmounting.
```

This manual example assumes the source is already 4:5. The component implements centered cropping. Clone materials before per-instance modifications; do not dispose or mutate shared cached GLTF resources. To reduce reflections further for a bright portrait, clone the glass material and reduce its opacity from 0.12 toward 0.06. To display on a bright background, retain the graphite perimeter trim so the panel remains legible. Standard alpha blending can differ from Cycles transparency at oblique angles.

## Animation and interactive hierarchy

| Animation | Duration | Behavior |
| --- | --- | --- |
| `idle` | 10 seconds | Whole capsule floats ±0.018 units, halo moves through a slow ±0.055-radian angular excursion, four nodes drift subtly |
| `identity_scan` | 3 seconds | Thin physical scanner travels up and back over the portrait, ending at its parked position |

Both clips begin at time zero with matching endpoint transforms. Idle is a calm closed loop rather than a rapid full revolution. Scan is independent of idle and can be played once with `LoopOnce`; emission is static in GLB. The scanner rests below the portrait between scans. Only idle is enabled by default in Blender and played by the R3F example.

`FZH_Identity_ROOT` contains Identity_Frame, Identity_Display, Identity_Orbit_Mount → Identity_Orbit, Arm_L, Arm_R, Base_Module, Upper_Stabilizer, DataNode_01–04, Brand_Plate, Identity_Scan, and Profile_Label_Anchor. The anchor can host an optional HTML profile label. Geometry includes Portrait_Plane, Identity_Display_Glass, Emit_Line_01, Emit_Scan_Bar and Detail_* meshes. Use an outer wrapper for cursor/scroll effects because the mixer animates the root and orbital transforms. Separate assemblies remain addressable for future hover/scroll effects.

## React Three Fiber

The project already has `@react-three/fiber`, `@react-three/drei`, and `three`. Import the standalone component inside the existing About layout:

```tsx
import AboutIdentityCapsule from '@/components/three/AboutIdentityCapsule';

<div style={{ width: 'min(100%, 520px)' }}>
  <AboutIdentityCapsule portraitUrl="/images/your-portrait.webp" />
</div>
```

Omit `portraitUrl` to show the neutral placeholder. No real portrait is required to load the GLB. For an existing Canvas, use the named **AboutIdentityCapsuleModel** export, passing `portraitUrl`, `mobile`, `tablet`, `reducedMotion`, and optionally `onPortraitReady`. The host Canvas must provide a camera, lights/environment, DPR and fallback.

The standalone component:

- Chooses LOD below 768 px, caps DPR at 1 on mobile and 1.5 elsewhere, and slows idle to 90% on mobile and 95% on tablet.
- Uses small damped pointer parallax and no orbit controls or scroll interception. `touchAction: pan-y` preserves normal page scrolling.
- Stops float/orbit and pointer motion with prefers-reduced-motion and uses demand rendering.
- Uses a static capsule poster before loading or if the GLB/WebGL fails; when portraitUrl is supplied, the fallback displays that real image.
- Handles portrait-load failure separately so a broken image URL leaves the capsule's neutral placeholder available.
- Builds a small local environment reflection map; no remote HDR, real-time shadows, bloom or transmission pass is required.

The wrapper is decorative and aria-hidden. Keep the developer name, role, biography and links as normal HTML so About remains accessible without WebGL. The component is mounted in the shared Profile section using the existing profile.image URL. Desktop places the narrative left and capsule right; mobile places the narrative before the capsule. Viewport loading, scroll movement, and hover speed changes are enabled in the mounted component.

## Regenerate and preview

From `web/`, with Blender 4.5 LTS installed:

```sh
blender -b --python scripts/blender/create_fzh_identity_capsule.py
node scripts/blender/validate_fzh_identity_capsule.mjs
```

The generator depends on the existing `scripts/blender/create_fzh_kinetic_core.py` helpers and `assets/blender/FZH_Hero_Kinetic_Core.blend` materials. It never opens the source for writing; its SHA-256 is checked before and after generation and saved in the stats report. All output paths are relative to the script, not the current working directory. `-- --skip-previews` regenerates both GLBs and `.blend` without rerendering PNGs/poster. Rendering uses the same four-light studio and dark world as Asset 01, Cycles CPU, 40 samples and denoising.

Open `assets/blender/FZH_About_Identity_Capsule.blend` in Blender. Numpad 0 enters the prepared front camera; F12 renders it. Material Preview or Rendered mode shows the palette. Play the timeline from frames 0–300 for idle. In the NLA editor, unmute identity_scan to inspect its 0–90-frame scan, or keep only idle enabled for the standard pose.

To inspect the GLB and try a local portrait, run from `web/`:

```sh
python3 -m http.server 8768 --bind 127.0.0.1
```

Open `http://127.0.0.1:8768/docs/FZH_Identity_Capsule_preview.html`. The portrait picker loads only into this browser session. The UV check uses four labeled quadrants to show orientation; nothing is written into the exported asset. This developer page resolves Three.js from node_modules and is not intended as a production route.

With a working Playwright Chromium installation, run `node scripts/blender/preview_fzh_identity_capsule.mjs`. In this environment the missing Chromium libraries were downloaded/extracted into `/tmp`, without changing project dependencies or installing system packages. The browser check used:

```sh
LD_LIBRARY_PATH=/tmp/fzh-browser-libs/runtime/usr/lib/x86_64-linux-gnu \
  node scripts/blender/preview_fzh_identity_capsule.mjs
```

Temporary tools under `/tmp` may disappear between sessions and are not a runtime requirement for the website.

## Verification and limits

Both final GLBs pass Three.js GLTFLoader and AnimationMixer checks: finite positions/normals, valid triangle indices, positive scale, correct dimensions, named hierarchy, seven unique used materials, no missing texture resources, exactly 10/3-second clips, matching loop endpoints, front-facing portrait normals, upright full-range UVs, alpha glass, and matching Asset 01 shared material settings.

Both 1000 × 1300 Blender studio renders were visually reviewed. Chromium SwiftShader successfully rendered both variants with a dynamically assigned diagnostic image: labels appear upright and unmirrored, with the center unobstructed. Browser console page errors: zero. The local viewer's reduced-motion mode was verified static. Render calls were 34; browser triangle submissions slightly exceed asset triangle counts because the double-sided alpha glass is rendered in two passes.

The new R3F component passes ESLint. The existing test context annotation was fixed while updating integration tests; repository-wide TypeScript now passes. The original asset browser report covers the standalone Three.js review viewer. Route integration is covered separately by tests/kinetic.spec.ts.

Actual mobile/desktop hardware frame rates are not measured; SwiftShader verifies functionality, not GPU performance. A production portrait and hosting/CORS configuration still need to be supplied. The geometry is a visual display asset with intentional disconnected pieces and an open portrait plane, not a watertight manufacturing model. No fake portrait is embedded, and no Asset 03 was created.

## Website integration

`src/components/kinetic/Profile.tsx` now mounts AboutIdentityCapsule with the real `profile.image`. The former separate identity scene and tilting photo are replaced by the capsule, retaining biography, profile labels and links. `useAssetViewport.ts` loads near the viewport, pauses rendering offscreen/in hidden tabs, and restores the image fallback after WebGL context loss.

Hover smoothly increases idle speed and adds a small scale lift; pointer position tilts the object while hovered. Scrolling tilts and vertically offsets the object based on its viewport position. The core also rolls slightly. Effects ease back on pointer leave, use lower amplitudes on mobile, use touch contact as the hover equivalent, and stop with prefers-reduced-motion. Scroll listeners are passive and sampled once per animation frame, without React state updates on each scroll.

Integration validation (2026-09-15): production build and TypeScript passed; affected components pass ESLint; five targeted Playwright route tests passed, covering desktop rendering/capability navigation, mobile LOD/context loss, unavailable WebGL, failed GLB fallback, and About responsive/reduced-motion behavior.

Standby update: both objects now float, sway on multiple axes and breathe subtly at all viewport sizes, independent of hover and scroll. Mobile retains 75% motion amplitude and 90% clip speed, rather than nearly imperceptible movement. Mouse hover and touch/pen contact activate the same lift, tilt and speed response. Pointer-up/cancel/leave ends touch interaction; no pointer capture or preventDefault is used. Reduced motion still provides a static presentation, and offscreen/hidden-tab rendering is paused.

Standby verification: production build, TypeScript and affected-file lint passed. Six targeted tests passed, including actual canvas image changes with no pointer/scroll input at 390, 1024 and 1440px, stable frames with reduced motion, mobile contact handling, and responsive About/LOD checks. Shared motion calculations also verify hover and scroll responses at mobile, tablet and desktop strengths.
