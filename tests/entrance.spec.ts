/**
 * Fase 10.5: the Fz card hero entrance (Blender video, desktop only — Checkpoint B2 variant C) and the home fly-through
 * (scroll-scrubbed Blender clips). Server data comes from the fixture API.
 */
import { test, expect, type Page } from "@playwright/test";
import { initialHtml, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

const desktop = { viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" as const };

async function observeLcp(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __lcp: string[]; __cls: number };
    w.__lcp = [];
    w.__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { element?: Element })[])
        w.__lcp.push(e.element?.id || e.element?.tagName || "?");
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
        if (!e.hadRecentInput) w.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
}
const probe = <T,>(page: Page, key: string) => page.evaluate((k) => (window as unknown as Record<string, T>)[k], key);
const flightY = (page: Page, p: number) =>
  page.evaluate((p) => {
    const el = document.querySelector<HTMLElement>("[data-flight]")!;
    return el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * p;
  }, p);

const SCENE_TITLES = [
  "Where people meet the product.",
  "Clear contracts between front and back.",
  "Business rules in one place.",
  "Data shaped for the questions it answers.",
  "Shipped the same way every time.",
];
const CLOSING_TITLE = "Five layers, one product.";
/** Scroll offset (px) of a point `screens` screens into the fly-through. */
const flightAt = (page: Page, screens: number) =>
  page.evaluate((n) => document.querySelector<HTMLElement>("[data-flight]")!.getBoundingClientRect().top + scrollY + n * innerHeight, screens);

test("initial HTML: H1, scene copy, skip link and no old card placeholder", async ({ request }) => {
  const html = await initialHtml(request, "/");
  expect(html).toContain('id="hero-title"');
  for (const title of [...SCENE_TITLES, CLOSING_TITLE]) expect(html).toContain(title);
  expect(html).toContain("How I build, layer by layer");
  expect(html).toContain('href="#selected-work"');
  expect(html).toContain("Skip to projects");
  // The old "F z" card (monogram spans, gradient frame, dot pattern, HeroModel) is gone.
  for (const old of ["hero-monogram", "dot-pattern", "data-hero-visual", "hero-model", "<canvas"]) expect(html).not.toContain(old);
});

test("LCP ≤ 1.2 s and CLS < 0.05 through the entrance at every desktop width; an image LCP is preloaded", async ({ browser }) => {
  // Rule (Fase 10.5, owner): LCP is a time budget, not a fixed element. Lighthouse mobile (simulated
  // throttling) ≤ 2.0 s is measured separately (docs/3D_PLAN.md); here the observed desktop budget.
  for (const colorScheme of ["light", "dark"] as const)
    for (const width of [1024, 1280, 1440, 1920]) {
      const context = await browser.newContext({ ...desktop, viewport: { width, height: Math.round(width * 0.62) }, colorScheme });
      const page = await context.newPage();
      await page.addInitScript(() => {
        const w = window as unknown as { __lcpE: { t: number; tag: string; src: string }[]; __cls: number };
        w.__lcpE = [];
        w.__cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEntry & { element?: Element; url?: string })[])
            w.__lcpE.push({ t: e.startTime, tag: e.element?.tagName ?? "?", src: e.url ?? "" });
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
            if (!e.hadRecentInput) w.__cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto("/");
      await expect(page.locator("[data-hero-entrance]")).toHaveAttribute("data-state", "done", { timeout: 20_000 });
      const lcp = (await probe<{ t: number; tag: string; src: string }[]>(page, "__lcpE")).at(-1)!;
      expect(lcp.t, `${width}px ${colorScheme}: ${lcp.tag}`).toBeLessThanOrEqual(1200);
      expect(await probe<number>(page, "__cls")).toBeLessThan(0.05);
      if (lcp.tag === "IMG") {
        const file = new URL(lcp.src).pathname;
        const preloaded = await page.evaluate(
          (f) =>
            Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')).some(
              (l) => l.getAttribute("fetchpriority") === "high" && (l.getAttribute("imagesrcset") ?? "").includes(f),
            ),
          file,
        );
        expect(preloaded, `${file} preloaded with fetchpriority=high`).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await context.close();
    }
});

test("entrance plays once per session, then the short version; theme switch shows the still", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  const videos: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.pathname.startsWith("/3d/entrance/") && u.pathname.endsWith(".mp4")) videos.push(u.pathname);
  });
  await page.goto("/");
  const visual = page.locator("[data-hero-entrance]");
  await expect(visual).toHaveAttribute("data-state", "done", { timeout: 20_000 });
  expect(videos).toEqual(["/3d/entrance/light.mp4"]);
  const video = visual.locator("video");
  await expect(video).toHaveJSProperty("loop", false);
  await expect(video).toHaveJSProperty("controls", false);
  await expect(video).toHaveJSProperty("muted", true);
  // Second visit in the session: starts at 1.5 s.
  await page.reload();
  await expect(visual).toHaveAttribute("data-state", "done", { timeout: 20_000 });
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentSrc)).toContain("#t=1.5");
  // Theme switch: no replay, the stack still of the new theme.
  await page.getByRole("banner").getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(visual).toHaveAttribute("data-state", "still");
  await expect(visual.locator(".hero-entrance__end .themed-picture__dark img")).toBeVisible();
  await context.close();
});

test("reduced motion and phones: no entrance video; reduced motion: no fly-through video either", async ({ browser }) => {
  for (const options of [
    { ...desktop, reducedMotion: "reduce" as const },
    { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" as const },
  ]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    await observeLcp(page);
    const videos: string[] = [];
    const posters: string[] = [];
    page.on("request", (r) => {
      const path = new URL(r.url()).pathname;
      if (path.endsWith(".mp4")) videos.push(path);
      else if (path.startsWith("/3d/entrance/")) posters.push(path);
    });
    await page.goto("/");
    await page.waitForTimeout(2500);
    const phone = options.viewport.width < 1024;
    // Phones: no entrance at all (variant C), so the H1 is the LCP and no entrance poster is fetched.
    // Desktop reduced motion: the preloaded stack poster may be the LCP (checked in the LCP test).
    if (phone) {
      expect((await probe<string[]>(page, "__lcp")).at(-1)).toBe("hero-title");
      expect(posters).toEqual([]);
    } else {
      expect(posters.every((p) => p.includes("-end-"))).toBe(true);
    }
    await page.evaluate(async (y) => scrollTo(0, y), await flightY(page, 0.5));
    await page.waitForTimeout(1500);
    expect(videos.filter((v) => v.startsWith("/3d/entrance/"))).toEqual([]);
    if (options.reducedMotion === "reduce") {
      expect(videos).toEqual([]);
      // Static list: every scene still + copy and the closing, no connectors, nothing pinned.
      await expect(page.locator(".flight-stage")).toHaveCSS("position", "static");
      for (const name of [...SCENE_TITLES, CLOSING_TITLE])
        await expect(page.getByRole("heading", { level: 3, name })).toBeVisible();
      await expect(page.locator(".flight-scene--connector").first()).toBeHidden();
    } else {
      // Phones: portrait clips of the active theme only, fetched lazily (not the whole film at once).
      expect(videos.length).toBeGreaterThan(0);
      expect(videos.length).toBeLessThan(11);
      for (const v of videos) expect(v).toMatch(/^\/3d\/flight\/light-[sc]\d-m\.mp4$/);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  }
});

test("fly-through scrubs a blob clip with scroll, skip link jumps, resources are released on navigation", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await page.goto("/");
  // Scene 1 spans the first 0.8 screens of the film.
  const y0 = await flightAt(page, 0);
  const y1 = await flightAt(page, 0.8);
  await page.evaluate((y) => scrollTo(0, y), y0);
  const video = page.locator(".flight-scene").first().locator(".flight-video");
  await expect(video).toHaveCount(1, { timeout: 15_000 });
  await expect(page.locator(".flight-scene").first().locator(".flight-media.has-clip")).toHaveCount(1, { timeout: 15_000 });
  const src = await video.evaluate((v: HTMLVideoElement) => v.src);
  expect(src.startsWith("blob:")).toBe(true);
  expect(await video.evaluate((v: HTMLVideoElement) => v.seekable.length > 0 && v.seekable.end(0) > 3.9)).toBe(true);
  await page.evaluate((y) => scrollTo(0, y), y0 + (y1 - y0) * 0.5);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 5_000 }).toBeGreaterThan(1);
  await page.evaluate((y) => scrollTo(0, y), y1);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 5_000 }).toBeGreaterThan(3.5);
  // Idle: no frames requested once the clip has settled (seeks are slow in headless, so poll for a
  // quiet 1 s window instead of assuming a fixed settle time).
  const rafsInOneSecond = () =>
    page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let n = 0;
          const raf = window.requestAnimationFrame;
          window.requestAnimationFrame = (cb) => {
            n++;
            return raf(cb);
          };
          setTimeout(() => {
            window.requestAnimationFrame = raf;
            resolve(n);
          }, 1000);
        }),
    );
  await expect.poll(rafsInOneSecond, { timeout: 10_000, intervals: [0] }).toBe(0);
  // Skip link: visible on the stage, keyboard reachable, jumps to Selected work.
  await page.evaluate((y) => scrollTo(0, y), y0 + (y1 - y0) * 0.3);
  const skip = page.getByRole("link", { name: "Skip to projects" });
  await expect(skip).toBeVisible();
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#selected-work$/);
  // The jump may scroll smoothly: wait until Selected work sits under the header.
  await expect
    .poll(() => page.evaluate(() => Math.round(document.getElementById("selected-work")!.getBoundingClientRect().top)), { timeout: 5_000 })
    .toBeLessThan(200);
  // Client navigation away: the blob URL is revoked and the video removed.
  await page.evaluate(() => {
    (window as unknown as { __revoked: string[] }).__revoked = [];
    const revoke = URL.revokeObjectURL;
    URL.revokeObjectURL = (u) => {
      (window as unknown as { __revoked: string[] }).__revoked.push(u);
      revoke(u);
    };
  });
  await page.getByRole("banner").getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  expect(await probe<string[]>(page, "__revoked")).toContain(src);
  await expect(page.locator(".flight-video")).toHaveCount(0);
  await context.close();
});

test("full film: 7.8 screens, clips load lazily along the way, every scene's copy shows, the closing holds", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  const clips: string[] = [];
  page.on("request", (r) => {
    const path = new URL(r.url()).pathname;
    if (path.startsWith("/3d/flight/") && path.endsWith(".mp4")) clips.push(path);
  });
  await page.goto("/");
  const ratio = await page.evaluate(() => document.querySelector<HTMLElement>("[data-flight]")!.offsetHeight / innerHeight);
  expect(ratio).toBeCloseTo(7.8, 1);
  // Before any scroll nothing is fetched; at the start only the first few segments.
  await page.waitForTimeout(1000);
  expect(clips).toEqual([]);
  await page.evaluate(async (y) => scrollTo(0, y), await flightAt(page, 0));
  await expect.poll(() => clips.length, { timeout: 10_000 }).toBeGreaterThan(0);
  await page.waitForTimeout(800);
  expect(clips).toContain("/3d/flight/light-s1.mp4");
  expect(clips).not.toContain("/3d/flight/light-s6.mp4");
  // Walk scene by scene (scenes 0.8 screens, connectors 0.4): each copy peaks mid-scene.
  for (const [i, title] of SCENE_TITLES.entries()) {
    const mid = i * 1.2 + 0.4;
    await page.evaluate(async (y) => scrollTo(0, y), await flightAt(page, mid));
    const copy = page.locator(".flight-copy", { has: page.getByRole("heading", { name: title }) });
    await expect.poll(() => copy.evaluate((el) => Number(getComputedStyle(el).opacity)), { timeout: 5_000 }).toBeGreaterThan(0.8);
  }
  // End of the film: the closing copy holds and the last clip sits on its final frame.
  await page.evaluate(async (y) => scrollTo(0, y), await flightAt(page, 6.8));
  const closing = page.locator(".flight-copy", { has: page.getByRole("heading", { name: CLOSING_TITLE }) });
  await expect.poll(() => closing.evaluate((el) => Number(getComputedStyle(el).opacity)), { timeout: 5_000 }).toBeGreaterThan(0.9);
  const last = page.locator(".flight-scene").last().locator(".flight-video");
  await expect(last).toHaveCount(1, { timeout: 15_000 });
  await expect.poll(() => last.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration), { timeout: 8_000 }).toBeGreaterThan(0.95);
  expect(new Set(clips).size).toBe(clips.length);
  for (const c of clips) expect(c).toMatch(/^\/3d\/flight\/light-[sc]\d\.mp4$/);
  await context.close();
});
