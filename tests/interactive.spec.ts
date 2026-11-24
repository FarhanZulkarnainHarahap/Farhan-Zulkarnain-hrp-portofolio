/**
 * Fase 12.5 (X1): interactive Blender assets — the Fz card (About + footer) and the hero idle/tilt.
 * Keyboard flip with real contact links, reduced motion, touch, loop pausing, LCP/CLS, lazy loading.
 */
import { test, expect, type Page } from "@playwright/test";
import { withFixtureApi } from "./helpers/fixture";
import { profile } from "../src/lib/site";

withFixtureApi();

const desktop = { viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" as const };
/** The card's code loads when its slot comes near (LazyFzCard): scroll to the slot first, like a visitor. */
async function aboutCard(page: Page) {
  await page.locator('[data-fz-card-slot="about"]').scrollIntoViewIfNeeded();
  const card = page.locator('[data-fz-card="about"]');
  await card.waitFor();
  return card;
}
const track = (page: Page) => {
  const urls: string[] = [];
  page.on("request", (r) => {
    const path = new URL(r.url()).pathname;
    if (/^\/3d\/(card|entrance)\//.test(path)) urls.push(path);
  });
  return urls;
};

test("About card: Enter flips it, the contact links are real, clickable and selectable; Space flips back", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await page.goto("/about");
  const card = await aboutCard(page);
  const button = card.getByRole("button", { name: "Flip the Fz card to show contact details" });
  await button.focus();
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Enter");
  await expect(card.getByRole("button", { name: "Show the front of the Fz card" })).toHaveAttribute("aria-pressed", "true", { timeout: 5_000 });
  const contact = card.getByRole("group", { name: "Contact details" });
  await expect(contact).toBeVisible();
  // "user<wbr>@domain": the break opportunity adds no character, so selecting copies the exact address.
  const email = contact.getByRole("link", { name: /farhanzulkarnaenhrp.*@gmail\.com/ });
  await expect(email).toHaveAttribute("href", `mailto:${profile.email}`);
  expect(await email.evaluate((el) => el.textContent)).toBe(profile.email);
  await expect(contact.getByRole("link", { name: "FarhanZulkarnainHarahap" })).toHaveAttribute("href", profile.github);
  await expect(contact.getByRole("link", { name: "farhan-zulkarnain" })).toHaveAttribute("href", profile.linkedin);
  // Selectable (copyable) text, and the link takes the click (not the card behind it).
  expect(await email.evaluate((el) => getComputedStyle(el).userSelect)).not.toBe("none");
  const box = (await email.boundingBox())!;
  expect(await page.evaluate(([x, y]) => (document.elementFromPoint(x, y) as HTMLElement | null)?.closest("a")?.getAttribute("href"), [box.x + box.width / 2, box.y + box.height / 2])).toBe(`mailto:${profile.email}`);
  await page.getByRole("button", { name: "Show the front of the Fz card" }).focus();
  await page.keyboard.press("Space");
  await expect(card.getByRole("button", { name: "Flip the Fz card to show contact details" })).toHaveAttribute("aria-pressed", "false", { timeout: 5_000 });
  await expect(contact).toBeHidden();
  await context.close();
});

test("reduced motion: no loops or frames are fetched, the flip is an instant swap", async ({ browser }) => {
  const context = await browser.newContext({ ...desktop, reducedMotion: "reduce" });
  const page = await context.newPage();
  const urls = track(page);
  await page.goto("/about");
  const card = await aboutCard(page);
  await page.waitForTimeout(1000);
  await card.getByRole("button").click();
  await expect(card).toHaveAttribute("data-layer", "back");
  await expect(card.getByRole("group", { name: "Contact details" })).toBeVisible();
  await page.goto("/");
  await page.waitForTimeout(1500);
  expect(urls.filter((u) => /\.mp4$|\/tilt-|\/flip-/.test(u))).toEqual([]);
  await context.close();
});

test("touch: no tilt on hover, a tap flips the card", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const urls = track(page);
  await page.goto("/about");
  const card = await aboutCard(page);
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.move(box.x + box.width - 10, box.y + box.height - 10);
  await page.waitForTimeout(500);
  expect(urls.filter((u) => u.includes("/tilt-"))).toEqual([]);
  await card.getByRole("button").tap();
  await expect(card.getByRole("button")).toHaveAttribute("aria-pressed", "true", { timeout: 5_000 });
  await context.close();
});

test("idle loop plays only on screen and with the tab visible", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  await page.goto("/about");
  const card = await aboutCard(page);
  const video = card.locator("video");
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused), { timeout: 10_000 }).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await context.close();
});

test("cards never take the LCP or shift layout; the footer card loads only near the footer", async ({ browser }) => {
  for (const options of [desktop, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" as const }]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const urls = track(page);
    await page.addInitScript(() => {
      const w = window as unknown as { __lcp: string[]; __cls: number };
      w.__lcp = [];
      w.__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as (PerformanceEntry & { element?: Element })[]) w.__lcp.push(e.element?.closest("[data-fz-card]") ? "card" : e.element?.tagName ?? "?");
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) w.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/about");
    await page.waitForTimeout(1500);
    const { lcp, cls } = await page.evaluate(() => {
      const w = window as unknown as { __lcp: string[]; __cls: number };
      return { lcp: w.__lcp.at(-1), cls: w.__cls };
    });
    expect(lcp).not.toBe("card");
    expect(cls).toBeLessThan(0.01);
    expect(urls.filter((u) => u.startsWith("/3d/card/footer"))).toEqual([]);
    await page.locator('[data-fz-card-slot="footer"]').scrollIntoViewIfNeeded();
    await expect.poll(() => urls.some((u) => u.startsWith("/3d/card/footer")), { timeout: 10_000 }).toBe(true);
    await context.close();
  }
});

test("hero: idle loop after the entrance, hover tilts, leaving returns to the loop", async ({ browser }) => {
  const context = await browser.newContext(desktop);
  const page = await context.newPage();
  const urls = track(page);
  await page.goto("/");
  const hero = page.locator("[data-hero-entrance]");
  await expect(hero).toHaveAttribute("data-state", "idle", { timeout: 20_000 });
  const box = (await hero.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2, { steps: 8 });
  await expect(hero).toHaveAttribute("data-state", "tilt");
  await expect.poll(() => urls.filter((u) => u.includes("/tilt-")).length).toBeGreaterThan(0);
  await page.mouse.move(10, box.y + box.height + 200);
  await expect(hero).toHaveAttribute("data-state", "idle", { timeout: 5_000 });
  await context.close();
});
