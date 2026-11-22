/** /projects (Fase 6.3): all projects rendered on the server; filters synced to the URL. */
import { test, expect } from "@playwright/test";
import projectsFixture from "./fixtures/projects.json";
import { initialHtml, setScenario, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

const total = projectsFixture.data.length;

test("initial HTML has the H1, the count and every project title", async ({
  request,
}) => {
  const html = await initialHtml(request, "/projects");
  expect(html).toContain("Projects</h1>");
  expect(html).toContain(`${total} projects`);
  for (const project of projectsFixture.data)
    expect(html).toContain(project.title.trim());
  expect(html).not.toContain("legacy-root");
});

test("filters by type, stack and title, sync to the URL and announce results", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
  const status = page.getByRole("status");
  await expect(status).toHaveText(`Showing ${total} of ${total} projects`);
  const cards = page
    .getByRole("region", { name: "All projects" })
    .getByRole("article");
  await expect(cards).toHaveCount(total);

  await page.getByLabel("Search by title").fill("kasir");
  await expect(page).toHaveURL(/\?q=kasir$/);
  await expect(status).toHaveText(`Showing 1 of ${total} projects`);
  await expect(cards).toHaveCount(1);

  await page.getByLabel("Search by title").fill("");
  await page.getByLabel("Stack", { exact: true }).selectOption("Next.js");
  await expect(page).toHaveURL(/stack=Next\.js/);
  const withNext = projectsFixture.data.filter((p) =>
    p.tags.some((t) => /^next(\.js)?$/i.test(t.trim())),
  ).length;
  await expect(cards).toHaveCount(withNext);

  const firstType = (await page
    .getByLabel("Type")
    .locator("option")
    .nth(1)
    .textContent())!;
  await page.getByLabel("Type", { exact: true }).selectOption(firstType);
  await expect(page).toHaveURL(/type=/);

  await page.getByLabel("Search by title").fill("zzzz-nothing");
  await expect(
    page.getByRole("heading", { name: "No projects match these filters." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(cards).toHaveCount(total);
});

test("filters in the URL are applied on load (shareable links)", async ({
  page,
}) => {
  await page.goto("/projects?q=kasir");
  await expect(page.getByLabel("Search by title")).toHaveValue("kasir");
  await expect(
    page.getByRole("region", { name: "All projects" }).getByRole("article"),
  ).toHaveCount(1);
});

test("cards lead to case studies; extreme data does not break the grid", async ({
  page,
  request,
}) => {
  await setScenario(request, { scenario: "extreme" });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/projects");
    await expect(
      page.getByRole("button", { name: "28 more technologies" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("link", { name: projectsFixture.data[0].title }).click();
  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
});

test("empty and failed reads", async ({ page, request }) => {
  await setScenario(request, { scenario: "empty" });
  await page.goto("/projects");
  await expect(
    page.getByRole("heading", { name: "Projects will appear here soon." }),
  ).toBeVisible();
  await setScenario(request, { scenario: "fail" });
  await page.goto("/projects");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Projects couldn't be loaded.",
  );
  await setScenario(request, { scenario: "normal" });
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("status")).toHaveText(
    `Showing ${total} of ${total} projects`,
  );
  await page.getByRole("link", { name: "Get in touch" }).last().click();
  await expect(page).toHaveURL(/\/contact$/);
});
