/**
 * /contact (Fase 6.5). The POST goes from the browser to the API origin via apiFetch, so it is
 * intercepted here; nothing is sent to the real backend. Covers everything the old contact test
 * checked: a failure is never reported as success, values survive a failure, the form clears on
 * success, and the payload message is exactly "Subject: …\n\n…".
 */
import { test, expect, type BrowserContext } from "@playwright/test";
import { PRODUCTION_API, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

async function mockContact(context: BrowserContext) {
  const state = { status: 201, bodies: [] as string[], delay: 0 };
  await context.route(`${PRODUCTION_API}/api/contact`, async (route) => {
    state.bodies.push(route.request().postData() ?? "");
    if (state.delay)
      await new Promise((resolve) => setTimeout(resolve, state.delay));
    return route.fulfill({
      status: state.status,
      contentType: "application/json",
      headers: {
        "access-control-allow-origin": "http://localhost:3101",
        "access-control-allow-credentials": "true",
      },
      body: JSON.stringify({ success: state.status === 201 }),
    });
  });
  return state;
}

async function fill(page: import("@playwright/test").Page) {
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("QA Test");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("qa@example.com");
  await page.getByRole("textbox", { name: "Subject", exact: true }).fill("Contract test");
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("This request is intercepted locally.");
}

test("details column and form render with one H1", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Let's talk.",
  );
  await expect(
    page.getByText("Based in Medan, Indonesia (WIB, UTC+7)"),
  ).toBeVisible();
  await expect(
    page.getByText("Open to full-time roles and freelance projects"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Write an email" }),
  ).toHaveAttribute("href", /^mailto:/);
  await expect(
    page.getByRole("main").getByRole("link", { name: /GitHub/ }),
  ).toHaveAttribute("target", "_blank");
  await expect(
    page.getByRole("main").getByRole("link", { name: /LinkedIn/ }),
  ).toHaveAttribute("target", "_blank");
  await expect(page.getByText(/usually reply/i)).toHaveCount(0);
});

test("validation: per-field errors, summary, focus, nothing sent", async ({
  page,
  context,
}) => {
  const state = await mockContact(context);
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  const summary = page
    .getByRole("main")
    .getByRole("alert")
    .filter({ hasText: "Please fix 4 fields" });
  await expect(summary).toBeVisible();
  await expect(summary).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("Please enter a valid email address.").first(),
  ).toBeVisible();
  // One remaining error: focus goes to that field.
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("QA");
  await page.getByRole("textbox", { name: "Subject", exact: true }).fill("S");
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("M");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("not-an-email");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("textbox", { name: "Email", exact: true })).toBeFocused();
  expect(state.bodies).toHaveLength(0);
});

test("a failed send is never reported as success and keeps the values", async ({
  page,
  context,
}) => {
  const state = await mockContact(context);
  state.status = 503;
  await page.goto("/contact");
  await fill(page);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("main").getByRole("alert").last()).toContainText(
    "couldn't be sent",
  );
  await expect(page.getByRole("status")).not.toContainText("sent");
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("QA Test");
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toHaveValue(
    "This request is intercepted locally.",
  );
});

test("success clears the form and sends the exact payload once", async ({
  page,
  context,
}) => {
  const state = await mockContact(context);
  state.delay = 800;
  await page.goto("/contact");
  await fill(page);
  const send = page.getByRole("button", { name: "Send message" });
  await send.click();
  await expect(page.getByRole("button", { name: "Sending…" })).toBeDisabled();
  await page
    .getByRole("button", { name: "Sending…" })
    .click({ force: true })
    .catch(() => {});
  await expect(page.getByRole("status")).toContainText(
    "Thanks, your message has been sent.",
  );
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toBeEmpty();
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toBeEmpty();
  expect(state.bodies).toHaveLength(1);
  expect(JSON.parse(state.bodies[0])).toEqual({
    name: "QA Test",
    email: "qa@example.com",
    message: "Subject: Contract test\n\nThis request is intercepted locally.",
  });
});
