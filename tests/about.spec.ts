/** /about (Fase 6.1): standalone page rendered on the server from the fixture API. */
import { test, expect } from "@playwright/test";
import documentsFixture from "./fixtures/documents.json";
import { initialHtml, withFixtureApi, setScenario } from "./helpers/fixture";

withFixtureApi();

test("initial HTML has the H1, profile, skills and documents", async ({
  request,
}) => {
  const html = await initialHtml(request, "/about");
  expect(html).toContain("Engineer, from interface to database.</h1>");
  for (const id of ['id="profile"', 'id="stack"', 'id="documents"'])
    expect(html).toContain(id);
  for (const name of ["PostgreSQL", "VS Code", "NestJS", "Tailwind CSS"])
    expect(html).toContain(name);
  for (const doc of documentsFixture.data) expect(html).toContain(doc.name);
  expect(html).not.toContain("legacy-root");
});

test("profile, grouped stack with sub-groups, and documents with downloads", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Engineer, from interface to database.",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("img", { name: /Portrait of/ })).toBeVisible();
  const stack = page.getByRole("region", { name: "The full toolkit." });
  for (const label of ["Frontend", "Backend", "Tools", "Other"])
    await expect(
      stack.getByRole("heading", { level: 3, name: new RegExp(`^${label}`) }),
    ).toBeVisible();
  await expect(
    stack.getByRole("heading", { level: 4, name: "Database" }),
  ).toBeVisible();
  await expect(
    stack.getByRole("heading", { level: 4, name: "DevOps" }).first(),
  ).toBeVisible();
  const docs = page.getByRole("region", { name: "CV and certificates." });
  await expect(docs.getByRole("listitem")).toHaveCount(
    documentsFixture.data.length,
  );
  const first = documentsFixture.data[0];
  const link = docs.getByRole("link", {
    name: new RegExp(`^Download ${first.name}`),
  });
  await expect(link).toHaveAttribute(
    "href",
    /^\/api\/documents\/[^/]+\/download$/,
  );
  // CV button resolves to the CV document.
  await expect(page.getByRole("link", { name: "Download CV" })).toHaveAttribute(
    "href",
    /\/api\/documents\/.+\/download$/,
  );
  await page.getByRole("link", { name: "See the journey" }).click();
  await expect(page).toHaveURL(/\/journey$/);
});

test("former sub-pages land on the matching sections", async ({ page }) => {
  for (const [from, anchor] of [
    ["/about/detail", "profile"],
    ["/about/skills", "stack"],
    ["/about/docs", "documents"],
  ] as const) {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`/about#${anchor}$`));
    await expect(page.locator(`#${anchor}`)).toBeInViewport();
  }
});

test("failed and empty collections stay inside their sections", async ({
  page,
  request,
}) => {
  await setScenario(request, {
    scenario: "normal",
    fail: ["skills"],
    empty: ["documents"],
  });
  await page.goto("/about");
  const stack = page.getByRole("region", { name: "The full toolkit." });
  await expect(stack.getByRole("alert")).toContainText(
    "The stack couldn't be loaded.",
  );
  await expect(
    page.getByRole("region", { name: "CV and certificates." }),
  ).toContainText("Documents will be listed here soon.");
  // Without a CV document the button falls back to the documents section.
  await expect(page.getByRole("link", { name: "Download CV" })).toHaveAttribute(
    "href",
    "/about#documents",
  );
  await setScenario(request, { scenario: "normal" });
  await stack.getByRole("button", { name: "Try again" }).click();
  await expect(stack.getByText("PostgreSQL")).toBeVisible();
});
