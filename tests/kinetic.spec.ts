import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { createHmac } from "node:crypto";
import projectsFixture from "./fixtures/projects.json";
import skillsFixture from "./fixtures/skills.json";
import documentsFixture from "./fixtures/documents.json";

const testSecret = "kinetic-local-qa-only-not-a-production-secret";
const API = "https://api.farhanzulkarnainhrp.com";
function token(role: string) {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      id: "qa-local-user",
      role,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString("base64url");
  return `${header}.${payload}.${createHmac("sha256", testSecret).update(`${header}.${payload}`).digest("base64url")}`;
}
async function authenticate(context: BrowserContext, role = "ADMIN") {
  await context.addCookies([
    {
      name: "accessToken",
      value: token(role),
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
async function mockApi(context: BrowserContext) {
  const state = {
    projects: structuredClone(projectsFixture.data),
    skills: structuredClone(skillsFixture.data),
    documents: structuredClone(documentsFixture.data),
    experiences: [] as Array<Record<string, unknown>>,
    writes: [] as { path: string; method: string; body: string }[],
    failedReads: new Set<string>(),
    contactStatus: 201,
  };
  await context.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const json = (data: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(data),
        headers: {
          "access-control-allow-origin": "http://localhost:3101",
          "access-control-allow-credentials": "true",
        },
      });
    if (method === "OPTIONS")
      return route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "http://localhost:3101",
          "access-control-allow-credentials": "true",
          "access-control-allow-methods": "GET,POST,PUT,DELETE",
          "access-control-allow-headers": "Content-Type",
        },
      });
    const resource = path
      .replace("/api/public/", "")
      .replace("/api/", "")
      .split("/")[0];
    const collection =
      resource === "portofolios"
        ? state.projects
        : resource === "skills"
          ? state.skills
          : resource === "documents"
            ? state.documents
            : resource === "experiences"
              ? state.experiences
              : null;
    if (method === "GET" && collection) {
      if (state.failedReads.has(resource)) return json({ success: false }, 503);
      return json({ success: true, data: collection });
    }
    if (path === "/api/users/profile")
      return json({
        success: true,
        data: { name: "QA Administrator", role: "ADMIN" },
      });
    if (method !== "GET")
      state.writes.push({ path, method, body: request.postData() || "" });
    if (path === "/api/contact")
      return json(
        { success: state.contactStatus === 201 },
        state.contactStatus,
      );
    if (path === "/api/auth/login") {
      await authenticate(context);
      return json({ success: true });
    }
    if (path === "/api/auth/logout") {
      await context.clearCookies();
      return json({ success: true });
    }
    if (resource === "experiences") {
      if (method === "POST")
        state.experiences.push({
          ...request.postDataJSON(),
          id: "qa-experience",
        });
      if (method === "PUT")
        state.experiences = state.experiences.map((item) => ({
          ...item,
          ...request.postDataJSON(),
        }));
      if (method === "DELETE") state.experiences = [];
      return json({ success: true, data: state.experiences[0] });
    }
    if (resource === "skills") {
      if (method === "POST") {
        const item = { ...request.postDataJSON(), id: "qa-skill" };
        state.skills.push(item);
        return json({ success: true, data: item });
      }
      if (method === "DELETE")
        state.skills = state.skills.filter(
          (item) => item.id !== path.split("/").pop(),
        );
      return json({ success: true });
    }
    if (resource === "portofolios") {
      if (method === "DELETE")
        state.projects = state.projects.filter(
          (item) => item.id !== path.split("/").pop(),
        );
      return json({ success: true, data: state.projects[0] });
    }
    if (resource === "documents") {
      if (method === "DELETE")
        state.documents = state.documents.filter(
          (item) => item.id !== path.split("/").pop(),
        );
      return json({ success: true });
    }
    // Never let test credentials or test writes reach the real backend.
    if (url.origin === API || method !== "GET")
      return json(
        { success: false, message: "Unmocked request blocked by test harness" },
        501,
      );
    return route.continue();
  });
  return state;
}
async function settled(page: Page) {
  await page.locator(".project-list button").first().waitFor();
  for (const section of await page.locator(".section").all()) {
    await section.scrollIntoViewIfNeeded();
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

test("public routes, project preview, and all requested responsive widths", async ({
  page,
  context,
}, info) => {
  await mockApi(context);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await settled(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("FARHAN");
  for (const width of [360, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`home-${width}.png`),
      fullPage: true,
    });
  }
  for (const route of [
    "/about",
    "/about/detail",
    "/about/skills",
    "/about/docs",
    "/journey",
    "/projects",
    "/contact",
    "/auth/login",
    "/auth/register",
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(
          () =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          { message: `${route} at ${width}` },
        )
        .toBe(true);
    }
  }
  await page.goto("/projects");
  await page.locator(".project-list button").nth(1).click();
  await expect(page.locator(".project-summary h3")).toHaveText(
    projectsFixture.data[1].title,
  );
  expect(errors).toEqual([]);
});

test("keyboard palette, focus restoration, mobile menu, and capability tabs", async ({
  page,
  context,
}) => {
  await mockApi(context);
  await page.goto("/");
  await page.getByRole("button", { name: "Open command palette" }).focus();
  await page.keyboard.press("Control+k");
  const search = page.getByRole("combobox");
  await expect(search).toBeFocused();
  await search.fill("jour");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/journey$/);
  await page.getByRole("button", { name: "Open command palette" }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open command palette" }),
  ).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator(".main-nav a").first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
  await page.getByRole("link", { name: "02 About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  const database = page.getByRole("tab", { name: /Database/ });
  await database.click();
  await expect(page.getByRole("tabpanel")).toContainText("Postgresql");
  await database.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Infrastructure/ })).toBeFocused();
});

test("read errors can retry and contact never reports success on failure", async ({
  page,
  context,
}) => {
  const state = await mockApi(context);
  state.failedReads.add("portofolios");
  await page.goto("/projects");
  await expect(page.locator(".collection-state[role=alert]")).toContainText(
    "Unable to load",
  );
  state.failedReads.clear();
  await page.getByRole("button", { name: "Retry connection" }).click();
  await expect(page.locator(".project-list button").first()).toBeVisible();
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("QA Test");
  await page.getByLabel("Email address").fill("qa@example.com");
  await page.getByLabel("Subject", { exact: true }).fill("Contract test");
  await page
    .getByLabel("Your message")
    .fill("This request is intercepted locally.");
  state.contactStatus = 503;
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".transmission-form [role=alert]")).toContainText(
    "could not be sent",
  );
  await expect(page.getByLabel("Your name")).toHaveValue("QA Test");
  state.contactStatus = 201;
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".transmission-form [role=status]")).toContainText(
    "Message sent",
  );
  await expect(page.getByLabel("Your name")).toBeEmpty();
  expect(JSON.parse(state.writes.at(-1)!.body).message).toBe(
    "Subject: Contract test\n\nThis request is intercepted locally.",
  );
});

test("missing, invalid, and non-admin tokens cannot enter admin routes", async ({
  page,
  context,
}) => {
  await mockApi(context);
  await page.goto("/dashboard/admin/home");
  await expect(page).toHaveURL(/\/auth\/login$/);
  await context.addCookies([
    { name: "accessToken", value: "invalid", domain: "localhost", path: "/" },
  ]);
  await page.goto("/auth/login");
  await expect(
    page.getByRole("heading", { name: "Access System" }),
  ).toBeVisible();
  await authenticate(context, "USER");
  const response = await page.goto("/dashboard/admin/home");
  expect(response?.status()).toBe(403);
  const alias = await page.goto("/admin/home");
  expect(alias?.status()).toBe(403);
});

test("admin routes render, project edit modal traps focus, and login/logout work", async ({
  page,
  context,
}, info) => {
  const state = await mockApi(context);
  await page.goto("/auth/login");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("qa@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-only-password");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/home$/);
  for (const route of [
    "/dashboard",
    "/dashboard/admin",
    "/admin/home",
    "/admin/skill",
    "/admin/skill/manage",
    "/admin/portofolio",
    "/admin/portofolio/upload",
    "/admin/document",
    "/admin/document/upload",
    "/dashboard/admin/experience",
  ]) {
    await page.goto(route);
    await expect(page.locator(".admin-content")).toBeVisible();
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(
          () =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          { message: `${route} at ${width}` },
        )
        .toBe(true);
    }
  }
  await page.goto("/admin/home");
  await page.screenshot({
    path: info.outputPath("dashboard-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: info.outputPath("dashboard-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin/portofolio");
  await page.getByRole("button", { name: "Edit", exact: true }).first().click();
  const modal = page.getByRole("dialog", { name: "Edit project" });
  await expect(modal).toBeVisible();
  await modal.getByLabel("title", { exact: true }).fill("QA edit");
  await page.keyboard.press("Escape");
  await expect(modal).not.toBeVisible();
  expect(state.writes.filter((item) => item.method === "PUT")).toHaveLength(0);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  await page.goto("/admin/home");
  await expect(page).toHaveURL(/\/auth\/login$/);
});

test("experience create, update, cancellation, and deletion match backend contracts", async ({
  page,
  context,
}) => {
  const state = await mockApi(context);
  await authenticate(context);
  await page.goto("/dashboard/admin/experience");
  await page.getByRole("button", { name: "Add experience" }).click();
  await page.getByLabel("Role", { exact: true }).fill("QA Engineer");
  await page.getByLabel("Company / organization").fill("Test fixture only");
  await page.getByLabel("Start date", { exact: true }).fill("2026-01-01");
  await page
    .getByLabel("Technologies, separated by commas")
    .fill("TypeScript, Next.js");
  await page.getByRole("button", { name: "Save experience" }).click();
  await expect(
    page.getByRole("heading", { name: "QA Engineer" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Role", { exact: true }).fill("QA Engineer Updated");
  await page.getByRole("button", { name: "Save experience" }).click();
  await expect(
    page.getByRole("heading", { name: "QA Engineer Updated" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Keep entry" }).click();
  expect(state.writes.filter((item) => item.method === "DELETE")).toHaveLength(
    0,
  );
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await expect(page.getByText("No entries published yet.")).toBeVisible();
  expect(state.writes.map((item) => item.method)).toEqual([
    "POST",
    "PUT",
    "DELETE",
  ]);
  expect(JSON.parse(state.writes[0].body).technologies).toEqual([
    "TypeScript",
    "Next.js",
  ]);
});

test("reduced motion and unavailable WebGL retain the system graphic", async ({
  page,
  context,
}) => {
  await mockApi(context);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".hero .spatial-fallback img")).toBeVisible();
  await expect(page.locator(".hero canvas")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const response = await page.goto("/missing-kinetic-node");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Node not found." }),
  ).toBeVisible();
});

test("project and document uploads, project edits, and skill CRUD preserve supported methods", async ({
  page,
  context,
}) => {
  const state = await mockApi(context);
  await authenticate(context);
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/admin/portofolio/upload");
  await page.getByLabel("title", { exact: true }).fill("QA project fixture");
  await page
    .getByLabel("description", { exact: true })
    .fill("Only sent to a mocked endpoint.");
  await page.locator('input[type="file"]').setInputFiles({
    name: "qa-preview.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page
    .getByRole("button", { name: "Publish Project", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Project created" }),
  ).toBeVisible();
  expect(state.writes.at(-1)?.method).toBe("POST");
  expect(state.writes.at(-1)?.body).toContain('name="image"');
  await page.getByRole("button", { name: "Back to Projects" }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).first().click();
  await page
    .getByRole("dialog", { name: "Edit project" })
    .getByLabel("title", { exact: true })
    .fill("QA update");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(
    page.getByRole("dialog", { name: "Project updated" }),
  ).toBeVisible();
  expect(state.writes.at(-1)?.method).toBe("PUT");
  expect(state.writes.at(-1)?.body).toContain("QA update");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", {
      name: `Delete ${state.projects[0].title}`,
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await expect.poll(() => state.writes.at(-1)?.method).toBe("DELETE");
  await page.goto("/admin/skill/manage");
  await page
    .getByPlaceholder("Example: Next.js, Laravel, Docker...")
    .fill("QA capability");
  await page
    .getByRole("button", { name: "PUBLISH SKILL", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Skill created" }),
  ).toBeVisible();
  expect(state.writes.at(-1)?.path).toBe("/api/skills");
  await page.getByRole("button", { name: "View Skill List" }).click();
  await page.getByRole("button", { name: "Delete QA capability" }).click();
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Delete QA capability" }),
  ).toHaveCount(0);
  await page.goto("/admin/document/upload");
  await page.getByLabel("Document name", { exact: true }).fill("QA document");
  await page.locator('input[type="file"]').setInputFiles({
    name: "qa-document.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% QA mock upload only\n%%EOF"),
  });
  await page
    .getByRole("button", { name: "Save Document", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/document$/);
  expect(state.writes.at(-1)?.path).toBe("/api/documents");
  expect(state.writes.at(-1)?.body).toContain('name="file"');
  await page
    .getByRole("button", {
      name: `Delete ${state.documents[0].name}`,
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await expect.poll(() => state.writes.at(-1)?.method).toBe("DELETE");
});

test("live public API, project detail, CV download, and rendered screenshots", async ({
  page,
}, info) => {
  for (const resource of [
    "portofolios",
    "skills",
    "experiences",
    "documents",
  ]) {
    const response = await page.request.get(`/api/public/${resource}`);
    expect(response.status(), `${resource} upstream status`).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.data) || Array.isArray(payload)).toBe(true);
  }
  const rejected = await page.request.get("/api/public/users");
  expect(rejected.status()).toBe(404);
  await page.goto("/");
  await settled(page);
  await page.screenshot({
    path: info.outputPath("live-home-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: info.outputPath("live-home-mobile.png"),
    fullPage: true,
  });
  await page.goto("/projects");
  await page.locator(".project-stage .text-link").click();
  await expect(page.locator(".project-detail h1")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.goto("/about/docs");
  const cv = page
    .locator(".document-item")
    .filter({ hasText: /Curiculum Vitae|Curriculum Vitae|Resume/ })
    .first();
  await expect(cv).toBeVisible();
  const href = await cv
    .getByRole("link", { name: "Download document" })
    .getAttribute("href");
  const download = await page.request.get(href!);
  expect(download.status()).toBe(200);
  expect(download.headers()["content-disposition"]).toContain("attachment");
  expect((await download.body()).length).toBeGreaterThan(1000);
});

test("desktop spatial scene renders and responds to capability selection", async ({
  page,
  context,
}, info) => {
  await mockApi(context);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".hero canvas")).toBeVisible();
  const canvas = page.locator(".hero canvas");
  const box = await canvas.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2 + 60,
    box!.y + box!.height / 2 + 30,
    { steps: 10 },
  );
  await page.mouse.up();
  await page.screenshot({ path: info.outputPath("hero-webgl-1440.png") });
  await page.getByRole("tab", { name: /Backend/ }).click();
  await expect(page.locator(".capability-graph canvas")).toBeVisible();
  await page.getByRole("button", { name: "Node.js", exact: true }).hover();
  await expect(page.locator(".graph-spatial .tag-top")).toHaveText("Node.js");
  await page.screenshot({ path: info.outputPath("capability-webgl-1440.png") });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(errors).toEqual([]);
});
