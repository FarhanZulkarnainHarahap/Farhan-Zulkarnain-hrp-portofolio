# Kinetic Systems — implementation and QA

The portfolio has been rebuilt around a shared dark design system, connected architecture graphics, and dedicated public pages. Farhan’s existing photograph and published backend data are retained.

## Changed experience

- Home: identity hero, interactive system architecture, profile, capability graph, trajectory, selected project explorer, engineering principles, transmission form, and Jakarta-time footer.
- About, profile detail, capabilities, documents/CV, Journey, Projects, project details, Contact, 404, and error/loading states use the new visual system.
- Navigation includes numbered routes, mobile focus handling, active states, Ctrl/Cmd+K search, arrow-key selection, Enter, Escape, and focus restoration.
- Dashboard: new sidebar/topbar, overview, dark editor surfaces, accessible native modals, deletion confirmations, collection retries, and a new experience editor. Existing project, skill, and document workflows remain connected to their supported endpoints.

## Main files

Created:

- `src/components/kinetic/`: shared shell, hero, profile, capability graph, trajectory, projects, contact, documents, scene state, Three.js scene, fallback, motion/media primitives, and dialog/confirmation helpers.
- `src/lib/api-config.ts`, `src/lib/image-loader.ts`, `src/lib/skill-icons.ts`.
- Public collection read route, experience admin route, dashboard entry route, auth/dashboard metadata layouts, 404/error/loading routes.
- `public/visuals/system-map.svg`, `playwright.config.ts`, browser tests and public-data fixtures.
- Backend: Prisma runtime copy script and destructive-route authorization tests.

Updated:

- Global CSS, public page composition, navigation, nested About pages, project details, admin/auth screens, API client/server service, route protection, configuration, and documentation.
- Backend document/project DELETE routes now require a verified ADMIN token. Backend build copies Prisma runtime assets, and start uses the compiled `dist/src/app.js` entry point. No database schema or migration changes.

Removed:

- 42 unreachable legacy source files, including CyberBackground, old Three.js scenes, cursor, intro/loading overlays, old sections, unused hooks, and duplicate fetch paths.
- Nine unused legacy decorative/audio/template assets.

Existing user edits in `web/LICENSE` and `api/src/app.ts` were preserved.

## Data, motion, and performance

- Public GET requests use a server-side whitelist of four resources and the configured primary API. This avoids browser CORS failures during local public-page development. Auth and mutations continue to use backend credentials directly.
- Requests have timeouts; failures expose retry or a clear form/route error. Failed contact requests never display success.
- Case studies only display stored content. The empty experience collection falls back to milestones already present in the original profile, without invented dates.
- Three.js uses one persistent Canvas and 37 original Blender assets (2,143,044 bytes combined). Hidden scenes pause. Camera, node transforms, and spline geometry interpolate with section/selection state. The hero core follows the cursor, a Blender scroll runner passes vertically with scroll direction, identity cards have 3D hover treatment, and capability hover states load matching `tech-*` Blender badges for the published stack. Mobile uses reduced geometry and simple signal materials; reduced-motion, low-end hardware, failed assets, and lost WebGL use the FZ SVG. Project explorer centers the real website preview image and navigates through that browser window. Editable `.blend` files and the generator are documented in `assets/blender/README.md`.
- Cloudinary images use responsive widths and automatic formats. Invalid/failed sources have a fallback. Admin icons use an explicit catalog instead of importing entire libraries.

## Verification

- `npm run lint`: passed, no warnings/errors.
- `npm run build`: production frontend build passed.
- Backend build: Prisma generation, TypeScript, and runtime asset packaging passed.
- `npm run test:guards`: two backend authorization regressions passed without invoking database mutations.
- Browser verification: 12 of 13 scenarios passed in the full run. After correcting the project navigation test’s pointer position and capturing the destination at click time, both affected scenarios (project navigation and persistent desktop scene) passed on the final build. All 13 scenarios are covered across these runs.
- `node scripts/qa/check-models.mjs`: all 37 GLB files passed structure, vertex, material, uniqueness, animation-target, and size checks.
- Blender-specific browser checks cover mobile low quality, lost WebGL, failed model loading, persistent Canvas identity, and navigation from the selected project carrier.
- Browser suite covers public/auth/admin routes, widths 360/390/430/768/1024/1280/1440/1920, keyboard navigation, API failure/retry, contact success/failure, JWT protection, supported CRUD contracts, WebGL/fallback/reduced motion, and live public API/project/CV reads.
- Local browser reports and screenshots: `.qa/report/` and `.qa/results/`. Per-file change manifest: `.qa/change-manifest.json`.

## Practical limits

- Authenticated login/logout and CRUD were tested with isolated local JWTs and intercepted API responses. No production admin credentials were supplied; live authenticated writes and email delivery were not exercised.
- Skill PUT/PATCH and document in-place updates do not exist in the current Express API, so the UI does not expose them. Upload/delete remain supported.
- The production experience collection is empty. Existing profile milestones remain visible until dated entries are published.
- Changes are in the local repositories; they have not been deployed.
