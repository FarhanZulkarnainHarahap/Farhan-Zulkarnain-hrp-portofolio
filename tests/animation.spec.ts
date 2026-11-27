import { expect, test, type Page } from "@playwright/test";

/**
 * Fase K3 — animation infrastructure on the production build:
 *  - the dev-only lab and the dev-only Theatre Studio never reach production;
 *  - Lenis is the single scroll source on desktop with motion allowed, driven by the shared GSAP
 *    ticker (no second rAF loop), synced with the shared scroll frame;
 *  - anchors, scroll lock, client navigation and back/forward keep working with it;
 *  - reduced motion and touch keep native scrolling; auth/dashboard get none of it.
 */

type Kinetic = {
  __kinetic?: {
    state: () => { route: string; previousRoute: string | null; activeSection: string | null; reducedMotion: boolean; smoothScroll: boolean; scrollLocks: number };
    frame: () => { scroll: { y: number; limit: number; progress: number; velocity: number; direction: number } };
    animations: () => { id: string }[];
    scrollEngine: () => string;
  };
};

const desktop = { viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" as const };
const engine = (page: Page) => page.evaluate(() => (window as unknown as Kinetic).__kinetic?.scrollEngine() ?? "missing");
const state = (page: Page) => page.evaluate(() => (window as unknown as Kinetic).__kinetic!.state());
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

/** Waits until the page stops scrolling (Lenis settled). */
async function settle(page: Page) {
  await expect
    .poll(async () => {
      const a = await scrollY(page);
      await page.waitForTimeout(150);
      return a === (await scrollY(page));
    })
    .toBe(true);
}

test("the animation lab is a 404 in production and ships no lab code", async ({ page }) => {
  const response = await page.goto("/dev/animation-lab");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Loading animation lab")).toHaveCount(0);
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("public pages load no Theatre Studio, no Theatre core, no three.js and no lab code", async ({ browser }) => {
  test.setTimeout(180_000);
  const markers: [string, RegExp][] = [
    ["Theatre Studio", /TheatreStudio|theatre-studio|@theatre\/studio/],
    ["Theatre core", /Theatre_RafDriver_PublicAPI/],
    ["three.js", /WebGLRenderer/],
    ["animation lab", /lab:theatre|Loading animation lab/],
  ];
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  const found: string[] = [];
  page.on("response", async (res) => {
    if (!res.url().endsWith(".js")) return;
    const body = await res.text().catch(() => "");
    for (const [name, re] of markers) if (re.test(body)) found.push(`${name} in ${res.url()}`);
  });
  for (const path of ["/", "/about", "/journey", "/projects", "/contact", "/dev/animation-lab"]) {
    await page.goto(path);
    await page.waitForTimeout(2500); // idle-time chunks (Lenis, GSAP runtime)
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);
  }
  expect(found).toEqual([]);
  await context.close();
});

test("Lenis smooths the wheel on desktop and is the single scroll source", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await page.goto("/about");
  await expect.poll(() => engine(page)).toBe("lenis");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  expect((await state(page)).smoothScroll).toBe(true);

  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 900);
  // Sample the position on consecutive frames: a smoothed scroll takes several distinct steps.
  const samples = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const out: number[] = [];
        const step = () => {
          out.push(Math.round(window.scrollY));
          if (out.length < 12) requestAnimationFrame(step);
          else resolve(out);
        };
        requestAnimationFrame(step);
      }),
  );
  const distinct = new Set(samples).size;
  expect(distinct, `scroll samples ${samples.join(",")}`).toBeGreaterThan(3);
  for (let i = 1; i < samples.length; i++) expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1]);
  await settle(page);

  const y = await scrollY(page);
  expect(y).toBeGreaterThan(600);
  const frame = await page.evaluate(() => (window as unknown as Kinetic).__kinetic!.frame().scroll);
  expect(Math.abs(frame.y - y)).toBeLessThanOrEqual(1);
  expect(frame.progress).toBeCloseTo(frame.y / frame.limit, 2);
  await context.close();
});

test("one animation loop: Lenis runs inside GSAP's ticker, adds no rAF loop, and an idle page requests no frames", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  // Count, per callback *source*, how many frames it runs in. A loop re-registers the same function
  // every frame; one-off rAFs (a reveal measurement, Lenis' preventNextNativeScrollEvent) do not.
  await context.addInitScript(() => {
    const w = window as unknown as { __raf: { on: boolean; frames: Set<number>; bySource: Map<string, Set<number>> } };
    w.__raf = { on: false, frames: new Set(), bySource: new Map() };
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) =>
      raf((t) => {
        if (w.__raf.on) {
          w.__raf.frames.add(t);
          const key = cb.toString().slice(0, 160);
          if (!w.__raf.bySource.has(key)) w.__raf.bySource.set(key, new Set());
          w.__raf.bySource.get(key)!.add(t);
        }
        cb(t);
      });
  });
  const page = await context.newPage();
  await page.goto("/about");
  await expect.poll(() => engine(page)).toBe("lenis");
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(150);
  // 600 ms window while Lenis is still animating.
  const loops = await page.evaluate(async () => {
    const w = window as unknown as { __raf: { on: boolean; frames: Set<number>; bySource: Map<string, Set<number>> } };
    const startY = window.scrollY;
    w.__raf.on = true;
    await new Promise((r) => setTimeout(r, 600));
    w.__raf.on = false;
    const frames = w.__raf.frames.size;
    const recurring = [...w.__raf.bySource.values()].filter((set) => set.size > frames / 2).length;
    return { frames, recurring, moved: window.scrollY - startY };
  });
  expect(loops.moved, "Lenis was animating during the window").toBeGreaterThan(0);
  expect(loops.frames).toBeGreaterThan(5);
  // Exactly one: GSAP's ticker, which advances Lenis, ScrollTrigger and every tween. Lenis
  // (autoRaf: false), Theatre (custom rafDriver) and R3F (frameloop "never") add none, and
  // ScrollTrigger — whose registration starts its own keep-alive rAF — is not registered on pages
  // without triggers.
  expect(loops.recurring).toBe(1);

  // Idle = no frames: once Lenis has settled, nothing requests animation frames. GSAP's ticker
  // falls asleep at its next autoSleep check (every 120 frames), so poll for a quiet 1 s window.
  await settle(page);
  const framesInOneSecond = () =>
    page.evaluate(async () => {
      const w = window as unknown as { __raf: { on: boolean; frames: Set<number>; bySource: Map<string, Set<number>> } };
      w.__raf.frames.clear();
      w.__raf.on = true;
      await new Promise((r) => setTimeout(r, 1000));
      w.__raf.on = false;
      return w.__raf.frames.size;
    });
  await expect.poll(framesInOneSecond, { timeout: 10_000, intervals: [0] }).toBe(0);
  await context.close();
});

test("same-page anchors under Lenis: smooth scroll, hash in history, back returns", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await page.goto("/about");
  await expect.poll(() => engine(page)).toBe("lenis");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await settle(page);
  const bottom = await scrollY(page);
  expect(bottom).toBeGreaterThan(1000);
  await page.getByRole("link", { name: "Back to top" }).click();
  await expect.poll(() => scrollY(page)).toBeLessThan(5);
  expect(new URL(page.url()).hash).toBe("#top");
  await page.goBack();
  await expect.poll(() => new URL(page.url()).hash).toBe("");
  expect(new URL(page.url()).pathname).toBe("/about");
  await context.close();
});

test("scroll lock: the page behind the open menu does not scroll, and scrolls again after", async ({ browser }) => {
  const context = await browser.newContext({ ...desktop, viewport: { width: 1000, height: 800 } });
  const page = await context.newPage();
  await page.goto("/about");
  await expect.poll(() => engine(page)).toBe("lenis");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
  expect((await state(page)).scrollLocks).toBe(1);
  const before = await scrollY(page);
  await page.mouse.move(500, 400);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(600);
  expect(await scrollY(page)).toBe(before);
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await state(page)).scrollLocks).toBe(0);
  await page.mouse.wheel(0, 800);
  await expect.poll(() => scrollY(page)).toBeGreaterThan(before + 300);
  await context.close();
});

/** /about at 1400 px → Projects → back; returns where the page lands (instantly, not animated). */
async function backRoundTrip(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
  await settle(page);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: /Projects/ }).click();
  await page.waitForURL("**/projects");
  await settle(page);
  await page.goBack();
  await page.waitForURL("**/about");
  // Restoration is instant: the position is final on the next frames (no smooth animation from 0).
  await page.waitForTimeout(200);
  const early = await scrollY(page);
  await settle(page);
  return { early, final: await scrollY(page) };
}

test("client navigation: route state, no inertia carried over, back restores like native scrolling", async ({ browser }) => {
  test.setTimeout(150_000);
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await page.goto("/");
  await expect.poll(() => engine(page)).toBe("lenis");
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 300);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: /About/ }).click();
  await page.waitForURL("**/about");
  await settle(page);
  expect(await scrollY(page)).toBeLessThan(5);
  const s = await state(page);
  expect(s.route).toBe("/about");
  expect(s.previousRoute).toBe("/");

  const lenis = await backRoundTrip(page);
  expect(lenis.early, "back restoration is not animated").toBe(lenis.final);
  expect(lenis.final).toBeGreaterThan(0);
  // Wheel still works after the round trip.
  await page.mouse.wheel(0, 500);
  await expect.poll(() => scrollY(page)).toBeGreaterThan(lenis.final + 200);
  await context.close();

  // Same round trip with native scrolling (reduced motion): Lenis must not change where back lands.
  // (Both currently land above the 1400 px left — Next/browser restoration, not Lenis; see KINETIC_PHASES K3.)
  const nativeContext = await browser.newContext({ ...desktop, reducedMotion: "reduce" });
  const nativePage = await nativeContext.newPage();
  await nativePage.goto("/about");
  await expect.poll(() => engine(nativePage)).toBe("native");
  const native = await backRoundTrip(nativePage);
  expect(Math.abs(lenis.final - native.final)).toBeLessThan(40);
  await nativeContext.close();
});

test("reduced motion keeps native scrolling and never loads the smooth-scroll runtime", async ({ page }) => {
  await page.goto("/about");
  await page.waitForTimeout(2500);
  expect(await engine(page)).toBe("native");
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  const s = await state(page);
  expect(s.reducedMotion).toBe(true);
  expect(s.smoothScroll).toBe(false);
  // The shared scroll frame still updates (native engine).
  await page.evaluate(() => window.scrollTo(0, 800));
  await expect.poll(() => page.evaluate(() => Math.round((window as unknown as Kinetic).__kinetic!.frame().scroll.y))).toBe(800);
});

test("touch devices keep native momentum scrolling", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("/about");
  await page.waitForTimeout(2500);
  expect(await engine(page)).toBe("native");
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  await context.close();
});

test("auth pages (and the dashboard frame) get no animation infrastructure", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await page.goto("/auth/login");
  await page.waitForTimeout(2500);
  expect(await page.evaluate(() => typeof (window as unknown as Kinetic).__kinetic)).toBe("undefined");
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  await context.close();
});

test("shared state tracks the active section", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await page.goto("/about");
  await expect.poll(() => engine(page)).toBe("lenis");
  await page.evaluate(() => window.scrollTo(0, 1600));
  await expect.poll(async () => (await state(page)).activeSection).not.toBeNull();
  await context.close();
});
