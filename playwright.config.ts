import { defineConfig } from "@playwright/test";

/**
 * Default suite. No test here reaches the production API:
 *   - browser reads are mocked per test (context.route) or answered by the fixture API;
 *   - server reads use API_URL → tests/fixture-api.mjs (scenarios: normal/empty/fail/extreme);
 *   - CONTENT_CACHE=off so scenario switches are visible immediately.
 * The @live test (real API) lives in tests/live.spec.ts and runs via playwright.live.config.ts.
 */
export const FIXTURE_API = "http://localhost:3190";
const env = {
  JWT_SECRET: "kinetic-local-qa-only-not-a-production-secret",
  API_URL: FIXTURE_API,
  CONTENT_CACHE: "off",
};

export default defineConfig({
  testDir: "./tests",
  // live: real API (playwright.live.config.ts); browsers: Firefox + WebKit (playwright.browsers.config.ts).
  testIgnore: [/live\.spec\.ts/, /-browsers\.spec\.ts/],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  fullyParallel: false,
  reporter: [["list"], ["html", { outputFolder: ".qa/report", open: "never" }]],
  outputDir: ".qa/results",
  // Keep baseline names independent of the project name (admin-visual baselines predate projects).
  snapshotPathTemplate:
    "{testDir}/{testFileName}-snapshots/{arg}{-snapshotSuffix}{ext}",
  use: {
    baseURL: "http://localhost:3101",
    viewport: { width: 1440, height: 1000 },
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    // Production build (npm run build first).
    { name: "app", testIgnore: [/public-quality\.spec\.ts/, /animation-lab\.spec\.ts/, /live\.spec\.ts/, /-browsers\.spec\.ts/] },
    // Dev server: React only reports hydration mismatches in development; the animation lab
    // (Fase K3) exists only in development.
    {
      name: "dev-quality",
      testMatch: /public-quality\.spec\.ts|animation-lab\.spec\.ts/,
      use: { baseURL: "http://localhost:3102" },
    },
  ],
  webServer: [
    {
      command: "node tests/fixture-api.mjs",
      url: `${FIXTURE_API}/__health`,
      timeout: 30_000,
      reuseExistingServer: false,
    },
    {
      command: "npm run start -- --port 3101",
      url: "http://localhost:3101",
      timeout: 120_000,
      reuseExistingServer: false,
      env,
    },
    {
      command: "npx next dev --port 3102",
      url: "http://localhost:3102",
      timeout: 180_000,
      reuseExistingServer: false,
      env,
    },
  ],
});
