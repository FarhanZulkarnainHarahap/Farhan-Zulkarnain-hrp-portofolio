/**
 * Fase 7 accents (React Bits, adapted): ShinyText, CardSpotlight. (The hero visual is the Fz card
 * entrance since Fase 10.5; see tests/entrance.spec.ts.)
 * Content stays in the server HTML; reduced motion and small/touch screens get the static version;
 * no animation frames while idle.
 */
import { test, expect } from "@playwright/test";
import projectsFixture from "./fixtures/projects.json";
import { initialHtml, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

const STATUS = "Open to full-time roles and freelance projects";

test("server HTML keeps the hero text intact and does not include a WebGL canvas", async ({
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
