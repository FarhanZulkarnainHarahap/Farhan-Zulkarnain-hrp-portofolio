import { defineConfig } from "@playwright/test";

/** @live only: the real production API (npm run test:live). Requires a prior npm run build. */
export default defineConfig({
  testDir: "./tests",
  testMatch: /live\.spec\.ts/,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  workers: 1,
  reporter: [["list"]],
  outputDir: ".qa/results-live",
  use: {
    baseURL: "http://localhost:3103",
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "npm run start -- --port 3103",
    url: "http://localhost:3103",
    timeout: 120_000,
    reuseExistingServer: false,
    env: { JWT_SECRET: "kinetic-local-qa-only-not-a-production-secret" },
  },
});
