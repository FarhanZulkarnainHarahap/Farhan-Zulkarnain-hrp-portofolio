/**
 * Fase 12.6: the home fly-through in Chromium, Firefox and WebKit (playwright.browsers.config.ts):
 * scrub follows the scroll in every scene, "Skip to projects" works from the keyboard, ten round
 * trips leave no videos, blob URLs or (Chromium) heap behind, and reduced motion is the static list.
 */
import { test, expect, type Page } from "@playwright/test";
import { withFixtureApi } from "./helpers/fixture";

withFixtureApi();

const flightAt = (page: Page, screens: number) =>
  page.evaluate((n) => document.querySelector<HTMLElement>("[data-flight]")!.getBoundingClientRect().top + scrollY + n * innerHeight, screens);

test.use({ contextOptions: { reducedMotion: "no-preference" } });

test("scrub follows the scroll through every scene", async ({ page }) => {
  await page.goto("/");
  const scenes = [0, 1.2, 2.4, 3.6, 4.8, 6.0]; // s1…s5 + closing start (screens)
  for (const [i, start] of scenes.entries()) {
    // Three points inside the scene: the clip time must follow (scene is 0.8 screens).
    for (const p of [0.15, 0.5, 0.9]) {
      await page.evaluate((y) => scrollTo(0, y), await flightAt(page, start + p * 0.8));
      const video = page.locator(".flight-scene").nth(i * 2).locator(".flight-video");
      await expect(video, `scene ${i + 1} clip`).toHaveCount(1, { timeout: 15_000 });
      await expect
        .poll(() => video.evaluate((v: HTMLVideoElement) => (v.duration ? v.currentTime / v.duration : -1)), { timeout: 8_000, message: `scene ${i + 1} @${p}` })
        .toBeGreaterThan(p - 0.32);
      await expect
        .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration), { timeout: 8_000 })
        .toBeLessThan(p + 0.32);
    }
  }
  // The closing copy holds at the end of the film.
  await page.evaluate(async (y) => scrollTo(0, y), await flightAt(page, 6.8));
  await expect(page.getByRole("heading", { name: "Five layers, one product." })).toBeVisible();
});

test("Skip to projects works from the keyboard", async ({ page, browserName }) => {
  await page.goto("/");
  await page.evaluate(async (y) => scrollTo(0, y), await flightAt(page, 0.5));
  const skip = page.getByRole("link", { name: "Skip to projects" });
  await expect(skip).toBeVisible();
  // Reach it with Tab from the hero's last control (WebKit tabs to links only with the option set).
  await page.getByRole("link", { name: "Get in touch" }).first().focus();
  for (let i = 0; i < 6 && !(await skip.evaluate((el) => el === document.activeElement)); i++)
    await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#selected-work$/);
  await expect
    .poll(() => page.evaluate(() => Math.round(document.getElementById("selected-work")!.getBoundingClientRect().top)), { timeout: 5_000 })
    .toBeLessThan(200);
});

test("ten round trips leave no videos, blob URLs or retained heap", async ({ page, browserName }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __blobs: Set<string> };
    w.__blobs = new Set();
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (o: Blob | MediaSource) => {
      const u = create(o);
      w.__blobs.add(u);
      return u;
    };
    URL.revokeObjectURL = (u: string) => {
      w.__blobs.delete(u);
      revoke(u);
    };
  });
  const cdp = browserName === "chromium" ? await page.context().newCDPSession(page) : null;
  const heap = async () => {
    if (!cdp) return 0;
    await cdp.send("HeapProfiler.collectGarbage");
    return ((await cdp.send("Runtime.getHeapUsage")) as { usedSize: number }).usedSize;
  };
  await page.goto("/");
  const trip = async () => {
    await page.evaluate(async (y) => scrollTo(0, y), await flightAt(page, 1.3));
    await expect(page.locator(".flight-video").first()).toHaveCount(1, { timeout: 15_000 });
    await page.getByRole("banner").getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator(".flight-video")).toHaveCount(0);
    await page.getByRole("banner").getByRole("link", { name: "Farhan Zulkarnain" }).click();
    await expect(page).toHaveURL(/\/$/);
  };
  await trip();
  const before = await heap();
  for (let i = 0; i < 9; i++) await trip();
  await page.getByRole("banner").getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  expect(await page.locator("video").count()).toBe(0);
  expect(await page.evaluate(() => (window as unknown as { __blobs: Set<string> }).__blobs.size)).toBe(0);
  if (cdp) {
    const growth = (await heap()) - before;
    console.log(`heap growth after 9 more round trips: ${(growth / 1024 / 1024).toFixed(2)} MB`);
    expect(growth).toBeLessThan(3 * 1024 * 1024);
  }
});

test("reduced motion: static list, no video requested", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const videos: string[] = [];
  page.on("request", (r) => r.url().endsWith(".mp4") && videos.push(r.url()));
  await page.goto("/");
  await page.evaluate(async (y) => scrollTo(0, y), await flightAt(page, 2));
  await page.waitForTimeout(1500);
  expect(videos).toEqual([]);
  await expect(page.locator(".flight-stage")).toHaveCSS("position", "static");
  await expect(page.getByRole("heading", { level: 3, name: "Data shaped for the questions it answers." })).toBeVisible();
  await context.close();
});
