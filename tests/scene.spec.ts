import { expect, test, type Browser, type Page } from "@playwright/test";

/**
 * Fase K4 — persistent WebGL canvas and global scene manager, on the production build.
 *
 * Headless Chromium renders WebGL in software (SwiftShader): the quality manager rates it "low",
 * which is what these tests run at. They assert behaviour (mounting, scene state, transforms that
 * change between frames, fallbacks), never GPU frame rates.
 */

type Vec3 = [number, number, number];
type SceneDebug = {
  state: () => {
    renderer: string;
    activeScene: string | null;
    scenes: Record<string, string>;
    mountCount: number;
    renderMode: string;
    hoveredObject: string | null;
    selectedObject: string | null;
    focusedObject: string | null;
    cameraPreset: string | null;
    contextLosses: number;
    recoveries: number;
    quality: string;
  };
  frame: () => { camera: { position: Vec3; settled: boolean }; renderer: { frames: number; geometries: number; textures: number; calls: number }; probes: Record<string, unknown> };
  loop: () => { reasons: string[]; attached: boolean };
  controller: { loseContext: () => boolean };
};
type W = { __kinetic?: { scene?: SceneDebug; state: () => { activeSection: string | null } } };

const desktop = { viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" as const };
const scene = (page: Page) => page.evaluate(() => (window as unknown as W).__kinetic!.scene!.state());
const frame = (page: Page) => page.evaluate(() => (window as unknown as W).__kinetic!.scene!.frame());

async function waitForScene(page: Page, id: string, timeout = 60_000) {
  await expect
    .poll(async () => page.evaluate(() => (window as unknown as W).__kinetic?.scene?.state()).then((s) => s && `${s.renderer}:${s.activeScene}:${s.scenes[s.activeScene ?? ""]}`), { timeout })
    .toBe(`active:${id}:active`);
}

async function newPage(browser: Browser, options: Parameters<Browser["newContext"]>[0] = desktop) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return { context, page, errors };
}

test.describe.configure({ timeout: 180_000 });

test("one persistent canvas on public pages: rendered, never recreated by client navigation, scenes switch inside it", async ({ browser }) => {
  const { context, page, errors } = await newPage(browser);
  await page.goto("/");
  await waitForScene(page, "home");
  const canvas = page.locator("#webgl-root canvas");
  await expect(canvas).toHaveCount(1);
  await canvas.evaluate((el) => ((el as HTMLCanvasElement & { __k4?: boolean }).__k4 = true));

  const nav = page.getByRole("navigation", { name: "Main" });
  for (const [link, path, id] of [
    [/About/, "/about", "about"],
    [/Projects/, "/projects", "projects"],
    [/Journey/, "/journey", "journey"],
    [/Contact/, "/contact", "contact"],
  ] as const) {
    await nav.getByRole("link", { name: link }).click();
    await page.waitForURL(`**${path}`);
    await waitForScene(page, id);
    expect((await scene(page)).mountCount).toBe(1);
    // Same <canvas> element: not remounted.
    expect(await page.locator("#webgl-root canvas").evaluate((el) => (el as HTMLCanvasElement & { __k4?: boolean }).__k4 === true)).toBe(true);
  }
  await page.getByRole("link", { name: /Farhan Zulkarnain/ }).first().click();
  await page.waitForURL((url) => url.pathname === "/");
  await waitForScene(page, "home");
  const s = await scene(page);
  expect(s.mountCount).toBe(1);
  // Scenes that were left are disposed, not kept alive.
  expect(s.scenes.about).toBe("disposed");
  expect(errors).toEqual([]);
  await context.close();
});

test("auth pages and the dashboard never mount the canvas or download three.js", async ({ browser }) => {
  const { context, page } = await newPage(browser);
  const three: string[] = [];
  page.on("response", async (res) => {
    if (!res.url().endsWith(".js")) return;
    if (/WebGLRenderer/.test(await res.text().catch(() => ""))) three.push(res.url());
  });
  for (const path of ["/auth/login", "/auth/register", "/dashboard"]) {
    await page.goto(path);
    await page.waitForTimeout(3000);
    await expect(page.locator("#webgl-root")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  }
  expect(three).toEqual([]);
  await context.close();
});

test("section-based scenes on /about and camera presets per section", async ({ browser }) => {
  // Reduced motion: the camera snaps to its preset (no damping, sway or parallax) → exact values.
  const { context, page } = await newPage(browser, { ...desktop, reducedMotion: "reduce" });
  await page.goto("/about");
  await waitForScene(page, "about");
  await expect.poll(async () => (await frame(page)).camera.position.map((v) => +v.toFixed(3))).toEqual([0.2, 0.1, 10]);

  await page.evaluate(() => document.getElementById("stack")!.scrollIntoView());
  await waitForScene(page, "skills");
  await expect.poll(async () => (await frame(page)).camera.position.map((v) => +v.toFixed(3))).toEqual([-0.25, 0.3, 9.8]);

  await page.evaluate(() => document.getElementById("documents")!.scrollIntoView());
  await waitForScene(page, "about");
  await expect.poll(async () => (await scene(page)).cameraPreset).toBe("documents");
  await expect.poll(async () => (await frame(page)).camera.position.map((v) => +v.toFixed(3))).toEqual([0.1, -0.1, 9.7]);
  await context.close();
});

test("orbit prototype: nodes move continuously in 3D while the hero is visible; on-demand when it is not", async ({ browser }) => {
  const { context, page } = await newPage(browser);
  await page.goto("/");
  await waitForScene(page, "home");
  await expect(page.locator("html")).toHaveAttribute("data-orbit-renderer", "webgl");
  const samples: Vec3[] = [];
  for (let i = 0; i < 6; i++) {
    samples.push((await frame(page)).probes["home:node0"] as Vec3);
    await page.waitForTimeout(250);
  }
  const distinct = new Set(samples.map((p) => p.map((v) => v.toFixed(3)).join())).size;
  expect(distinct, JSON.stringify(samples)).toBeGreaterThanOrEqual(5);
  // Real 3D motion: depth (z) changes too, not only screen x / y.
  const zs = samples.map((p) => p[2]);
  expect(Math.max(...zs) - Math.min(...zs)).toBeGreaterThan(0.01);
  expect((await scene(page)).renderMode).toBe("continuous");

  // Scrolled away from the hero: the loop releases the orbit and goes idle.
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect.poll(async () => page.evaluate(() => (window as unknown as W).__kinetic!.scene!.loop().attached), { timeout: 15_000 }).toBe(false);
  const parked = (await frame(page)).probes["home:node0"];
  await page.waitForTimeout(600);
  expect((await frame(page)).probes["home:node0"]).toEqual(parked);
  await context.close();
});

test("reduced motion: the orbit is frozen at the SVG layout and the scene renders on demand", async ({ browser }) => {
  const { context, page } = await newPage(browser, { ...desktop, reducedMotion: "reduce" });
  await page.goto("/");
  await waitForScene(page, "home");
  await expect.poll(async () => (await frame(page)).probes["home:node0"]).toBeTruthy();
  await page.waitForTimeout(300);
  const a = (await frame(page)).probes["home:node0"];
  await page.waitForTimeout(800);
  expect((await frame(page)).probes["home:node0"]).toEqual(a);
  await expect.poll(async () => page.evaluate(() => (window as unknown as W).__kinetic!.scene!.loop().attached), { timeout: 15_000 }).toBe(false);
  expect((await scene(page)).renderMode).toBe("demand");
  await context.close();
});

test("3D hover and click respond inside the orbit stage; DOM controls and text keep working above the canvas", async ({ browser }) => {
  const { context, page } = await newPage(browser);
  await page.goto("/");
  await waitForScene(page, "home");
  const stage = (await page.locator("[data-orbit-stage]").boundingBox())!;
  const cx = stage.x + stage.width / 2;
  const cy = stage.y + stage.height / 2;

  // The canvas takes no pointer events: what is under the pointer is the page itself.
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.tagName.toLowerCase(), [cx, cy])).not.toBe("canvas");

  // The core is a plate that swings ±0.35 rad and floats: probe a few points around the centre
  // (real pointers move too — R3F raycasts on pointer events, not per frame).
  let hovered: string | null = null;
  for (let attempt = 0; attempt < 4 && hovered !== "home:core"; attempt++)
    for (const [dx, dy] of [[0, 0], [6, 0], [-6, 0], [0, 6], [0, -6]]) {
      await page.mouse.move(cx + dx, cy + dy, { steps: 2 });
      await page.waitForTimeout(150);
      hovered = (await scene(page)).hoveredObject;
      if (hovered === "home:core") break;
    }
  expect(hovered).toBe("home:core");
  await expect(page.locator("html")).toHaveAttribute("data-scene-hover", "true");
  const before = (await frame(page)).camera.position[2];
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(async () => (await scene(page)).selectedObject).toBe("home:core");
  expect((await scene(page)).focusedObject).toBe("home:core");
  // Focus moves the camera closer (dolly in).
  await expect.poll(async () => (await frame(page)).camera.position[2], { timeout: 10_000 }).toBeLessThan(before - 0.2);

  // Leaving the stage releases the hover.
  const h1 = (await page.locator("#hero-title").boundingBox())!;
  await page.mouse.move(h1.x + 20, h1.y + 20);
  await expect.poll(async () => (await scene(page)).hoveredObject).toBeNull();

  // Text is selectable and buttons are clickable with the canvas mounted.
  await page.locator("#hero-title").click({ clickCount: 3 });
  expect(await page.evaluate(() => window.getSelection()?.toString() ?? "")).toMatch(/FARHAN|Farhan/i);
  await page.getByRole("link", { name: "Explore projects" }).click();
  await page.waitForURL("**/projects");
  await context.close();
});

test("no WebGL: static fallbacks, three.js never loaded, navigation works", async ({ browser }) => {
  const { context, page, errors } = await newPage(browser);
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (/webgl/i.test(type)) return null;
      return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
    } as typeof original;
  });
  const three: string[] = [];
  page.on("response", async (res) => {
    if (res.url().endsWith(".js") && /WebGLRenderer/.test(await res.text().catch(() => ""))) three.push(res.url());
  });
  await page.goto("/");
  await expect.poll(async () => page.evaluate(() => (window as unknown as W).__kinetic?.scene?.state().renderer), { timeout: 30_000 }).toBe("unsupported");
  await expect(page.locator("html")).toHaveAttribute("data-webgl", "unsupported");
  await expect(page.locator("[data-orbit-fallback]")).toBeVisible();
  expect(await page.locator("[data-orbit-fallback]").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  await expect(page.locator("#webgl-root canvas")).toHaveCount(0);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: /About/ }).click();
  await page.waitForURL("**/about");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(three).toEqual([]);
  expect(errors).toEqual([]);
  await context.close();
});

test("WebGL context loss: fallback while lost, bounded recovery, rendering resumes in the same canvas", async ({ browser }) => {
  const { context, page, errors } = await newPage(browser);
  await page.goto("/");
  await waitForScene(page, "home");
  expect(await page.evaluate(() => (window as unknown as W).__kinetic!.scene!.controller.loseContext())).toBe(true);
  await expect.poll(async () => (await scene(page)).renderer).toMatch(/lost|restoring/);
  await expect(page.locator("html")).toHaveAttribute("data-webgl", /lost|restoring/);
  expect((await scene(page)).renderMode).toBe("off");
  // The SVG orbit is the visible orbit again while WebGL is down (CSS only hides it while active).
  expect(await page.locator("[data-orbit-fallback]").evaluate((el) => getComputedStyle(el).opacity)).not.toBe("0");
  // Navigation keeps working while the context is lost.
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: /Contact/ }).click();
  await page.waitForURL("**/contact");
  await page.goBack();
  await page.waitForURL((url) => url.pathname === "/");

  await expect.poll(async () => (await scene(page)).renderer, { timeout: 20_000 }).toBe("active");
  const s = await scene(page);
  expect(s.contextLosses).toBe(1);
  expect(s.recoveries).toBe(1);
  expect(s.mountCount).toBe(1);
  const frames = (await frame(page)).renderer.frames;
  await expect.poll(async () => (await frame(page)).renderer.frames).toBeGreaterThan(frames);
  expect(errors).toEqual([]);
  await context.close();
});

test("repeated navigation does not grow GPU resources (geometries / textures return to the same level)", async ({ browser }) => {
  const { context, page } = await newPage(browser, { ...desktop, reducedMotion: "reduce" });
  await page.goto("/");
  await waitForScene(page, "home");
  const nav = page.getByRole("navigation", { name: "Main" });
  const levels: { geometries: number; textures: number }[] = [];
  for (let round = 0; round < 3; round++) {
    for (const [link, path, id] of [
      [/About/, "/about", "about"],
      [/Projects/, "/projects", "projects"],
      [/Contact/, "/contact", "contact"],
    ] as const) {
      await nav.getByRole("link", { name: link }).click();
      await page.waitForURL(`**${path}`);
      await waitForScene(page, id);
    }
    await page.getByRole("link", { name: /Farhan Zulkarnain/ }).first().click();
    await page.waitForURL((url) => url.pathname === "/");
    await waitForScene(page, "home");
    // Shared resources are released after a 2.5 s grace period.
    await page.waitForTimeout(3500);
    await page.mouse.wheel(0, 10);
    await page.mouse.wheel(0, -10);
    await page.waitForTimeout(300);
    const r = (await frame(page)).renderer;
    levels.push({ geometries: r.geometries, textures: r.textures });
  }
  expect(levels[2], JSON.stringify(levels)).toEqual(levels[1]);
  expect(levels[2].geometries).toBeLessThanOrEqual(levels[0].geometries);
  await context.close();
});

for (const device of [
  { name: "phone", viewport: { width: 390, height: 844 } },
  { name: "tablet", viewport: { width: 820, height: 1180 } },
]) {
  test(`${device.name}: the orbit renders in its own slot under the text, page-header slots stay empty, no horizontal overflow`, async ({ browser }) => {
    const { context, page } = await newPage(browser, { viewport: device.viewport, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
    await page.goto("/");
    await waitForScene(page, "home");
    const stage = (await page.locator("[data-orbit-stage]").boundingBox())!;
    const lead = (await page.getByText("I build web applications end to end").boundingBox())!;
    expect(stage.y).toBeGreaterThan(lead.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    await page.goto("/projects");
    await waitForScene(page, "projects");
    // No slot box on small screens: the scene is mounted but draws nothing over the text.
    await expect.poll(async () => ((await frame(page)) as unknown as { placement: Record<string, { visible: boolean }> }).placement.projects?.visible).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    await context.close();
  });
}
