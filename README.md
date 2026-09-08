# Farhan — Kinetic Systems

Next.js portfolio for Farhan Zulkarnain Harahap. Public pages and the admin workspace share the palette and typography in `src/app/globals.css`.

## Run

```sh
npm ci
npm run dev
npm run lint
npm run build
npm run start
```

Copy `.env.example` to `.env` and configure the API origin and server-only JWT signing secret. The signing secret must match the backend. Never prefix it with `NEXT_PUBLIC_`.

## Architecture

- Public routes: `/`, `/about`, `/about/detail`, `/about/skills`, `/about/docs`, `/journey`, `/projects`, `/projects/[slug]`, `/contact`.
- Shared UI, data hooks, motion, command palette, and spatial components: `src/components/kinetic` and `src/components/Navbar.tsx`.
- API origin: `src/lib/api-config.ts`. The browser API client uses same-origin `/api/public/[resource]` for the four public collections. The server forwards only whitelisted GET requests to the configured primary backend, without credentials.
- Authenticated calls and mutations go directly to the primary API, with credentials. The backend must allow the frontend origin and issue cookies for the frontend domain. Production domain cookies cannot authenticate an unrelated localhost domain; use a local backend configured for localhost for real local login.
- Every data request has a timeout. Public collections expose loading, empty, error, and retry states. Project detail failures use the route error boundary.
- `src/proxy.ts` verifies JWTs and enforces ADMIN for both `/admin/*` aliases and `/dashboard/admin/*` routes. Admin layouts also verify the profile with the backend.
- Project details render only stored fields. Journey uses existing profile milestones when no dated experiences are published; it does not invent dates.
- Cloudinary image previews use responsive `srcset` widths and automatic formats through a Next Image loader. Invalid or failed images show a local fallback.
- Three.js renders original Blender assets through one persistent Canvas shared by the six scroll states. Desktop, tablet, and mobile have separate quality levels; reduced motion, low-end hardware, failed models, or lost WebGL use authored SVG. DOM capability/project selection drives the models and camera; the hero core follows the cursor, a scroll-runner craft crosses each scene with scroll direction, identity/project cards have 3D hover treatment, and each published tech stack skill can show a matching Blender badge. See [Blender asset pipeline](assets/blender/README.md) for editable sources and regeneration commands.

## Supported admin operations

| Resource | API methods | UI |
| --- | --- | --- |
| Projects | GET, POST, PUT, DELETE | List, upload, edit, delete |
| Skills | GET, POST, DELETE | List, add, delete |
| Experiences | GET, POST, PUT, DELETE | List, add, edit, delete |
| Documents | GET, POST, DELETE | List, upload, delete |

Skill editing and in-place document updates are not exposed by the current Express backend. The UI does not pretend to support them. Subject is serialized into the contact message because the API accepts `name`, `email`, and `message`.

## Browser QA

```sh
npx playwright install --with-deps chromium
npm run build
npm run test:e2e
```

Playwright starts the production app on localhost:3101 with an isolated test signing key. The regression tests intercept all mutations; test credentials never reach the production API. A separate live test only reads public collections, a project detail, and a CV download. Screenshot artifacts and the HTML report are in `.qa/` and are ignored by Git. The live integration test requires access to the configured backend.
