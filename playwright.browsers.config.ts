import { defineConfig, devices } from "@playwright/test";

/**
 * Fase 12.6: the fly-through in Chromium, Firefox and WebKit (Safari's engine). Fixture API only,
 * like the default suite. Run: npm run test:browsers (after npm run build).
 *
 * Local WSL without sudo: Firefox/WebKit system libraries live in ~/.local/pw-libs (apt-get download
 * + dpkg -x); WebKit's H.264 decoding needs GStreamer (gst-libav), see docs/QA_REPORT.md → 12.6.
 */
const FIXTURE_API = "http://localhost:3190";
const env = { JWT_SECRET: "kinetic-local-qa-only-not-a-production-secret", API_URL: FIXTURE_API, CONTENT_CACHE: "off" };

export default defineConfig({
  testDir: "./tests",
  testMatch: /-browsers\.spec\.ts/,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [["list"]],
  outputDir: ".qa/results-browsers",
  use: { baseURL: "http://localhost:3101", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } } },
    { name: "webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: [
    { command: "node tests/fixture-api.mjs", url: `${FIXTURE_API}/__health`, timeout: 30_000, reuseExistingServer: false },
    { command: "npm run start -- --port 3101", url: "http://localhost:3101", timeout: 120_000, reuseExistingServer: false, env },
  ],
});
