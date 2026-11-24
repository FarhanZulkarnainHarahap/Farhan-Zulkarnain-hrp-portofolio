/** /projects/[slug] (Fase 6.4): case study rendered on the server from the fixture API. */
import { test, expect } from "@playwright/test";
import projectsFixture from "./fixtures/projects.json";
import { initialHtml, setScenario, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

const projects = projectsFixture.data;
const slug = (title: string) =>
  title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
const kasirku = projects[0];

test("initial HTML has the H1, chapters, features and the generated OG image", async ({
  request,
}) => {
  const html = await initialHtml(request, `/projects/${slug(kasirku.title)}`);
  expect(html).toContain(`${kasirku.title}</h1>`);
  for (const heading of ["Problem", "Solution", "Result", "Key features"])
    expect(html).toContain(`>${heading}</h2>`);
  expect(html).toContain(kasirku.features[0].trim());
  // Fase 9.3: generated case-study OG image (title, case type, project image).
  expect(html).toMatch(
    new RegExp(
      `property="og:image" content="[^"]*/projects/${slug(kasirku.title)}/opengraph-image`,
    ),
  );
  expect(html).toContain(
    `rel="canonical" href="https://farhanzulkarnainhrp.com/projects/${slug(kasirku.title)}"`,
  );
});

test("header, aside, features toggle and previous/next follow API order", async ({
  page,
}) => {
  await page.goto(`/projects/${slug(kasirku.title)}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    kasirku.title,
  );
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "href",
    "/projects",
  );
  await expect(
    page.getByRole("link", { name: /Visit live site/ }),
  ).toHaveAttribute("href", kasirku.demoUrl!);
  await expect(page.getByRole("link", { name: /View source/ })).toHaveAttribute(
    "href",
    kasirku.repoUrl!,
  );
  const aside = page.getByRole("complementary", { name: "Project details" });
  await expect(aside).toContainText("Stack");
  await expect(aside).toContainText("2026");
  // 94 features in the API; duplicates merged; 6 first, then all.
  const features = page
    .getByRole("region", { name: "Key features" })
    .getByRole("listitem");
  await expect(features).toHaveCount(6);
  const toggle = page.getByRole("button", { name: /^Show all \d+ features$/ });
  const total = Number((await toggle.textContent())!.match(/\d+/)![0]);
  expect(total).toBeLessThanOrEqual(kasirku.features.length);
  await toggle.click();
  await expect(features).toHaveCount(total);
  await expect(
    page.getByRole("button", { name: "Show fewer" }),
  ).toHaveAttribute("aria-expanded", "true");
  // First project: no previous, next is the second one.
  const more = page.getByRole("navigation", { name: "More projects" });
  await expect(more.getByText("Previous project")).toHaveCount(0);
  await more
    .getByRole("link", { name: new RegExp(projects[1].title.trim()) })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`/projects/${slug(projects[1].title)}$`),
  );
  await expect(
    page
      .getByRole("navigation", { name: "More projects" })
      .getByText("Previous project"),
  ).toBeVisible();
});

test("chapters without content are hidden", async ({ page }) => {
  const plain = projects[projects.length - 1]; // no problem/solution/result, no features
  await page.goto(`/projects/${slug(plain.title)}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(plain.title);
  for (const heading of ["Problem", "Solution", "Result", "Key features"])
    await expect(
      page.getByRole("heading", { level: 2, name: heading }),
    ).toHaveCount(0);
});

test("extreme data: long title, 32 tags, 94 features, broken image", async ({
  page,
  request,
}) => {
  await setScenario(request, { scenario: "extreme" });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(
    "/projects/an-extremely-long-project-title-that-keeps-going-well-past-two-lines-on-any-card-width",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Image unavailable")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Solution" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Show all 94 features" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("unknown slug renders the shared 404 inside the site frame", async ({
  page,
}) => {
  const response = await page.goto("/projects/this-project-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "This page doesn't exist.",
  );
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
});

test("sitemap lists every case study", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const project of projects)
    expect(xml).toContain(`/projects/${slug(project.title)}</loc>`);
});

test("lead image: plain framed screenshot, locked 16:10 ratio, no CLS, no device assets", async ({
  browser,
}) => {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const assets: string[] = [];
    page.on("request", (r) => {
      const path = new URL(r.url()).pathname;
      if (path.startsWith("/3d/")) assets.push(path);
    });
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(`/projects/${slug(kasirku.title)}`);
    const media = page.locator("[data-case-media]");
    await media.scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");

    const frame = media.locator("> div").first();
    const box = (await frame.boundingBox())!;
    expect(Math.abs(box.height - (box.width * 10) / 16)).toBeLessThan(1.5);
    await expect(frame).toHaveCSS("border-top-width", "1px");
    expect(Number.parseFloat(await frame.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(0);
    const shot = media.getByRole("img", { name: `${kasirku.title} screenshot` });
    await expect(shot).toBeVisible();
    await expect(shot).toHaveCSS("object-fit", "cover");

    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.01);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator("[data-device-mockup], .device-shadow, [data-device-screen]")).toHaveCount(0);
    expect(assets).toEqual([]);
    await context.close();
  }
});
