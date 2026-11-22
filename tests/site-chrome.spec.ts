/**
 * Site header, mobile menu, command palette, theme toggle and footer (Fase 4).
 * All /api/* reads are answered from fixtures; nothing reaches the real backend from the browser.
 */
import { test, expect, type BrowserContext } from "@playwright/test";
import projectsFixture from "./fixtures/projects.json";
import skillsFixture from "./fixtures/skills.json";
import documentsFixture from "./fixtures/documents.json";

async function mockApi(context: BrowserContext) {
  const data: Record<string, unknown[]> = {
    portofolios: projectsFixture.data,
    skills: skillsFixture.data,
    documents: documentsFixture.data,
    experiences: [],
  };
  await context.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/download"))
      return route.fulfill({ status: 200, body: "pdf" });
    const resource = url.pathname
      .replace("/api/public/", "")
      .replace("/api/", "")
      .split("/")[0];
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: data[resource] ?? [] }),
    });
  });
}

const pages = [
  { name: "Projects", path: "/projects" },
  { name: "About", path: "/about" },
  { name: "Journey", path: "/journey" },
  { name: "Contact", path: "/contact" },
];

test("header navigates to every page, marks the active link, and appears once", async ({
  page,
  context,
}) => {
  await mockApi(context);
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const { name, path } of pages) {
    await nav.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).not.toContainText("WIB");
  }
  await page
    .getByRole("link", { name: "Farhan Zulkarnain", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  // CV resolves to the API document once documents load.
  await expect(nav.getByRole("link", { name: /^CV/ })).toHaveAttribute(
    "href",
    /\/api\/documents\/.+\/download$/,
  );
  // Skip link is the first focusable element on a fresh load and targets the page's <main>.
  await page.goto("/about");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await expect(page.locator("#main-content")).toHaveCount(1);
});

test("404 page keeps the same header and footer", async ({
  page,
  context,
}) => {
  await mockApi(context);
  const response = await page.goto("/missing-page-for-frame-test");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
});

test("mobile menu opens as a modal sheet, locks scroll, and closes with Esc", async ({
  page,
  context,
}) => {
  await mockApi(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(menu.getByRole("link", { name: "About" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).toBe("hidden");
  // Focus stays inside the sheet: tabbing past the last control does not reach the page.
  for (let i = 0; i < 8; i++) await page.keyboard.press("Tab");
  expect(await menu.evaluate((el) => el.contains(document.activeElement))).toBe(
    true,
  );
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).not.toBe("hidden");
  // Links navigate and close the sheet.
  await trigger.click();
  await menu.getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(menu).toBeHidden();
});

test("theme toggle switches theme and persists after reload", async ({
  browser,
}) => {
  const context = await browser.newContext({ colorScheme: "light" });
  await mockApi(context);
  const page = await context.newPage();
  await page.goto("/projects");
  const header = page.getByRole("banner");
  const lightBg = await header.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  await page
    .getByRole("banner")
    .getByRole("button", { name: "Switch to dark theme" })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page
      .getByRole("banner")
      .getByRole("button", { name: "Switch to light theme" }),
  ).toBeVisible();
  const darkBg = await header.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  expect(darkBg).not.toBe(lightBg);
  await page
    .getByRole("banner")
    .getByRole("button", { name: "Switch to light theme" })
    .click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await context.close();
});

test("command palette searches pages and API projects, copies email, and switches theme", async ({
  browser,
}) => {
  const context = await browser.newContext({
    colorScheme: "light",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  await mockApi(context);
  const page = await context.newPage();
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const search = page.getByRole("combobox", { name: "Search" });
  await expect(search).toBeFocused();
  await search.fill("zzzz-no-match");
  await expect(page.getByText(/No results for .zzzz-no-match.\./)).toBeVisible();
  await search.fill("copy email");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Search and navigate" }),
  ).toContainText("Email address copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "@",
  );
  await search.fill("dark theme");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.keyboard.press("Control+k");
  await page
    .getByRole("combobox", { name: "Search" })
    .fill(projectsFixture.data[0].title);
  await expect(
    page.getByRole("option", { name: projectsFixture.data[0].title }),
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projects\/[^/]+$/);
  await context.close();
});
