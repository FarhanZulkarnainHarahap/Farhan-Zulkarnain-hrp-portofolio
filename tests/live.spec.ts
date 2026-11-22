/**
 * @live: talks to the REAL production API on purpose (upstream health, live CV download).
 * Runs only with `npm run test:live` (playwright.live.config.ts), never in test:fast.
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
  await page.locator(".project-stage .text-link").click();
  await expect(page.locator(".project-detail h1")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.goto("/about#documents");
  const cv = page
    .locator(".document-item")
    .filter({ hasText: /Curiculum Vitae|Curriculum Vitae|Resume/ })
    .first();
  await expect(cv).toBeVisible();
  const href = await cv
    .getByRole("link", { name: "Download document" })
    .getAttribute("href");
  const download = await page.request.get(href!);
  expect(download.status()).toBe(200);
  expect(download.headers()["content-disposition"]).toContain("attachment");
  expect((await download.body()).length).toBeGreaterThan(1000);
});
