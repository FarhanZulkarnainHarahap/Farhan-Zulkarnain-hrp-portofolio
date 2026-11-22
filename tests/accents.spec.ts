/**
 * Fase 7 accents (React Bits, adapted): ShinyText, CardSpotlight, DotGrid.
 * Content stays in the server HTML; reduced motion and small/touch screens get the static version;
 * no animation frames while idle.
 */
import { test, expect } from "@playwright/test";
import projectsFixture from "./fixtures/projects.json";
import { initialHtml, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

const STATUS = "Open to full-time roles and freelance projects";

test("server HTML keeps the hero text intact and does not include the 3D/WebGL grid", async ({
  request,
}) => {
  const html = await initialHtml(request, "/");
  expect(html).toContain(STATUS);
  expect(html).toContain("Farhan Zulkarnain Harahap</h1>");
  expect(html).toContain('class="shiny-text"');
  expect(html).not.toContain("<canvas");
});

test("ShinyText sweeps once, then is plain readable text; never under reduced motion", async ({
  browser,
}) => {
  const motion = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await motion.newPage();
  await page.goto("/");
  const shiny = page.locator(".shiny-text", { hasText: STATUS });
  await expect(shiny).toHaveAttribute("data-shine", "run");
  await expect(shiny).not.toHaveAttribute("data-shine", "run", {
    timeout: 5000,
  });
  const fill = await shiny.evaluate(
    (el) => getComputedStyle(el).webkitTextFillColor,
  );
  const color = await shiny.evaluate((el) => getComputedStyle(el).color);
  expect(fill).toBe(color);
  await shiny.hover();
  await expect(shiny).toHaveAttribute("data-shine", "run");
  await motion.close();

  const still = await browser.newContext({ reducedMotion: "reduce" });
  const page2 = await still.newPage();
  await page2.goto("/");
  await page2.locator(".shiny-text").hover();
  await page2.waitForTimeout(500);
  await expect(page2.locator(".shiny-text")).not.toHaveAttribute(
    "data-shine",
    /.+/,
  );
  await still.close();
});

test("CardSpotlight shows on hover and keyboard focus without changing the click area", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("/projects");
  const card = page
    .getByRole("region", { name: "All projects" })
    .getByRole("article")
    .first();
  const layer = card.locator(".card-spotlight");
  await expect(layer).toHaveCSS("pointer-events", "none");
  await expect(layer).toHaveCSS("opacity", "0");
  await card.hover({ position: { x: 40, y: 40 } });
  await expect(layer).toHaveCSS("opacity", "1");
  expect(
    await layer.evaluate((el) => el.style.getPropertyValue("--spot-x")),
  ).toMatch(/px$/);
  // Keyboard focus: spotlight centred, focus ring on the card stays visible.
  await page.mouse.move(0, 0);
  await card.getByRole("link", { name: projectsFixture.data[0].title }).focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(layer).toHaveCSS("opacity", "1");
  await expect(card).toHaveCSS("outline-style", "solid");
  // Clicking anywhere on the card (over the spotlight) still opens the case study.
  await card.click({ position: { x: 60, y: 60 } });
  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
  await context.close();
});

test("DotGrid loads only on capable desktops, idles without animation frames, and follows the theme", async ({
  browser,
}) => {
  const scriptsOf = async (
    options: Parameters<typeof browser.newContext>[0],
  ) => {
    const context = await browser.newContext(options);
    const p = await context.newPage();
    const urls = new Set<string>();
    p.on("request", (r) => {
      if (r.resourceType() === "script") urls.add(new URL(r.url()).pathname);
    });
    await p.goto("/", { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    const canvases = await p.locator("canvas").count();
    await context.close();
    return { urls, canvases };
  };
  const reduced = await scriptsOf({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 900 },
  });
  const mobile = await scriptsOf({
    reducedMotion: "no-preference",
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const live = await scriptsOf({
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  });
  expect(reduced.canvases).toBe(0);
  expect(mobile.canvases).toBe(0);
  expect(live.canvases).toBe(1);
  // The DotGrid chunk(s): loaded on the capable desktop only.
  const gridChunks = [...live.urls].filter((url) => !reduced.urls.has(url));
  expect(gridChunks.length).toBeGreaterThan(0);
  for (const url of gridChunks) expect(mobile.urls.has(url), url).toBe(false);

  const desktop = await browser.newContext({
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  });
  const page = await desktop.newPage();
  await page.addInitScript(() => {
    const original = window.requestAnimationFrame.bind(window);
    (window as unknown as { __raf: number }).__raf = 0;
    window.requestAnimationFrame = (cb) => {
      (window as unknown as { __raf: number }).__raf += 1;
      return original(cb);
    };
  });
  await page.goto("/");
  const grid = page.locator("[data-live]");
  await expect(grid).toHaveAttribute("data-live", "true");
  await expect(grid.locator("canvas")).toHaveCount(1);
  // Idle: after settling, no frames are requested.
  await page.mouse.move(5, 5);
  await page.waitForTimeout(1500);
  const before = await page.evaluate(
    () => (window as unknown as { __raf: number }).__raf,
  );
  await page.waitForTimeout(1000);
  const after = await page.evaluate(
    () => (window as unknown as { __raf: number }).__raf,
  );
  expect(after - before).toBeLessThanOrEqual(2);
  // Interaction wakes it.
  const box = (await grid.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 5,
  });
  await page.waitForTimeout(200);
  expect(
    await page.evaluate(() => (window as unknown as { __raf: number }).__raf),
  ).toBeGreaterThan(after);
  // Theme switch without reload keeps the grid and swaps its token colors.
  await page.mouse.move(5, 5);
  await page.waitForTimeout(1200);
  const slot = grid.locator("..");
  const first = await slot.screenshot();
  await page
    .getByRole("banner")
    .getByRole("button", { name: /Switch to (dark|light) theme/ })
    .click();
  await page.waitForTimeout(600);
  await expect(grid.locator("canvas")).toHaveCount(1);
  expect((await slot.screenshot()).equals(first)).toBe(false);
  await desktop.close();
});
