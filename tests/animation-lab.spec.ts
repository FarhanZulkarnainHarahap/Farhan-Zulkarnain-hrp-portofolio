import { expect, test, type Page } from "@playwright/test";

/**
 * Fase K3 — /dev/animation-lab on the DEV server (the route is a 404 in production, see
 * animation.spec.ts). Proves the engines work together, not just that they are installed:
 * GSAP SplitText, Lenis, ScrollTrigger, Motion, Theatre (+ Studio in development), R3F + GLSL,
 * the ownership registry and reduced motion. Runs in the "dev-quality" project (port 3102).
 */

const desktop = { viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" as const };
// THREE.Clock: deprecation warning raised inside @react-three/fiber 9.8.2 with three r187 (not our code).
// "You have Reduced Motion enabled": Motion's development-only notice when the OS asks for reduced
// motion, which is exactly what the reduced-motion test sets up.
const ignored = [/You have Reduced Motion enabled on your device/, /GL Driver Message/, /GPU stall/, /Download the React DevTools/, /\[HMR\]/, /\[Fast Refresh\]/, /WebGL: INVALID_ENUM|GroupMarkerNotSet/, /THREE\.Clock: This module has been deprecated/];

async function openLab(page: Page, query = "?studio=0") {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if ((msg.type() === "error" || msg.type() === "warning") && !ignored.some((re) => re.test(msg.text()))) errors.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(`/dev/animation-lab${query}`, { timeout: 180_000 });
  await expect(page.getByTestId("lab-canvas").locator("canvas")).toBeVisible({ timeout: 120_000 });
  await expect(page.getByTestId("lab-theatre-status")).toContainText("ready", { timeout: 60_000 });
  return errors;
}

const text = (page: Page, id: string) => page.getByTestId(id).innerText();

/**
 * The scroll engine the quality tier allows. Headless Chromium renders WebGL in software
 * (SwiftShader), which the quality probe rates "low": smooth scrolling is then off by design, so
 * the lab must show native scrolling. (Lenis itself is covered by animation.spec.ts.)
 */
async function expectedEngine(page: Page) {
  const quality = (await text(page, "debug-quality")).trim();
  return /^(high|medium)/.test(quality) ? "Lenis" : "native scrolling";
}

async function scrollToSection(page: Page, id: string, fraction = 0) {
  await page.evaluate(
    ([sel, f]) => {
      const el = document.getElementById(sel as string)!;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + (f as number) * el.offsetHeight - window.innerHeight / 2);
    },
    [id, fraction],
  );
  await page.waitForTimeout(400);
}

test.describe.configure({ mode: "serial" });

test("lab: render loop, WebGL, Theatre timeline, masked text, Lenis", async ({ browser }) => {
  test.setTimeout(300_000);
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  const errors = await openLab(page);

  // R3F through the shared ticker: frames are rendered and FPS is reported.
  await expect.poll(async () => Number(await text(page, "debug-fps")), { timeout: 30_000 }).toBeGreaterThan(0);
  expect(await text(page, "debug-webgl")).toMatch(/webgl2|webgl1/);
  expect(await text(page, "debug-ticker")).toMatch(/render [1-9]/);

  // Theatre sequence plays (position advances) and is registered as the active timeline.
  await expect(page.getByTestId("lab-theatre-status")).toContainText("sequence playing");
  const t1 = await text(page, "debug-timeline");
  await page.waitForTimeout(600);
  expect(await text(page, "debug-timeline")).not.toBe(t1);
  expect(await text(page, "debug-animations")).toContain("lab:theatre (theatre)");
  await page.getByTestId("lab-theatre-pause").click();
  await expect(page.getByTestId("lab-theatre-status")).toContainText("sequence paused");

  // GSAP masked reveal ran and reverted SplitText (original text, no wrappers left).
  const masked = page.getByTestId("lab-masked");
  await expect(masked).toHaveAttribute("data-state", "done", { timeout: 15_000 });
  expect(await masked.evaluate((el) => el.children.length)).toBe(0);
  await expect(masked).toHaveText("Kinetic systems reveal line by line");

  // The engine follows the quality tier; programmatic scroll and anchors land on their targets either way.
  await expect(page.getByTestId("lab-lenis-engine")).toContainText(await expectedEngine(page), { timeout: 10_000 });
  await page.getByTestId("lab-scroll-to").click();
  await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("lab-theatre")!.getBoundingClientRect().top - 72)), { timeout: 10_000 }).toBeLessThan(40);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.getByTestId("lab-anchor").click();
  await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("lab-scene")!.getBoundingClientRect().top - 72)), { timeout: 10_000 }).toBeLessThan(40);
  expect(new URL(page.url()).hash).toBe("#lab-scene");

  expect(errors).toEqual([]);
  await context.close();
});

test("lab: ScrollTrigger progress, GSAP ↔ Theatre sync, one object with four owners, ownership", async ({ browser }) => {
  test.setTimeout(300_000);
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  const errors = await openLab(page);

  await scrollToSection(page, "lab-progress", 0.5);
  await expect.poll(async () => parseFloat(await text(page, "lab-progress"))).toBeGreaterThan(10);
  expect(parseFloat(await text(page, "lab-progress"))).toBeLessThan(90);

  // Scroll Masking sequence position follows scroll; Theatre interpolates; uniforms follow.
  const readMask = async () => {
    const m = /position ([\d.]+) → mask progress ([\d.]+), dissolve ([\d.]+)/.exec(await text(page, "lab-sync"));
    return m ? { pos: +m[1], progress: +m[2], dissolve: +m[3] } : null;
  };
  await scrollToSection(page, "lab-sync", 0);
  await expect.poll(async () => (await readMask())?.progress ?? -1).toBeGreaterThan(0.9);
  // About 30 % through 09–11: the mask has closed (keyframe 0.3 → progress 0, dissolve 0.5).
  await page.evaluate(() => {
    const range = document.getElementById("lab-sync")!.parentElement!;
    const top = range.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + range.offsetHeight * 0.3 - window.innerHeight / 2);
  });
  await expect.poll(async () => (await readMask())?.progress ?? 1).toBeLessThan(0.3);
  expect((await readMask())!.dissolve).toBeGreaterThan(0.2);

  // Scroll layer of the shared object follows its own ScrollTrigger.
  await scrollToSection(page, "lab-combined", 0.5);
  await expect.poll(async () => Number(/rotation (\d+)°/.exec(await text(page, "lab-combined"))?.[1] ?? 0)).toBeGreaterThan(20);

  // A second owner for a claimed property is refused.
  await page.getByTestId("lab-conflict").click();
  await expect(page.getByTestId("lab-conflict-result")).toContainText("Refused");
  await expect(page.getByTestId("lab-conflict-result")).toContainText("owned by scrolltrigger");

  expect(errors).toEqual([]);
  await context.close();
});

test("lab: Motion states, 3D hover, reduced-motion mode", async ({ browser }) => {
  test.setTimeout(300_000);
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  const errors = await openLab(page);

  // 3D hover (raycast → shared hovered state). Bring the sticky canvas fully into view, then probe
  // a few points until the raycast hits the
  // object (the torus knot has holes, so the exact centre can miss).
  await scrollToSection(page, "lab-scene", 0);
  await page.waitForTimeout(600);
  const box = (await page.getByTestId("lab-canvas").boundingBox())!;
  const viewport = page.viewportSize()!;
  const visibleBottom = Math.min(box.y + box.height, viewport.height);
  const points = [
    [0.5, 0.5], [0.4, 0.4], [0.6, 0.4], [0.4, 0.6], [0.6, 0.6], [0.5, 0.3], [0.5, 0.7], [0.3, 0.5], [0.7, 0.5],
  ].map(([fx, fy]) => ({ x: box.x + box.width * fx, y: box.y + (visibleBottom - box.y) * fy }));
  let hit: { x: number; y: number } | null = null;
  for (const point of points) {
    await page.mouse.move(point.x, point.y);
    try {
      await expect(page.getByTestId("debug-pointer")).toContainText("lab-object", { timeout: 2_500 });
      hit = point;
      break;
    } catch {
      /* try the next point */
    }
  }
  expect(hit, "the pointer raycast reached the object").not.toBeNull();
  await page.mouse.click(hit!.x, hit!.y);
  await expect(page.getByTestId("debug-pointer")).toContainText("/ lab-object");

  // Motion click states: loading → success (rapid clicks ignored while busy).
  // The demo records every state it went through (data-history), so a slow frame cannot hide one.
  const clickButton = page.getByTestId("lab-click-button");
  await clickButton.scrollIntoViewIfNeeded();
  // Two clicks in the same task (before React re-renders): the second must be ignored.
  await clickButton.evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  await expect(page.getByTestId("lab-click-state")).toHaveAttribute("data-history", "idle,loading,success,idle", { timeout: 10_000 });
  await expect(page.getByTestId("lab-click-state")).toHaveText("State: idle");

  // Panel toggle survives rapid clicking and ends in the expected state.
  const toggle = page.getByTestId("lab-panel-toggle");
  for (let i = 0; i < 5; i++) await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#lab-panel")).toBeVisible();

  // Reduced-motion mode: engines switch live.
  await page.getByTestId("lab-reduced-toggle").scrollIntoViewIfNeeded();
  await page.getByTestId("lab-reduced-toggle").click();
  await expect(page.getByTestId("debug-reduced")).toHaveText("on");
  await expect(page.getByTestId("lab-lenis-engine")).toContainText("native scrolling");
  await expect(page.getByTestId("lab-theatre-status")).toContainText("sequence idle");
  await page.getByTestId("lab-reduced-toggle").click();
  await expect(page.getByTestId("debug-reduced")).toHaveText("off");
  await expect(page.getByTestId("lab-lenis-engine")).toContainText(await expectedEngine(page), { timeout: 10_000 });

  expect(errors).toEqual([]);
  await context.close();
});

test("lab: Theatre Studio loads in development only when asked (default on the lab)", async ({ browser }) => {
  test.setTimeout(300_000);
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await openLab(page, "");
  await expect(page.getByTestId("lab-theatre-status")).toContainText("studio loaded (development)");
  await context.close();
});

test("lab under OS reduced motion: native scroll, Theatre not auto-played, content complete", async ({ browser }) => {
  test.setTimeout(300_000);
  const context = await browser.newContext({ ...desktop, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = await openLab(page);
  await expect(page.getByTestId("debug-reduced")).toHaveText("on");
  await expect(page.getByTestId("lab-lenis-engine")).toContainText("native scrolling");
  await expect(page.getByTestId("lab-theatre-status")).not.toContainText("sequence playing");
  await expect(page.getByTestId("lab-masked")).toHaveText("Kinetic systems reveal line by line");
  expect(errors).toEqual([]);
  await context.close();
});
