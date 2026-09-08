# Farhan — Kinetic Systems assets

Original models authored by `scripts/blender/generate-assets.py` using Blender 5.2. No stock models or external textures. The `.blend` files retain the editable, named parts; optimized GLB files in `public/models` batch static meshes by material and preserve the project shutters as animation targets.

Regenerate from the web directory (native Blender):

```sh
blender --background --factory-startup --python scripts/blender/generate-assets.py -- --output "$PWD/public/models"
node scripts/qa/check-models.mjs
```

Windows Blender from this WSL workspace:

```sh
/mnt/d/Aplication/blender.exe --background --factory-startup --python "$(wslpath -w "$PWD/scripts/blender/generate-assets.py")" -- --output "$(wslpath -w "$PWD/public/models")"
```

The FZ core uses a layered chamfered chassis, asymmetric fins, signature letter contours, and cyan data channels. Twelve symbols share its manufactured edges: frontend, backend, database, API, cloud, deployment, architecture, UI, code, performance, infrastructure, and creative systems. The project carrier includes independent shutters, connection ports, technology markers, and a status strip. The portrait rig wraps the identity photo section, and the scroll runner is a small craft that passes vertically through the scene based on scroll direction. Capability hover states use dedicated `tech-*` assets for the live skill data: React, Redux, CSS, Tailwind, Next.js, Node.js, Express, NestJS, Bun, PostgreSQL, MongoDB, Prisma, Supabase, AWS, Vercel, Docker, GitHub, TypeScript, JavaScript, Figma, and Visualstudio. Project index and real project images are supplied at runtime.

The frontend maintains one Canvas in `SceneHost`, moving it between DOM illustration slots without replacing its WebGL context. `CameraRig` and the components interpolate scene states. Desktop uses five capability nodes and seven secondary symbols; tablet reduces secondary symbols; mobile uses three capability nodes and unanimated signal materials. Reduced motion, low-end devices, and failed WebGL retain the authored SVG illustration. Cached GLB geometry is shared between hierarchy clones; generated signal/index geometry and project textures are disposed by their owners.
