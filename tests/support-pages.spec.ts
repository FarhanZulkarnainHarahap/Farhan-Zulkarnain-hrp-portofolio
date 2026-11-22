/** Fase 6.6: auth pages restyled (logic unchanged), shared 404 look. */
import { test, expect } from "@playwright/test";
import { withFixtureApi } from "./helpers/fixture";

withFixtureApi();

test("login page: one H1, visible labels, password toggle, link to register", async ({
  page,
}) => {
  await page.goto("/auth/login");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sign in");
  await expect(page.locator(".legacy-root")).toHaveCount(0);
  const password = page.getByLabel("Password", { exact: true });
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Create one" }).click();
  await expect(page).toHaveURL(/\/auth\/register$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Create an account",
  );
  for (const label of ["Full name", "Email", "Password"])
    await expect(page.getByLabel(label, { exact: true })).toBeVisible();
});

test("404 uses the shared status page inside the site frame", async ({
  page,
}) => {
  const response = await page.goto("/missing-support-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "This page doesn't exist.",
  );
  await expect(
    page.getByRole("main").getByRole("link", { name: "Browse projects" }),
  ).toHaveAttribute("href", "/projects");
  await expect(page.getByRole("banner")).toHaveCount(1);
});
