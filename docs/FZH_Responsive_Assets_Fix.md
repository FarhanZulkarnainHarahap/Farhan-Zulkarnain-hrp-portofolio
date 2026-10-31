# Responsive rendering and standby correction

This supersedes the device-showcase interpretation in `FZH_Kinetic_Device_Showcase_README.md`. Mobile, laptop and monitor mean the visitor's screen sizes, not three replacement Project models. The Project scene now uses the existing FZH Project Artifact and rail again. The generated device files remain archived and are not requested by the site. Project descriptions remain on the Explore project detail route.

## Confirmed causes and changes

- Hero, About, Capability Matrix and the shared decorative scene still used DPR 1 on phones, at most 1.5 elsewhere, and disabled antialiasing on phones. All scenes now enable MSAA and use `RenderQuality`: 1.5–1.75 phone density, 1.5–2 desktop/tablet density, capped at 2.8 million buffer pixels per canvas. Actual DPR can fall below those ranges for exceptionally large canvases. Geometry LOD remains separate from raster sharpness.
- Models previously started downloading only within 100px of the viewport. A separate 1000px preload observer now mounts nearby scenes; the 100px render observer still pauses offscreen frames. The Hero GLB has an SSR preload hint matched to the visitor's screen size and mounts immediately after hydration. Capability and Project GLB requests are grouped to avoid sequential Suspense waterfalls.
- WebGL cannot render a model before its bytes and runtime arrive. The Hero poster now has gentle CSS motion while that happens, including before hydration. This is explicitly a moving poster, not a claim that the GLB is already animated. About uses the same pending-poster treatment. Loaded GLBs animate independently of portrait/logo/project texture requests.
- A system `prefers-reduced-motion: reduce` setting intentionally stops standby, including on laptops. A visible control explains this and lets the visitor explicitly enable 3D animation, or restore their device preference. This choice persists locally. It does not silently override accessibility preferences.
- Restored Project artifacts have more visible calm standby float and yaw, without requiring hover. Hero/About retain their independent continuously advancing standby targets. Screenshots, portrait and logos use anisotropic filtering up to 8×; Project screenshots keep the improved no-upscaling WebP pipeline from the prior audit.
- Project uses one artifact on phones/tablets and three on desktop. Camera framing, adaptive canvas height, native touch scrolling, inspection, image-failure fallback and the single persistent Canvas are retained.

## Validation

`tests/project-devices.spec.ts` now validates actual animated pixels across Hero, About, Capability Matrix and Project at phone, tablet, laptop and monitor widths, without pointer interaction. It also checks renderer density/MSAA, all 16 requested Project viewports, delayed-download poster animation, and explicit reduced-motion override. Existing Project Vault regression checks cover selection, touch and context loss.

Browser checks use Chromium software WebGL with emulated DPR/touch. They do not establish physical laptop/mobile FPS or battery consumption. Loading still depends on connection and device speed; no zero-load-time guarantee is made.
