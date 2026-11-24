/** Fase 8 motion: visible without JS, no tweens under reduced motion, Flip filters, no leaks. */
import { test, expect, type Page } from "@playwright/test";
import projectsFixture from "./fixtures/projects.json";
import { withFixtureApi } from "./helpers/fixture";

withFixtureApi();

const TARGETS =
  '[data-intro], [data-reveal]:not([data-reveal="group"]), [data-reveal="group"] > *';
const opacities = (page: Page) =>
  page
    .locator(TARGETS)
    .evaluateAll((els) =>
      els.map((el) => Number(getComputedStyle(el).opacity)),
    );
const pending = (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as { __motion?: { pending: () => number } }
      ).__motion?.pending() ?? -1,
  );

test("without JavaScript every animated element is visible", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  for (const path of ["/", "/about", "/journey", "/projects/kasirku"]) {
    await page.goto(path);
    await expect(page.locator("html")).not.toHaveClass(/js-motion/);
    const values = await opacities(page);
    expect(values.length, path).toBeGreaterThan(0);
    expect(
      values.every((v) => v === 1),
      path,
    ).toBe(true);
  }
  await context.close();
});

test("reduced motion: no pre-hiding, no tweens, no observers", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/js-motion/);
  await expect(page.locator("html")).toHaveClass(/motion-ready/);
  expect((await opacities(page)).every((v) => v === 1)).toBe(true);
  const transforms = await page
    .locator(TARGETS)
    .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform));
  expect(transforms.every((t) => !t)).toBe(true);
  expect(await pending(page)).toBe(0);
  await context.close();
});

test("motion: hero intro settles, sections reveal once on scroll, H1 is never animated", async ({
  browser,
}) => {
  const context = await browser.newContext({
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/js-motion/);
  const h1 = page.getByRole("heading", { level: 1 });
  expect(
    await h1.evaluate(
      (el) => el.hasAttribute("data-intro") || el.style.opacity !== "",
    ),
  ).toBe(false);
  const intro = page.locator("[data-intro]");
  await expect
    .poll(() =>
      intro.evaluateAll((els) =>
        els.every((el) => getComputedStyle(el).opacity === "1"),
      ),
    )
    .toBe(true);
  // A section far below the fold stays hidden until it is scrolled into view.
  const habits = page
    .getByRole("region", { name: "Three habits behind every project." })
    .locator('[data-reveal="group"] > *')
    .first();
  expect(
    Number(await habits.evaluate((el) => getComputedStyle(el).opacity)),
  ).toBe(0);
  await habits.scrollIntoViewIfNeeded();
  await expect
    .poll(() => habits.evaluate((el) => getComputedStyle(el).opacity))
    .toBe("1");
  expect(await pending(page)).toBeGreaterThan(0);
  await context.close();
});

test("page entrance on /about, /journey, /projects, /contact: accent line draws, actions and visual rise, H1 and lead untouched", async ({
  browser,
}) => {
  const context = await browser.newContext({
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    // Record the accent line's transform on every frame until it settles (proves it drew).
    const w = window as unknown as { __scales: number[] };
    w.__scales = [];
    const tick = () => {
      const line = document.querySelector<HTMLElement>("header [data-intro-line]");
      if (line) w.__scales.push(new DOMMatrix(getComputedStyle(line).transform).a);
      if (w.__scales.length < 120) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  for (const path of ["/about", "/journey", "/projects", "/contact"]) {
    await page.goto(path);
    const header = page.locator("main header").first();
    const h1 = header.getByRole("heading", { level: 1 });
    expect(await h1.evaluate((el) => el.hasAttribute("data-intro") || el.style.opacity !== ""), path).toBe(false);
    // The lead is the LCP element on phones (Fase 12.8): never hidden by the entrance.
    await expect(header.locator('[data-intro="lead"]'), path).toHaveCount(0);
    await expect(header.locator("p.max-w-reading").first(), path).toHaveCSS("opacity", "1");
    await expect
      .poll(() => header.locator("[data-intro]").evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === "1")), {
        message: path,
      })
      .toBe(true);
    const scales = await page.evaluate(() => (window as unknown as { __scales: number[] }).__scales);
    expect(Math.min(...scales), path).toBeLessThan(0.5);
    await expect
      .poll(() => header.locator("[data-intro-line]").evaluate((el) => getComputedStyle(el).transform), { message: path })
      .toBe("none");
  }
  await context.close();
});

test("filters stay correct with Flip and leave no transforms behind", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("/projects");
  const cards = page
    .getByRole("region", { name: "All projects" })
    .locator("[data-flip-id]");
  await expect(cards).toHaveCount(projectsFixture.data.length);
  await page
    .getByLabel("Search by title")
    .pressSequentially("kas", { delay: 40 });
  await expect(cards).toHaveCount(1);
  await page.getByLabel("Search by title").fill("");
  await expect(cards).toHaveCount(projectsFixture.data.length);
  await page.waitForTimeout(800);
  const leftovers = await cards.evaluateAll((els) =>
    els
      .map((el) => getComputedStyle(el).transform)
      .filter((t) => t !== "none" && !/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(t)),
  );
  expect(leftovers).toEqual([]);
  expect(
    await cards.evaluateAll((els) =>
      els.every((el) => getComputedStyle(el).opacity === "1"),
    ),
  ).toBe(true);
  await context.close();
});

test("reveal observers are cleaned up when navigating between pages", async ({
  browser,
}) => {
  const context = await browser.newContext({
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("/about");
  await expect.poll(() => pending(page)).toBeGreaterThan(0);
  const onAbout = await pending(page);
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const [name, path] of [
    ["Journey", "/journey"],
    ["Projects", "/projects"],
    ["Contact", "/contact"],
    ["About", "/about"],
  ] as const) {
    await nav.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    // Read both numbers in the same frame: pending reveals never exceed this page's reveal targets.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const reveals = document.querySelectorAll(
            "#main-content [data-reveal]",
          ).length;
          const live =
            (
              window as unknown as { __motion?: { pending: () => number } }
            ).__motion?.pending() ?? -1;
          return live >= 0 && live <= reveals;
        }),
      )
      .toBe(true);
  }
  expect(await pending(page)).toBe(onAbout);
  await context.close();
});

test("lazy loading (Fase 12.1): no GSAP under reduced motion, palette only on first ⌘K", async ({
  browser,
}) => {
  const reduced = await browser.newContext({ reducedMotion: "reduce" });
  const r = await reduced.newPage();
  await r.goto("/");
  await expect(r.locator("html")).toHaveClass(/motion-ready/);
  await r.waitForTimeout(800);
  expect(await r.evaluate(() => (window as unknown as { __motion?: { loaded: () => boolean } }).__motion?.loaded())).toBe(false);
  await reduced.close();

  const context = await browser.newContext({
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("/");
  // GSAP arrives after hydration (dynamic import) and runs the intro.
  await expect.poll(() => page.evaluate(() => (window as unknown as { __motion?: { loaded: () => boolean } }).__motion?.loaded())).toBe(true);
  const dialog = page.locator('dialog[aria-label="Search and navigate"]');
  await expect(dialog).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+k");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await context.close();
});
