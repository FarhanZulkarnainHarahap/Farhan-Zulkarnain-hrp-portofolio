/**
 * Home page (Fase 5/5.1). Data is rendered on the server from the fixture API
 * (tests/fixture-api.mjs via API_URL); scenarios are switched per test. Browser retries go
 * through /api/public/* → Next server → the same fixture API. A guard fails the test if the
 * browser ever contacts the production API.
 */
import { test, expect } from "@playwright/test";
import { withFixtureApi, setScenario } from "./helpers/fixture";
import projectsFixture from "./fixtures/projects.json";
import experiencesFixture from "./fixtures/experiences.json";

withFixtureApi();

const workSection = "Projects with the full story.";
const stackSection = "Tools I work with every day.";
const journeySection = "Where I've worked and learned.";

test("initial HTML (no JavaScript) contains the H1, featured project titles and skill names", async ({
  request,
}) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("Farhan Zulkarnain Harahap</h1>");
  for (const project of projectsFixture.data
    .filter((p) => p.caseProblem || p.caseSolution || p.caseResult)
    .slice(0, 6))
    expect(html).toContain(project.title.trim());
  for (const name of ["PostgreSQL", "VS Code", "Tailwind CSS", "Next.js"])
    expect(html).toContain(name);
  expect(html).toContain("Full-Stack Developer");
});

test("hero shows who, what, proof from the API, and both CTAs", async ({
  page,
}) => {
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

test("proof line is hidden when projects and skills are unavailable", async ({
  page,
  request,
}) => {
  await setScenario(request, {
    scenario: "normal",
    fail: ["portofolios", "skills"],
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("hero-proof")).toHaveCount(0);
});

test("selected work cards lead to case studies and survive extreme data", async ({
  page,
  request,
}) => {
  await setScenario(request, { scenario: "extreme" });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const cards = page
      .getByRole("region", { name: workSection })
      .getByRole("article");
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
    // Card images are lazy: below the fly-through they load (and fail) only once scrolled near.
    await card.scrollIntoViewIfNeeded();
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
    .getByRole("region", { name: workSection })
    .getByRole("link", { name: projectsFixture.data[0].title })
    .click();
  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
});

test("journey preview is hidden without experiences and shows the 3 latest otherwise", async ({
  page,
  request,
}) => {
  await setScenario(request, { scenario: "normal", empty: ["experiences"] });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Three habits behind every project." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: journeySection })).toHaveCount(
    0,
  );

  await setScenario(request, { scenario: "normal" });
  await page.goto("/");
  const journey = page.getByRole("region", { name: journeySection });
  await expect(journey.getByRole("listitem")).toHaveCount(3);
  const current = experiencesFixture.data.find((item) => item.current)!;
  await expect(journey.getByRole("heading", { level: 3 }).first()).toHaveText(
    current.title,
  );
  await expect(journey).toContainText("Present");
  await expect(journey).not.toContainText("Oldest Role");
  await expect(journey).toContainText("PostgreSQL");
});

test("a failed collection shows ErrorState in its own section and recovers with retry", async ({
  page,
  request,
}) => {
  await setScenario(request, {
    scenario: "normal",
    fail: ["portofolios", "skills"],
  });
  await page.goto("/");
  const work = page.getByRole("region", { name: workSection });
  const stack = page.getByRole("region", { name: stackSection });
  await expect(work.getByRole("alert")).toContainText(
    "Projects couldn't be loaded.",
  );
  await expect(stack.getByRole("alert")).toBeVisible();
  // Other sections and the page itself are unaffected.
  await expect(
    page.getByRole("region", { name: journeySection }).getByRole("listitem"),
  ).toHaveCount(3);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Retry goes through useCollection in the browser (/api/public → fixture API).
  await setScenario(request, { scenario: "normal" });
  await work.getByRole("button", { name: "Try again" }).click();
  await expect(work.getByRole("article").first()).toBeVisible();
  await stack.getByRole("button", { name: "Try again" }).click();
  await expect(stack.getByText("PostgreSQL")).toBeVisible();
});

test("retry that fails again keeps the error state with another retry", async ({
  page,
  request,
}) => {
  await setScenario(request, { scenario: "normal", fail: ["portofolios"] });
  await page.goto("/");
  const work = page.getByRole("region", { name: workSection });
  await work.getByRole("button", { name: "Try again" }).click();
  await expect(work.getByRole("alert")).toBeVisible();
  await expect(work.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("empty collections show calm empty states", async ({ page, request }) => {
  await setScenario(request, { scenario: "empty" });
  await page.goto("/");
  await expect(page.getByRole("region", { name: workSection })).toContainText(
    "Projects will appear here soon.",
  );
  await expect(page.getByRole("region", { name: stackSection })).toContainText(
    "The stack will be listed here soon.",
  );
  await expect(page.getByRole("heading", { name: journeySection })).toHaveCount(
    0,
  );
  await expect(page.getByTestId("hero-proof")).toHaveCount(0);
});

test("stack groups API skills by category with display names", async ({
  page,
}) => {
  await page.goto("/");
  const stack = page.getByRole("region", { name: stackSection });
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
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: /copy email address/ }).click();
  await expect(page.getByText("Email address copied.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "@",
  );
  await context.close();
});
