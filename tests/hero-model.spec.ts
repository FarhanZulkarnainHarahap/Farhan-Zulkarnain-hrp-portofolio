/**
 * Fase 10: HeroModel (three.js + meshopt GLB, desktop only), theme-aware Blender posters, and the
 * static DeviceMockup on case studies. Server data comes from the fixture API.
 */
import { test, expect, type Browser, type Page } from "@playwright/test";
import { setScenario, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

type Probe = { __raf: number; __draws: number; __gl: WebGL2RenderingContext[]; __marker?: string };

const desktop = { viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" as const };

/** Counts rAF requests and WebGL draws, and keeps the HeroModel's GL contexts. */
async function instrument(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as Probe;
    w.__raf = 0;
    w.__draws = 0;
    w.__gl = [];
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      w.__raf += 1;
      return raf(cb);
    };
    const proto = WebGL2RenderingContext.prototype;
    for (const name of ["drawElements", "drawArrays"] as const) {
      const original = proto[name] as (...args: unknown[]) => void;
      (proto as unknown as Record<string, unknown>)[name] = function (this: WebGL2RenderingContext, ...args: unknown[]) {
        w.__draws += 1;
        return original.apply(this, args);
      };
    }
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof getContext>) {
      const ctx = getContext.apply(this, args);
      if (ctx && this.classList.contains("hero-model-canvas")) w.__gl.push(ctx as WebGL2RenderingContext);
      return ctx;
    } as typeof getContext;
  });
}
const probe = <K extends keyof Probe>(page: Page, key: K) =>
  page.evaluate((k) => (window as unknown as Probe)[k as keyof Probe], key) as Promise<Probe[K]>;

/** Paths requested by a fresh page with the given context options. */
async function requestsOf(browser: Browser, options: Parameters<Browser["newContext"]>[0]) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const urls = new Set<string>();
  page.on("request", (r) => urls.add(new URL(r.url()).pathname));
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const canvases = await page.locator("canvas").count();
  await context.close();
  return { urls, canvases };
}

test("3D assets load only on capable desktops; mobile and reduced motion stay static", async ({ browser }) => {
  const reduced = await requestsOf(browser, { ...desktop, reducedMotion: "reduce", colorScheme: "light" });
  const mobile = await requestsOf(browser, {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "no-preference",
    colorScheme: "light",
  });
  const live = await requestsOf(browser, { ...desktop, colorScheme: "light" });

  expect(reduced.canvases).toBe(0);
  expect(mobile.canvases).toBe(0);
  expect(live.canvases).toBe(1);
  expect(live.urls.has("/3d/hero-model.glb")).toBe(true);
  expect(reduced.urls.has("/3d/hero-model.glb")).toBe(false);
  expect(mobile.urls.has("/3d/hero-model.glb")).toBe(false);
  // The three.js chunk(s): only on the capable desktop.
  const threeChunks = [...live.urls].filter((url) => url.endsWith(".js") && !reduced.urls.has(url));
  expect(threeChunks.length).toBeGreaterThan(0);
  for (const url of threeChunks) expect(mobile.urls.has(url), url).toBe(false);
  // Mobile hides the slot: no poster either. Desktop fetches only the active theme's poster.
  expect([...mobile.urls].filter((url) => url.startsWith("/3d/"))).toEqual([]);
  for (const result of [reduced, live]) {
    const posters = [...result.urls].filter((url) => url.startsWith("/3d/hero/"));
    expect(posters.length).toBe(1);
    expect(posters[0]).toMatch(/\/light-\d+\.avif$/);
  }
});

test("HeroModel cross-fades in, idles with 0 rAF/draws, follows the pointer and the theme, and disposes on navigation", async ({
  browser,
}) => {
  const context = await browser.newContext({ ...desktop, colorScheme: "light" });
  const page = await context.newPage();
  await instrument(page);
  const posterRequests: string[] = [];
  page.on("request", (r) => {
    const path = new URL(r.url()).pathname;
    if (path.startsWith("/3d/hero/")) posterRequests.push(path);
  });
  await page.goto("/");
  const visual = page.locator("[data-hero-visual]");
  await expect(visual).toHaveAttribute("data-model-ready", "true", { timeout: 20_000 });
  const canvas = visual.locator("canvas");
  await expect(canvas).toHaveCSS("opacity", "1");
  await expect(visual.locator(".hero-model-poster")).toHaveCSS("opacity", "0");

  // Idle: no frames requested and nothing drawn (GSAP's ticker sleeps after the intro).
  await page.mouse.move(5, 5);
  await page.waitForTimeout(3500);
  const draws = await probe(page, "__draws");
  const rafs = await probe(page, "__raf");
  await page.waitForTimeout(1500);
  expect(await probe(page, "__draws")).toBe(draws);
  expect(await probe(page, "__raf")).toBe(rafs);

  // The pointer wakes it; it settles again afterwards.
  const box = (await visual.boundingBox())!;
  const before = await canvas.screenshot();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2, { steps: 6 });
  await page.waitForTimeout(600);
  expect(await probe(page, "__draws")).toBeGreaterThan(draws);
  expect((await canvas.screenshot()).equals(before)).toBe(false);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(2500);
  const settled = await probe(page, "__raf");
  await page.waitForTimeout(1000);
  expect(await probe(page, "__raf")).toBe(settled);

  // Theme toggle: model colours and poster change without a reload; dark poster only now.
  expect(posterRequests.every((path) => path.includes("/light-"))).toBe(true);
  await page.evaluate(() => ((window as unknown as Probe).__marker = "same-document"));
  const lightPixels = await canvas.screenshot();
  await page.getByRole("banner").getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(visual.locator(".themed-picture")).toHaveAttribute("data-shown", "dark");
  await page.waitForTimeout(300);
  expect((await canvas.screenshot()).equals(lightPixels)).toBe(false);
  expect(posterRequests.some((path) => path.includes("/dark-"))).toBe(true);
  expect(await probe(page, "__marker")).toBe("same-document");
  await expect(canvas).toHaveCount(1);

  // Client navigation unmounts the slot and releases the WebGL context.
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(await probe(page, "__marker")).toBe("same-document");
  expect(
    await page.evaluate(() => {
      const contexts = (window as unknown as Probe).__gl;
      return contexts.length > 0 && contexts.every((gl) => gl.isContextLost());
    }),
  ).toBe(true);
  await context.close();
});

test("the H1 stays the LCP element on the home page at every desktop width", async ({ browser }) => {
  for (const width of [1024, 1280, 1440, 1920]) {
    for (const colorScheme of ["light", "dark"] as const) {
      const context = await browser.newContext({ ...desktop, viewport: { width, height: 900 }, colorScheme });
      const page = await context.newPage();
      await page.goto("/");
      await expect(page.locator("[data-hero-visual]")).toHaveAttribute("data-model-ready", "true", {
        timeout: 20_000,
      });
      await page.waitForTimeout(800);
      const lcp = await page.evaluate(
        () =>
          new Promise<string>((resolve) =>
            new PerformanceObserver((list) => {
              const entry = list.getEntries().at(-1) as PerformanceEntry & { element?: Element };
              resolve(entry.element?.id ?? entry.element?.tagName ?? "none");
            }).observe({ type: "largest-contentful-paint", buffered: true }),
          ),
      );
      expect(lcp, `${width}px ${colorScheme}`).toBe("hero-title");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await context.close();
    }
  }
});

test("DeviceMockup puts the screenshot exactly in the screen, keeps the ratio, and follows the theme", async ({
  browser,
}) => {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: "light" });
    const page = await context.newPage();
    const deviceRequests: string[] = [];
    page.on("request", (r) => {
      const path = new URL(r.url()).pathname;
      if (path.startsWith("/3d/")) deviceRequests.push(path);
    });
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/projects/kasirku");
    const title = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
    const mockup = page.locator("[data-device-mockup]");
    await mockup.scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");

    // Ratio locked to the render (1600×1000).
    const m = (await mockup.boundingBox())!;
    expect(Math.abs(m.height - (m.width * 10) / 16)).toBeLessThan(1);
    // Screen rect from device-screen.ts (Blender export): 25.342%–74.658% × 9.342%–58.658%.
    const s = (await mockup.locator("[data-device-screen]").boundingBox())!;
    expect(Math.abs(s.x - m.x - m.width * 0.25342)).toBeLessThan(1);
    expect(Math.abs(s.width - m.width * 0.49316)).toBeLessThan(1);
    expect(Math.abs(s.y - m.y - m.height * 0.09342)).toBeLessThan(1);
    expect(Math.abs(s.height - m.height * 0.49316)).toBeLessThan(1);

    // Content image vs decorative render.
    const shot = mockup.getByRole("img", { name: `${title} screenshot` });
    await expect(shot).toBeVisible();
    await expect(shot).toHaveCSS("object-fit", "cover");
    await expect(shot).toHaveCSS("object-position", /^50% 0%|top$/);
    const laptop = mockup.locator(".themed-picture img");
    await expect(laptop).toHaveCount(2);
    for (const img of await laptop.all()) await expect(img).toHaveAttribute("alt", "");
    await expect(mockup.locator(".themed-picture")).toHaveAttribute("aria-hidden", "true");

    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.01);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    // Only the light render, no GLB on case studies.
    expect(deviceRequests.length).toBeGreaterThan(0);
    for (const path of deviceRequests) expect(path).toMatch(/^\/3d\/device\/light-\d+\.avif$/);

    // Theme toggle swaps the render without a reload.
    if (width === 1440) {
      await page.getByRole("banner").getByRole("button", { name: "Switch to dark theme" }).click();
      await expect(mockup.locator(".themed-picture")).toHaveAttribute("data-shown", "dark");
      await expect(mockup.locator(".themed-picture__dark img")).toBeVisible();
      await expect(mockup.locator(".themed-picture__light img")).toBeHidden();
      expect(deviceRequests.some((path) => path.includes("/dark-"))).toBe(true);
    }
    await context.close();
  }
});

test("DeviceMockup keeps the frame and shows a fallback inside the screen when the screenshot is broken", async ({
  page,
  request,
}) => {
  await setScenario(request, { scenario: "extreme" });
  await page.goto("/projects");
  await page.getByRole("main").getByRole("article").first().getByRole("link").first().click();
  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
  const screen = page.locator("[data-device-mockup] [data-device-screen]");
  await expect(screen.getByText("Image unavailable")).toBeVisible();
  const m = (await page.locator("[data-device-mockup]").boundingBox())!;
  expect(Math.abs(m.height - (m.width * 10) / 16)).toBeLessThan(1);
});
