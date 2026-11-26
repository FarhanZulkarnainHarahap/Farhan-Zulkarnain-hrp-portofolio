/**
 * Fase 10.5: the home fly-through (scroll-scrubbed Blender clips), and the hero first paint.
 * Fase K2 (Kinetic, 2026-11-27): the Fz card entrance video is no longer mounted in the hero (the orbit
 * stage replaced it: static SVG now, WebGL in Fase 6). Its two tests ("LCP through the entrance", "entrance
 * plays once per session") were rewritten to the new hero: the H1 is the LCP and no entrance media loads.
 * The site is dark by default, so the fly-through fetches the dark clips. Server data: fixture API.
 */
import { test, expect, type Page } from "@playwright/test";
import { initialHtml, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

const desktop = { viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" as const };

async function observeLcp(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __lcp: string[]; __lcpT: number[]; __cls: number };
    w.__lcp = [];
    w.__lcpT = [];
    w.__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { element?: Element })[]) {
        w.__lcp.push(e.element?.id || e.element?.tagName || "?");
        w.__lcpT.push(e.startTime);
      }
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

test("LCP ≤ 1.2 s and CLS < 0.05 at every desktop width in both themes; the H1 is the LCP; no entrance media", async ({ browser }) => {
  // Rule (Fase 10.5, owner): LCP is a time budget, not a fixed element. Since Fase K2 the hero has no
  // image or video, so the oversized H1 is the LCP; the orbit stage must not shift the layout.
  for (const theme of ["light", "dark"] as const)
    for (const width of [1024, 1280, 1440, 1920]) {
      const context = await browser.newContext({ ...desktop, viewport: { width, height: Math.round(width * 0.62) } });
      await context.addInitScript((t) => localStorage.setItem("theme", t), theme);
      const page = await context.newPage();
      const media: string[] = [];
      page.on("request", (r) => {
        const path = new URL(r.url()).pathname;
        if (path.startsWith("/3d/entrance/")) media.push(path);
      });
      await observeLcp(page);
      await page.goto("/");
      await page.waitForTimeout(1500);
      const lcpTimes = await probe<number[]>(page, "__lcpT");
      expect(lcpTimes.length, `${width}px ${theme}: an LCP entry`).toBeGreaterThan(0);
      expect(lcpTimes.at(-1)!, `${width}px ${theme}`).toBeLessThanOrEqual(1200);
      expect((await probe<string[]>(page, "__lcp")).at(-1), `${width}px ${theme}`).toBe("hero-title");
      expect(await probe<number>(page, "__cls")).toBeLessThan(0.05);
      expect(media, "no entrance poster or clip").toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await context.close();
    }
});

test("hero orbit stage: server-rendered SVG of the API skills on three rings, with a text summary", async ({ browser, request }) => {
  const html = await initialHtml(request, "/");
  expect(html).toContain("data-orbit-stage");
  expect(html).toContain('data-orbit-renderer="svg"');
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await page.goto("/");
  const orbit = page.getByRole("img", { name: /^Technology orbit around the Fz monogram\./ });
  await expect(orbit).toBeVisible();
  const name = (await orbit.getAttribute("aria-label")) ?? "";
  // Ring order and labels come from src/lib/display/orbit.ts; names from the fixture skills.
  expect(name).toMatch(/Frontend: .+\. Backend: .+\. Tools & platforms: .+\.$/);
  const box = (await page.locator("[data-orbit-stage]").boundingBox())!;
  const h1 = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  expect(box.x, "orbit sits right of the name on desktop").toBeGreaterThanOrEqual(h1.x + h1.width - 1);
  await context.close();
  // Phones: the orbit has its own area below the text (never over it).
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await phone.newPage();
  await mobile.goto("/");
  const stage = (await mobile.locator("[data-orbit-stage]").boundingBox())!;
  const status = (await mobile.getByText("Open to full-time roles and freelance projects").boundingBox())!;
  expect(stage.y).toBeGreaterThanOrEqual(status.y + status.height);
  expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await phone.close();
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
      for (const v of videos) expect(v).toMatch(/^\/3d\/flight\/dark-[sc]\d-m\.mp4$/);
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
  expect(clips).toContain("/3d/flight/dark-s1.mp4");
  expect(clips).not.toContain("/3d/flight/dark-s6.mp4");
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
  for (const c of clips) expect(c).toMatch(/^\/3d\/flight\/dark-[sc]\d\.mp4$/);
  await context.close();
});
