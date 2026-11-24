/**
 * @live: talks to the REAL production API on purpose (upstream health, live CV download).
 * Runs only with `npm run test:live` (playwright.live.config.ts), never in test:fast.
 * READ ONLY (Fase 12.9): no contact form, no login, no writes. Every browser request that is not
 * GET/HEAD is aborted and fails the test.
 */
import { test, expect, type Page } from "@playwright/test";

async function settled(page: Page) {
  await page.getByRole("main").locator("section").first().waitFor();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  for (const section of await page.getByRole("main").locator("section").all())
    await section.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, 0));
}

test("live public API, project detail, CV download, and rendered screenshots @live", async ({
  page,
}, info) => {
  const writes: string[] = [];
  await page.route("**/*", (route) => {
    const method = route.request().method();
    if (method === "GET" || method === "HEAD") return route.continue();
    writes.push(`${method} ${route.request().url()}`);
    return route.abort();
  });
  for (const resource of [
    "portofolios",
    "skills",
    "experiences",
    "documents",
  ]) {
    const response = await page.request.get(`/api/public/${resource}`);
    expect(response.status(), `${resource} upstream status`).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data) || Array.isArray(payload)).toBe(true);
  }
  const rejected = await page.request.get("/api/public/users");
  expect(rejected.status()).toBe(404);
  await page.goto("/");
  await settled(page);
  await page.screenshot({
    path: info.outputPath("live-home-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: info.outputPath("live-home-mobile.png"),
    fullPage: true,
  });
  await page.goto("/projects");
  await page
    .getByRole("region", { name: "All projects" })
    .getByRole("article")
    .first()
    .getByRole("link")
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }),
  ).toBeVisible();
  await page.goto("/about#documents");
  const cv = page
    .getByRole("region", { name: "CV and certificates." })
    .getByRole("link", {
      name: /^Download (Curiculum Vitae|Curriculum Vitae|Resume)/,
    })
    .first();
  await expect(cv).toBeVisible();
  const href = await cv.getAttribute("href");
  const download = await page.request.get(href!);
  expect(download.status()).toBe(200);
  expect(download.headers()["content-disposition"]).toContain("attachment");
  expect((await download.body()).length).toBeGreaterThan(1000);
  expect(writes, "the live test must only read").toEqual([]);
});
