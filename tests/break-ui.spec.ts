/**
 * Fase 12.3 (/break-ui): the realistic worst case for every rendered value (fixture scenario
 * "worst": long Indonesian title, Japanese / Cyrillic titles with emoji, empty description, broken
 * and empty imageUrl, 56 tags, 94 features, empty case study, 20 experiences, long / non-Latin
 * skill names, a document of size 0 without preview). Regression test for the fixes it found.
 */
import { test, expect } from "@playwright/test";
import { setScenario, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

const LONG_SLUG = "sistem-informasi-manajemen-inventaris-penjualan-dan-pelaporan-keuangan-multi-cabang-untuk-";
const PAGES = ["/", "/about", "/journey", "/projects", `/projects/${LONG_SLUG}`, "/projects/fx-worst-2", "/projects/fx-worst-3", "/projects/qu"];

test("worst-case data: every public page renders without horizontal scroll at 320 px and 200 % zoom", async ({ browser, request }) => {
  await setScenario(request, { scenario: "worst" });
  for (const view of [{ width: 320, height: 720 }, { width: 640, height: 450 }]) {
    const context = await browser.newContext({ viewport: view, deviceScaleFactor: 2, reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const path of PAGES) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      // Render the content-visibility sections too.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 20));
        }
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} @${view.width}`).toBe(true);
    }
    await context.close();
  }
});

test("worst-case data: one-line case types on cards, a short stack list, honest document fallbacks, category labels", async ({ page, request }) => {
  await setScenario(request, { scenario: "worst" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects");
  const longType = "Full-Stack Web Application — Point of Sale (POS) & Retail Management System";
  const badge = page.getByRole("list", { name: "Project type" }).first().locator(`[title="${longType}"]`);
  await expect(badge).toBeVisible();
  expect((await badge.boundingBox())!.height).toBeLessThan(40);

  await page.goto(`/projects/${LONG_SLUG}`);
  await expect(page.getByRole("button", { name: "40 more technologies" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show all 94 features" })).toBeVisible();

  await page.goto("/about");
  await expect(page.getByText("No preview")).toBeVisible();
  await expect(page.getByText(/Résumé — English & Bahasa Indonesia/)).toBeVisible();
  // API category "DEVOPS" reads "DevOps", like the DevOps sub-group (never "Devops").
  await expect(page.getByRole("heading", { name: "Devops", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "DevOps" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Programming Languages & Runtimes" })).toBeVisible();
});

test("a document without size fails the documents read (API layer) and shows a calm retry", async ({ page, request }) => {
  await setScenario(request, { scenario: "worst", nosize: true });
  await page.goto("/about");
  await expect(page.locator("#documents").getByRole("button", { name: "Try again" })).toBeVisible();
});
