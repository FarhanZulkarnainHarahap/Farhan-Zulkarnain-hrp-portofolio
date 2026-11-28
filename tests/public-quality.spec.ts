/**
 * Public pages in the dev server: no console errors, no hydration warnings, no Next.js dev
 * overlay issues, and no horizontal scroll (Fase 4.1). Runs in the "dev-quality" project.
 */
import { test, expect, type BrowserContext } from "@playwright/test";
import projectsFixture from "./fixtures/projects.json";
import skillsFixture from "./fixtures/skills.json";
import documentsFixture from "./fixtures/documents.json";

async function mockApi(context: BrowserContext) {
  const data: Record<string, unknown[]> = {
    portofolios: projectsFixture.data,
    skills: skillsFixture.data,
    documents: documentsFixture.data,
    experiences: [],
  };
  await context.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const resource = url.pathname
      .replace("/api/public/", "")
      .replace("/api/", "")
      .split("/")[0];
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: data[resource] ?? [] }),
    });
  });
}

const pages = [
  "/",
  "/about",
  "/journey",
  "/projects",
  "/projects/kasirku",
  "/contact",
  "/auth/login",
  "/auth/register",
  "/missing-page-quality-check",
];
// Known noise that is not an app defect: headless WebGL driver chatter, the expected 404 document
// response, and Next.js' LCP-image advice. framer-motion (dashboard only) must never reach public
// pages, so its reduced-motion notice is deliberately NOT ignored here.
const ignored = [
  /GL Driver Message/,
  /GPU stall/,
  /status of 404/,
  /was detected as the Largest Contentful Paint/,
  // Fase K4: @react-three/fiber 9.8.2 creates a THREE.Clock in its store; three r187 deprecates the
  // class with a one-time console warning. Third-party, harmless; goes away with an R3F update.
  /THREE\.Clock: This module has been deprecated/,
];

for (const colorScheme of ["light", "dark"] as const) {
  test(`public pages log no errors or hydration warnings (${colorScheme})`, async ({
    browser,
  }) => {
    test.setTimeout(420_000);
    const context = await browser.newContext({
      colorScheme,
      reducedMotion: "no-preference",
    });
    await mockApi(context);
    const page = await context.newPage();
    const problems: string[] = [];
    page.on("console", (message) => {
      if (!["error", "warning"].includes(message.type())) return;
      if (ignored.some((pattern) => pattern.test(message.text()))) return;
      problems.push(
        `${page.url()} ${message.type()}: ${message.text().slice(0, 300)}`,
      );
    });
    page.on("pageerror", (error) =>
      problems.push(`${page.url()} pageerror: ${error.message.slice(0, 300)}`),
    );
    for (const path of pages) {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      const overlay = await page.evaluate(
        () =>
          document
            .querySelector("nextjs-portal")
            ?.shadowRoot?.textContent?.match(/(\d+)\s*Issues?/)?.[1] ?? "0",
      );
      expect(overlay, `Next.js dev overlay issues on ${path}`).toBe("0");
    }
    expect(problems).toEqual([]);
    await context.close();
  });
}

test("public pages have no horizontal scroll at 390 and 1440", async ({
  browser,
}) => {
  test.setTimeout(420_000);
  const context = await browser.newContext({ reducedMotion: "reduce" });
  await mockApi(context);
  const page = await context.newPage();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of pages) {
      await page.goto(path, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  }
  await context.close();
});
