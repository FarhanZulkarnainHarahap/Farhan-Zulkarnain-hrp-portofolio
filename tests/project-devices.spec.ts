import {
  test,
  expect,
  type BrowserContext,
  type Locator,
} from "@playwright/test";
import projects from "./fixtures/projects.json";
import skills from "./fixtures/skills.json";
async function fixture(context: BrowserContext) {
  await context.route("**/api/**", (r) =>
    r.fulfill({
      json: {
        success: true,
        data: r.request().url().includes("portofolios")
          ? projects.data
          : r.request().url().includes("skills")
            ? skills.data
            : [],
      },
    }),
  );
  await context.route("**/image/upload/f_webp,**", (r) =>
    r.fulfill({
      path: "tests/fixtures/project-device-preview.webp",
      contentType: "image/webp",
      headers: { "access-control-allow-origin": "*" },
    }),
  );
}
async function quality(canvas: Locator, width: number) {
  const r = await canvas.evaluate((el) => {
    const c = el as HTMLCanvasElement,
      b = c.getBoundingClientRect();
    return {
      ratio: c.width / b.width,
      pixels: c.width * c.height,
      aa: c.getContext("webgl2")?.getContextAttributes()?.antialias,
      transform: getComputedStyle(c).transform,
    };
  });
  expect(r.ratio).toBeGreaterThanOrEqual(1.49);
  expect(r.ratio).toBeLessThanOrEqual(width < 768 ? 1.76 : 2.01);
  expect(r.pixels).toBeLessThanOrEqual(2_801_000);
  expect(r.aa).toBe(true);
  expect(r.transform).toBe("none");
}
for (const [width, height] of [
  [360, 800],
  [375, 812],
  [390, 844],
  [412, 915],
  [430, 932],
  [768, 1024],
  [820, 1180],
  [1024, 768],
  [1024, 1366],
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [2560, 1440],
  [2560, 1600],
  [3840, 2160],
])
  test.describe(`artifact ${width}x${height}`, () => {
    test.use({ viewport: { width, height }, deviceScaleFactor: 2 });
    test("responsive project keeps artifact design and readable navigation @legacy3d", async ({
      page,
      context,
    }, info) => {
      await fixture(context);
      await page.goto("/projects");
      const stage = page.locator(".vault-canvas");
      await stage.scrollIntoViewIfNeeded();
      await expect(stage).toHaveAttribute("data-ready", "true");
      await expect(page.locator("[data-screenshot=ready]")).toHaveCount(
        width < 1024 ? 1 : 3,
      );
      await quality(stage.locator("canvas"), width);
      await expect(
        page.getByRole("group", { name: "Project device" }),
      ).toHaveCount(0);
      await expect(
        page.locator(".project-stage .project-description"),
      ).toHaveCount(0);
      expect(
        await page.locator(".project-list button").evaluateAll((buttons) =>
          buttons.every((b) => {
            const label = b.querySelector("span:nth-child(2)")!,
              r = b.getBoundingClientRect(),
              l = label.getBoundingClientRect();
            return l.top >= r.top && l.bottom <= r.bottom;
          }),
        ),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({ path: info.outputPath("artifact.png") });
    });
  });
