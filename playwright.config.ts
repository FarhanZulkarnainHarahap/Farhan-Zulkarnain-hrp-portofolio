import { defineConfig } from "@playwright/test";

const env = { JWT_SECRET: "kinetic-local-qa-only-not-a-production-secret" };

export default defineConfig({
  testDir: "./tests",
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
    { name: "app", testIgnore: /public-quality\.spec\.ts/ },
    // Dev server: React only reports hydration mismatches in development.
    {
      name: "dev-quality",
      testMatch: /public-quality\.spec\.ts/,
      use: { baseURL: "http://localhost:3102" },
    },
  ],
  webServer: [
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
