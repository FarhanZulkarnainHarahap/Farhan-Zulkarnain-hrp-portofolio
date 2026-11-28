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
  // The object moves (idle + Theatre timeline), so hover and click are retried together: a point that
  // was over the object a moment ago can miss by the time the click lands (since the K4 clock fix the
  // lab object animates at its real speed).
  let selected = false;
  for (let attempt = 0; attempt < 3 && !selected; attempt++)
    for (const point of points) {
      await page.mouse.move(point.x, point.y);
      if (!(await page.getByTestId("debug-pointer").innerText()).includes("lab-object")) {
        await page.waitForTimeout(150);
        if (!(await page.getByTestId("debug-pointer").innerText()).includes("lab-object")) continue;
      }
      await page.mouse.click(point.x, point.y);
      await page.waitForTimeout(200);
      if ((await page.getByTestId("debug-pointer").innerText()).includes("/ lab-object")) {
        selected = true;
        break;
      }
    }
  expect(selected, "hover then click on the moving lab object selects it").toBe(true);

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

/* ── Fase K4: persistent global canvas & scene manager (lab sections 13–14) ─────────────────── */

type SceneDbg = {
  state: () => { renderer: string; activeScene: string | null; mountCount: number; quality: string; qualityPinned: boolean; selectedObject: string | null; hoveredObject: string | null; renderMode: string; rendererError: string | null };
  frame: () => { camera: { position: [number, number, number] }; probes: Record<string, unknown> };
};
const sceneState = (page: Page) => page.evaluate(() => (window as unknown as { __kinetic: { scene: SceneDbg } }).__kinetic.scene.state());
const sceneFrame = (page: Page) => page.evaluate(() => (window as unknown as { __kinetic: { scene: SceneDbg } }).__kinetic.scene.frame());

async function openK4(page: Page) {
  const errors = await openLab(page);
  await page.getByTestId("k4-stage").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("k4-status")).toContainText("Renderer: active", { timeout: 60_000 });
  await expect(page.getByTestId("k4-status")).toContainText("scene: lab (active)", { timeout: 60_000 });
  return errors;
}

test("K4 lab: one persistent canvas, scene switching, camera / lighting presets, Theatre camera, quality pin", async ({ browser }) => {
  test.setTimeout(300_000);
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  const errors = await openK4(page);
  await expect(page.getByTestId("k4-status")).toContainText("mounts: 1");

  // Scene switching inside the same canvas.
  for (const id of ["about", "projects", "contact"]) {
    await page.getByTestId(`k4-scene-${id}`).click();
    await expect(page.getByTestId("k4-status")).toContainText(`scene: ${id} (active)`, { timeout: 30_000 });
  }
  await page.getByTestId("k4-scene-route").click();
  await expect(page.getByTestId("k4-status")).toContainText("scene: lab (active)", { timeout: 30_000 });
  expect((await sceneState(page)).mountCount).toBe(1);

  // Camera presets: the focus preset dollies in (z 10 − 0.6), reset returns to the scene preset.
  await page.getByTestId("k4-camera-focus").click();
  await expect(page.getByTestId("debug-camera-preset")).toHaveText("focus");
  await expect.poll(async () => (await sceneFrame(page)).camera.position[2], { timeout: 15_000 }).toBeLessThan(9.45);
  await page.getByTestId("k4-camera-reset").click();
  await expect.poll(async () => (await sceneFrame(page)).camera.position[2], { timeout: 15_000 }).toBeGreaterThan(9.6);
  await page.getByTestId("k4-light-showcase").click();
  await expect(page.getByTestId("k4-light-showcase")).toHaveAttribute("aria-pressed", "true");

  // Theatre drives the camera through the scene manager (Global Camera object: z = 6), then lets go.
  await page.getByTestId("k4-theatre-camera").click();
  await expect.poll(async () => (await sceneFrame(page)).camera.position[2], { timeout: 15_000 }).toBeLessThan(6.2);
  await page.getByTestId("k4-theatre-camera").click();
  await expect.poll(async () => (await sceneFrame(page)).camera.position[2], { timeout: 15_000 }).toBeGreaterThan(9.5);

  // Quality pin and back to the quality manager.
  await page.getByTestId("k4-quality-medium").click();
  await expect.poll(async () => (await sceneState(page)).quality).toBe("medium");
  await page.getByTestId("k4-quality-auto").click();
  await expect.poll(async () => (await sceneState(page)).qualityPinned).toBe(false);

  expect(errors).toEqual([]);
  await context.close();
});

test("K4 lab: 3D objects respond to the pointer, and to the keyboard through the object buttons", async ({ browser }) => {
  test.setTimeout(300_000);
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  const errors = await openK4(page);

  // Keyboard alternative: the object's button runs the same click response and selects it.
  await page.getByTestId("k4-object-lab:box").focus();
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await sceneState(page)).selectedObject).toBe("lab:box");
  await page.getByTestId("k4-focus").click();
  await expect(page.getByTestId("debug-object")).toContainText("focused");

  // Pointer: probe the stage until a raycast hits one of its objects.
  const box = (await page.getByTestId("k4-stage").boundingBox())!;
  let hovered: string | null = null;
  for (let gy = 0.15; gy < 0.95 && !hovered; gy += 0.1)
    for (let gx = 0.1; gx < 0.95 && !hovered; gx += 0.1) {
      await page.mouse.move(box.x + box.width * gx, box.y + box.height * gy);
      await page.waitForTimeout(80);
      hovered = (await sceneState(page)).hoveredObject;
    }
  expect(hovered, "a 3D object in the stage reacts to the pointer").not.toBeNull();
  // Outside the interactive stage nothing is hovered.
  await page.mouse.move(5, 300);
  await expect.poll(async () => (await sceneState(page)).hoveredObject).toBeNull();
  expect(errors).toEqual([]);
  await context.close();
});

test("K4 lab: 3D masking prototype — clipping plane, bottom-to-top, scroll-driven and reversible", async ({ browser }) => {
  test.setTimeout(300_000);
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  const errors = await openK4(page);
  const probe = async (key: string) => Number((await sceneFrame(page)).probes[key]);

  expect(await probe("lab:mask:clipping")).toBe(1);
  expect(await probe("lab:mask:opacity")).toBe(1); // not a fade

  // Manual: fully hidden → half → fully revealed (bottom to top: the plane rises).
  const range = page.getByTestId("k4-mask-range");
  for (const [value, expected] of [["0", 0], ["0.5", 0.5], ["1", 1]] as const) {
    await range.fill(value);
    await expect.poll(() => probe("lab:mask:revealed")).toBeCloseTo(expected, 2);
  }
  // (Not compared in world units: fill() scrolls the input into view, which moves the stage.)
  await range.fill("0.2");
  await expect.poll(() => probe("lab:mask:revealed")).toBeCloseTo(0.2, 2);

  // Scroll-driven and reversible.
  await page.getByTestId("k4-mask-scroll").click();
  const stageTop = await page.getByTestId("k4-stage").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const at = async (offset: number) => {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), stageTop + offset);
    await page.waitForTimeout(500);
    return probe("lab:mask:progress");
  };
  const a = await at(-800);
  const b = await at(-200);
  const c = await at(300);
  expect(b).toBeGreaterThan(a);
  expect(c).toBeGreaterThan(b);
  const back = await at(-800);
  expect(back).toBeCloseTo(a, 2);
  expect(errors).toEqual([]);
  await context.close();
});

test("K4 lab: failures stay contained — context loss and recovery, a missing asset, a broken shader", async ({ browser }) => {
  test.setTimeout(300_000);
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await openK4(page);

  await page.getByTestId("k4-lose").click();
  await expect(page.getByTestId("k4-status")).toContainText(/Renderer: (lost|restoring)/);
  expect((await sceneState(page)).renderMode).toBe("off");
  await expect(page.getByTestId("k4-status")).toContainText("Renderer: active", { timeout: 20_000 });
  await expect(page.getByTestId("k4-error")).toContainText("1 lost / 1 recovered");
  await expect(page.getByTestId("k4-status")).toContainText("mounts: 1");

  await page.getByTestId("k4-asset-fail").click();
  await expect(page.getByTestId("k4-asset")).toContainText("failed as expected", { timeout: 15_000 });
  await expect(page.getByTestId("debug-assets")).toContainText("1 failed");

  await page.getByTestId("k4-shader").click();
  await expect(page.getByTestId("k4-error")).toContainText("shader", { timeout: 15_000 });
  // The rest of the scene keeps rendering.
  await expect(page.getByTestId("k4-status")).toContainText("Renderer: active");
  await page.getByTestId("k4-shader").click();
  await context.close();
});
