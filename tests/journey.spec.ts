/** /journey (Fase 6.2): full timeline from the fixture API; no hardcoded milestones. */
import { test, expect } from "@playwright/test";
import experiencesFixture from "./fixtures/experiences.json";
import { initialHtml, setScenario, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

test("initial HTML has the H1 and every experience entry", async ({
  request,
}) => {
  const html = await initialHtml(request, "/journey");
  expect(html).toContain("Experience &amp; learning</h1>");
  for (const item of experiencesFixture.data)
    expect(html).toContain(item.title);
  expect(html).not.toContain("legacy-root");
});

test("timeline lists entries newest first with Present and stack", async ({
  page,
}) => {
  await page.goto("/journey");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Experience & learning",
  );
  const entries = page
    .getByRole("region", { name: "Timeline" })
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { level: 2 }) });
  await expect(entries).toHaveCount(experiencesFixture.data.length);
  const current = experiencesFixture.data.find((item) => item.current)!;
  await expect(entries.first().getByRole("heading", { level: 2 })).toHaveText(
    current.title,
  );
  await expect(entries.first()).toContainText("Present");
  await expect(entries.first()).toContainText("PostgreSQL");
  await expect(entries.last().getByRole("heading", { level: 2 })).toHaveText(
    "Oldest Role",
  );
  // No legacy milestones.
  await expect(page.getByText("Purwadhika")).toHaveCount(0);
  await page.getByRole("link", { name: "See the projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
});

test("empty experiences show the empty state with a link to projects", async ({
  page,
  request,
}) => {
  await setScenario(request, { scenario: "normal", empty: ["experiences"] });
  await page.goto("/journey");
  await expect(
    page.getByRole("heading", { name: "Experience entries are on their way." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Browse projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
});

test("failed read shows ErrorState and recovers with retry", async ({
  page,
  request,
}) => {
  await setScenario(request, { scenario: "normal", fail: ["experiences"] });
  await page.goto("/journey");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Experience couldn't be loaded.",
  );
  await setScenario(request, { scenario: "normal" });
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Oldest Role" }),
  ).toBeVisible();
});
