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
- Three.js is dynamically loaded only for visible desktop scenes. Hidden scenes unmount/pause, DPR is capped, and mobile/reduced-motion/failed-WebGL use SVG. Capability/project state affects connections; the hero supports drag.
- Cloudinary images use responsive widths and automatic formats. Invalid/failed sources have a fallback. Admin icons use an explicit catalog instead of importing entire libraries.

## Verification

- `npm run lint`: passed, no warnings/errors.
- `npm run build`: production frontend build passed.
- Backend build: Prisma generation, TypeScript, and runtime asset packaging passed.
- `npm run test:guards`: two backend authorization regressions passed without invoking database mutations.
- `npm run test:e2e`: all 10 browser tests passed in the final run.
- Browser suite covers public/auth/admin routes, widths 360/390/430/768/1024/1280/1440/1920, keyboard navigation, API failure/retry, contact success/failure, JWT protection, supported CRUD contracts, WebGL/fallback/reduced motion, and live public API/project/CV reads.
- Local browser reports and screenshots: `.qa/report/` and `.qa/results/`. Per-file change manifest: `.qa/change-manifest.json`.

## Practical limits

- Authenticated login/logout and CRUD were tested with isolated local JWTs and intercepted API responses. No production admin credentials were supplied; live authenticated writes and email delivery were not exercised.
- Skill PUT/PATCH and document in-place updates do not exist in the current Express API, so the UI does not expose them. Upload/delete remain supported.
- The production experience collection is empty. Existing profile milestones remain visible until dated entries are published.
- Changes are in the local repositories; they have not been deployed.
