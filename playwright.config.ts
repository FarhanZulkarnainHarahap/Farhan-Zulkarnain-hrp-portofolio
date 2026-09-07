import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  fullyParallel: false,
  reporter: [["list"], ["html", { outputFolder: ".qa/report", open: "never" }]],
  outputDir: ".qa/results",
  use: {
    baseURL: "http://localhost:3101",
    viewport: { width: 1440, height: 1000 },
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run start -- --port 3101",
    url: "http://localhost:3101",
    timeout: 120_000,
    reuseExistingServer: false,
    env: { JWT_SECRET: "kinetic-local-qa-only-not-a-production-secret" },
  },
});
