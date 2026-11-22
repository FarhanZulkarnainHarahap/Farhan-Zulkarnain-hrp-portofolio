/**
 * Home page (Fase 5): hero + CTAs, proof line from API data, selected work cards to case studies,
 * Journey hidden when experiences are empty, and ErrorState + retry when the API fails.
 * All /api/* reads are answered from fixtures.
 */
import { test, expect, type BrowserContext } from "@playwright/test";
import projectsFixture from "./fixtures/projects.json";
import skillsFixture from "./fixtures/skills.json";
import documentsFixture from "./fixtures/documents.json";

type Options = {
  experiences?: unknown[];
  fail?: string[];
  projects?: unknown[];
};

async function mockApi(context: BrowserContext, options: Options = {}) {
  const state = { fail: new Set(options.fail ?? []) };
  const data: Record<string, unknown[]> = {
    portofolios: options.projects ?? projectsFixture.data,
    skills: skillsFixture.data,
    documents: documentsFixture.data,
    experiences: options.experiences ?? [],
  };
  await context.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const resource = url.pathname
      .replace("/api/public/", "")
      .replace("/api/", "")
      .split("/")[0];
    if (state.fail.has(resource))
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Unavailable" }),
      });
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: data[resource] ?? [] }),
    });
  });
  return state;
}

const experience = (
  id: string,
  title: string,
  startDate: string,
  current = false,
) => ({
  id,
  title,
  company: `${title} Co`,
  location: "Medan",
  startDate,
  endDate: current ? null : "2024-06-01T00:00:00.000Z",
  current,
  description: "Fixture",
  technologies: ["Next.js", "Postgresql"],
  sortOrder: 0,
});

test("hero shows who, what, proof from the API, and both CTAs", async ({
  page,
  context,
}) => {
  await mockApi(context);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Farhan Zulkarnain Harahap",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(
    page.getByText("Full-stack engineer · Medan, Indonesia"),
  ).toBeVisible();
  await expect(
    page.getByText("Open to full-time roles and freelance projects"),
  ).toBeVisible();
  const proof = page.getByTestId("hero-proof");
  await expect(proof).toContainText(`${projectsFixture.data.length} projects`);
  await expect(proof).toContainText("technologies");
  // No legacy home content or 3D on the new home page.
  await expect(page.locator(".legacy-root")).toHaveCount(0);
  await expect(page.locator("[data-fzh-asset]")).toHaveCount(0);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("link", { name: "View projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.goto("/");
  await page
    .getByRole("main")
    .getByRole("link", { name: "Get in touch" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("proof line is hidden when the API has no data", async ({
  page,
  context,
}) => {
  await mockApi(context, { fail: ["portofolios", "skills"] });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await expect(page.getByTestId("hero-proof")).toHaveCount(0);
});

test("selected work cards lead to case studies and survive extreme data", async ({
  page,
  context,
}) => {
  const base = projectsFixture.data[0];
  const extreme = {
    ...base,
    id: "extreme",
    title:
      "An extremely long project title that keeps going well past two lines on any card width",
    description: "Lorem ipsum ".repeat(80),
    imageUrl: "https://res.cloudinary.com/demo/image/upload/does-not-exist.jpg",
    caseType: "Web App, Dashboard, Web App",
    tags: Array.from({ length: 32 }, (_, i) => `Tag ${i + 1}`),
    features: Array.from({ length: 94 }, (_, i) => `Feature ${i + 1}`),
    caseProblem: "Problem",
  };
  await mockApi(context, { projects: [extreme, ...projectsFixture.data] });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const section = page.getByRole("region", {
      name: "Projects with the full story.",
    });
    const cards = section.getByRole("article");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(3);
    expect(await cards.count()).toBeLessThanOrEqual(6);
    const card = cards.first();
    // Case type split by comma and de-duplicated; 4 tags + "+28"; features never on cards.
    await expect(card.getByText("Dashboard", { exact: true })).toBeVisible();
    await expect(card.getByText("Web App", { exact: true })).toHaveCount(1);
    await expect(
      card.getByRole("listitem").filter({ hasText: /^Tag \d+$/ }),
    ).toHaveCount(4);
    const more = card.getByRole("button", { name: "28 more technologies" });
    await expect(more).toBeVisible();
    await expect(card).not.toContainText("Feature 1");
    await expect(card.getByText("Image unavailable")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    // The "+N" toggle reveals all tags without navigating.
    await more.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      card.getByRole("listitem").filter({ hasText: /^Tag \d+$/ }),
    ).toHaveCount(32);
  }
  await page
    .getByRole("region", { name: "Projects with the full story." })
    .getByRole("link", { name: projectsFixture.data[0].title })
    .click();
  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
});

test("journey preview is hidden without experiences and shows the 3 latest otherwise", async ({
  page,
  context,
  browser,
}) => {
  await mockApi(context, { experiences: [] });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Three habits behind every project." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Where I've worked and learned." }),
  ).toHaveCount(0);

  const other = await browser.newContext();
  await mockApi(other, {
    experiences: [
      experience("a", "Oldest Role", "2019-01-01T00:00:00.000Z"),
      experience("b", "Middle Role", "2021-01-01T00:00:00.000Z"),
      experience("c", "Current Role", "2023-01-01T00:00:00.000Z", true),
      experience("d", "Recent Role", "2022-01-01T00:00:00.000Z"),
    ],
  });
  const page2 = await other.newPage();
  await page2.goto("/");
  const journey = page2.getByRole("region", {
    name: "Where I've worked and learned.",
  });
  await expect(journey.getByRole("listitem")).toHaveCount(3);
  await expect(journey.getByRole("heading", { level: 3 }).first()).toHaveText(
    "Current Role",
  );
  await expect(journey).toContainText("Present");
  await expect(journey).not.toContainText("Oldest Role");
  await expect(journey).toContainText("PostgreSQL");
  await other.close();
});

test("sections show ErrorState and recover with retry", async ({
  page,
  context,
}) => {
  const state = await mockApi(context, { fail: ["portofolios", "skills"] });
  await page.goto("/");
  const work = page.getByRole("region", {
    name: "Projects with the full story.",
  });
  await expect(work.getByRole("alert")).toContainText(
    "Projects couldn't be loaded.",
  );
  const stack = page.getByRole("region", {
    name: "Tools I work with every day.",
  });
  await expect(stack.getByRole("alert")).toBeVisible();
  state.fail.clear();
  await work.getByRole("button", { name: "Try again" }).click();
  await expect(work.getByRole("article").first()).toBeVisible();
  await stack.getByRole("button", { name: "Try again" }).click();
  await expect(stack.getByText("PostgreSQL")).toBeVisible();
});

test("stack groups API skills by category with display names", async ({
  page,
  context,
}) => {
  await mockApi(context);
  await page.goto("/");
  const stack = page.getByRole("region", {
    name: "Tools I work with every day.",
  });
  for (const label of ["Frontend", "Backend", "Tools", "Other"])
    await expect(
      stack.getByRole("heading", { level: 3, name: new RegExp(`^${label}`) }),
    ).toBeVisible();
  await expect(stack.getByText("VS Code")).toBeVisible();
  await expect(stack.getByText("Tailwind CSS")).toBeVisible();
  await expect(
    stack.getByRole("link", { name: "Full stack on About" }),
  ).toHaveAttribute("href", "/about#stack");
});

test("contact band copies the email address", async ({ browser }) => {
  const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
  });
  await mockApi(context);
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: /copy email address/ }).click();
  await expect(page.getByText("Email address copied.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "@",
  );
  await context.close();
});
