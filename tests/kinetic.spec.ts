import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { capabilityLayout } from "../src/components/three/capabilityLayout";
import { getAssetMotion } from "../src/components/three/assetMotion";
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
  await page.mouse.move(0,0);
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
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".hero [data-fzh-asset=core] > img")).toBeVisible();
  await expect(page.locator(".kinetic-scene-host canvas")).toHaveCount(0);
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
  test.setTimeout(180_000); // Software WebGL makes this multi-section visual check slower.
  await mockApi(context);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".hero [data-fzh-asset=core]")).toHaveAttribute("data-ready", "true");
  const canvas = page.locator(".kinetic-scene-host canvas");
  await canvas.evaluate((el) =>
    el.setAttribute("data-persistence-test", "original"),
  );
  const box = await page.locator(".hero canvas").boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.move(
    box!.x + box!.width / 2 + 60,
    box!.y + box!.height / 2 + 30,
    { steps: 2 },
  );
  await page.screenshot({ path: info.outputPath("hero-webgl-1440.png") });
  await page.getByRole("tab", { name: /Backend/ }).click();
  await expect(
    page.locator(".matrix-stage canvas"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Node.js", exact: true }).hover();
  await page.getByRole("button", { name: "Node.js", exact: true }).click();
  await expect(page.locator(".matrix-detail strong")).toHaveText("Node.js");
  await page.screenshot({ path: info.outputPath("capability-webgl-1440.png") });
  await expect(canvas).toHaveAttribute("data-persistence-test", "original");
  await page.locator("#work").scrollIntoViewIfNeeded();
  await expect(page.locator(".project-spatial")).toHaveCount(0);
  await expect(canvas).toHaveAttribute("data-persistence-test", "original");
  await page.screenshot({ path: info.outputPath("project-browser-1440.png") });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".kinetic-scene-host canvas")).toHaveCount(0);
  await expect(page.locator("[data-fzh-asset][data-running=true]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("mobile core loads LOD and recovers with artwork after context loss", async ({
  page,
  context,
}, info) => {
  await mockApi(context);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 4 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 4 });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const host = page.locator(".hero [data-fzh-asset=core]"),
    canvas = host.locator("canvas");
  await host.scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-ready", "true");
  await expect(canvas).toHaveCount(1);
  await page.screenshot({ path: info.outputPath("blender-mobile-low.png") });
  await canvas.evaluate((el) =>
    el.dispatchEvent(new Event("webglcontextlost")),
  );
  await expect(canvas).toHaveCount(0);
  await expect(page.locator(".hero [data-fzh-asset=core]")).toHaveAttribute("data-ready", "false");
  await expect(page.locator(".hero [data-fzh-asset=core] > img")).toBeVisible();
});

test("failed Blender asset retains usable static artwork", async ({
  page,
  context,
}) => {
  await mockApi(context);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/models/fzh-kinetic-core/*.glb", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("/");
  await expect(page.locator(".hero [data-fzh-asset=core] > img")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".hero [data-fzh-asset=core]")).toHaveAttribute("data-ready", "false");
});

test("project vault details open the project selected in the DOM", async ({
  page,
  context,
}) => {
  await mockApi(context);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/projects");
  await page.locator(".project-list button").nth(1).click();
  await page.mouse.move(0,0);
  const href = await page.locator(".project-summary a").getAttribute("href");
  await expect(page.locator(".project-spatial")).toHaveCount(0);
  await expect(page.locator(".project-list button").nth(1)).toHaveClass(
    /selected/,
  );
  const selectedTitle = await page
    .locator(".project-list button")
    .nth(1)
    .locator("span")
    .nth(1)
    .innerText();
  await expect(page.locator(".project-summary h3")).toHaveText(selectedTitle);
  await page.locator(".project-summary a").click();
  await expect(page).toHaveURL(new RegExp(href! + "$"));
});

test("identity capsule is mounted on About and respects responsive layout and reduced motion", async ({ page, context }, info) => {
  await mockApi(context);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/about");
  const capsule = page.locator('[data-fzh-asset="identity"]');
  await capsule.scrollIntoViewIfNeeded();
  await expect(capsule).toHaveAttribute("data-ready", "true");
  await expect(capsule.locator("canvas")).toBeVisible();
  const text = await page.locator(".profile-narrative").boundingBox();
  const model = await capsule.boundingBox();
  expect(text!.x).toBeLessThan(model!.x);
  await page.screenshot({ path: info.outputPath("about-capsule-desktop.png") });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(capsule).toHaveAttribute("data-running", "false");
  await expect(capsule.locator("canvas")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  const lod = page.waitForResponse(response => response.url().endsWith("FZH_About_Identity_Capsule_LOD.glb") && response.status() === 200);
  await page.reload();
  await capsule.scrollIntoViewIfNeeded();
  await lod;
  await expect(capsule).toHaveAttribute("data-ready", "true");
  const mobileText = await page.locator(".profile-narrative").boundingBox();
  const mobileModel = await capsule.boundingBox();
  expect(mobileText!.y + mobileText!.height).toBeLessThanOrEqual(mobileModel!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("about-capsule-mobile.png") });
  expect(errors).toEqual([]);
});


test("standby and interaction motion remain visible at every device size", () => {
  for (const kind of ["core", "identity"] as const) {
    for (const device of [{ mobile: true, tablet: false }, { mobile: false, tablet: true }, { mobile: false, tablet: false }]) {
      const input = { kind, ...device, time: 0, active: false, pointerX: 0, pointerY: 0, scroll: 0 };
      const rest = getAssetMotion(input);
      const idle = getAssetMotion({ ...input, time: 2 });
      expect(Math.abs(idle.positionY - rest.positionY)).toBeGreaterThan(0.02);
      expect(Math.abs(idle.rotationY - rest.rotationY)).toBeGreaterThan(0.04);
      const active = getAssetMotion({ ...input, time: 2, active: true, pointerX: 0.8, pointerY: 0.4 });
      expect(active.speed).toBeGreaterThan(idle.speed);
      expect(active.scale).toBeGreaterThan(idle.scale);
      expect(active.rotationY).toBeGreaterThan(idle.rotationY);
      const scrolled = getAssetMotion({ ...input, time: 2, scroll: 0.6 });
      expect(scrolled.rotationY - idle.rotationY).toBeGreaterThan(0.05);
      expect(scrolled.positionY - idle.positionY).toBeGreaterThan(0.04);
    }
  }
});

for (const width of [390, 1024, 1440]) {
  test(`standby renders continuously without input at ${width}px`, async ({ page, context }) => {
    test.setTimeout(150_000);
    await mockApi(context);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    for (const kind of ["core", "identity"]) {
      const asset = page.locator(`[data-fzh-asset="${kind}"]`);
      await asset.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await expect(asset).toHaveAttribute("data-ready", "true");
      await expect(asset).toHaveAttribute("data-running", "true");
      const canvas = asset.locator("canvas");
      const first = await canvas.screenshot();
      // The input remains untouched for the entire interval: this checks standby.
      await page.waitForTimeout(1200);
      const second = await canvas.screenshot();
      expect(first.equals(second)).toBe(false);
      if (width === 390) {
        await asset.dispatchEvent("pointerdown", { pointerType: "touch", clientX: 210, clientY: 500 });
        await asset.dispatchEvent("pointerup", { pointerType: "touch", clientX: 210, clientY: 500 });
        expect(await asset.evaluate(el => getComputedStyle(el).touchAction)).toBe("pan-y");
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(asset).toHaveAttribute("data-running", "false");
      await page.waitForTimeout(300);
      const staticFirst = await canvas.screenshot();
      await page.waitForTimeout(400);
      expect(staticFirst.equals(await canvas.screenshot())).toBe(true);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await expect(asset).toHaveAttribute("data-running", "true");
    }
  });
}

test("capability matrix reuses GLBs, selects nodes, and retains accessible fallback", async ({ page, context }, info) => {
  test.setTimeout(180_000);
  await mockApi(context);
  const requests: string[] = [];
  page.on('request', request => { if(request.url().includes('/models/capability/')) requests.push(request.url()); });
  await page.goto('/');
  await page.getByRole('tab', { name: /Frontend/ }).click();
  const stage = page.locator('.matrix-stage');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-ready', 'true');
  const canvas = stage.locator('canvas');
  await canvas.evaluate(el => el.setAttribute('data-stable', 'yes'));
  await page.getByRole('button', { name: 'React', exact: true }).click();
  await expect(page.locator('.matrix-detail strong')).toHaveText('React');
  await page.screenshot({path:info.outputPath('matrix-desktop-selected.png')});
  await page.getByRole('tab', { name: /Backend/ }).click();
  await expect(page.locator('.matrix-core-label')).toHaveText('BACKEND');
  await expect(canvas).toHaveAttribute('data-stable', 'yes');
  await page.getByRole('button', { name: 'Node.js', exact: true }).click();
  await expect(page.locator('.matrix-detail strong')).toHaveText('Node.js');
  await page.getByRole('tab', { name: /Backend/ }).click();
  await expect(page.locator('.matrix-detail strong')).toHaveCount(0);
  expect(requests.length).toBe(3);
  expect(new Set(requests).size).toBe(3);
  await canvas.evaluate(el => el.dispatchEvent(new Event('webglcontextlost')));
  await expect(stage).toHaveAttribute('data-ready', 'false');
  await page.getByRole('button', { name: 'Node.js', exact: true }).click();
  await expect(page.locator('.matrix-detail strong')).toHaveText('Node.js');
});

test.describe("capability touch device", () => {
  test.use({ hasTouch: true });
test("mobile capability matrix paginates, supports touch and reduced motion", async ({ page, context }, info) => {
  test.setTimeout(180_000);
  await mockApi(context);
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');
  await page.getByRole('tab', {name:/Frontend/}).click();
  const stage=page.locator('.matrix-stage');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-ready','true');
  await expect(stage).toHaveAttribute('data-running','true');
  await expect(page.locator('.matrix-node-label')).toHaveCount(3);
  await expect(stage).toHaveCSS('touch-action','pan-y');
  await page.getByRole('button',{name:'Next skill nodes'}).click();
  await expect(page.locator('.matrix-node-label')).toHaveCount(2);
  await page.getByRole('button',{name:'Next.js',exact:true}).tap();
  await expect(page.locator('.matrix-detail strong')).toHaveText('Next.js');
  await stage.scrollIntoViewIfNeeded();
  await page.screenshot({path:info.outputPath('matrix-mobile.png')});
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(stage).toHaveAttribute('data-running','false');
  await page.getByRole('button',{name:'Clear selection'}).click();
  await expect(page.locator('.matrix-detail strong')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

});

test('capability layouts keep variable counts separated', async () => {
  for(let count=0;count<=16;count++) {
    const positions=capabilityLayout(count);
    expect(positions).toHaveLength(count);
    for(let i=0;i<count;i++)for(let j=i+1;j<count;j++) expect(Math.hypot(positions[i][0]-positions[j][0],positions[i][1]-positions[j][1])).toBeGreaterThan(.9);
  }
});


test("project vault keeps scene, selects artifacts and survives context loss", async ({page,context},info)=>{
  test.setTimeout(180_000);
  await mockApi(context);
  await context.route('**/image/upload/f_webp,**',route=>route.fulfill({path:'tests/fixtures/project-preview.webp',contentType:'image/webp',headers:{'access-control-allow-origin':'*'}}));
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const models:string[]=[];page.on('request',r=>{if(r.url().includes('/models/projects/'))models.push(r.url());});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/projects');
  const stage=page.locator('.vault-canvas');await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-ready','true');
  await expect(page.locator('.vault-title-label')).toHaveCount(3);
  await expect(page.locator('[data-screenshot=ready]')).toHaveCount(3);
  const canvas=stage.locator('canvas');await canvas.evaluate(el=>el.setAttribute('data-stable','yes'));
  const box=await stage.boundingBox();
  await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);
  await expect(page.locator('.project-vault')).toHaveAttribute('data-hovered',projectsFixture.data[0].id);
  await page.mouse.click(box!.x+box!.width/2,box!.y+box!.height/2);
  await expect(page.locator('.project-vault')).toHaveAttribute('data-inspection','true');
  await page.getByRole('button',{name:'Next project',exact:true}).click();
  await expect(page.locator('.project-summary h3')).toHaveText(projectsFixture.data[1].title);
  await expect(canvas).toHaveAttribute('data-stable','yes');
  await stage.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('project-vault-desktop.png')});
  expect(models).toHaveLength(2);
  await canvas.evaluate(el=>el.dispatchEvent(new Event('webglcontextlost')));
  await expect(stage).toHaveAttribute('data-ready','false');
  await expect(page.locator('.vault-fallback')).toBeVisible();
  await page.getByRole('button',{name:'Next project',exact:true}).click();
  await expect(page.locator('.project-summary h3')).toHaveText(projectsFixture.data[2].title);
  expect(errors).toEqual([]);
});
test.describe('project vault touch',()=>{
 test.use({hasTouch:true,viewport:{width:390,height:844}});
 test('mobile project vault supports tap and reduced motion',async({page,context},info)=>{
  await mockApi(context);
  await context.route('**/image/upload/f_webp,**',route=>route.fulfill({path:'tests/fixtures/project-preview.webp',contentType:'image/webp',headers:{'access-control-allow-origin':'*'}}));
  await page.goto('/projects');
  const stage=page.locator('.vault-canvas');await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-ready','true');
  await expect(stage).toHaveAttribute('data-running','false');
  await expect(page.locator('.vault-title-label')).toHaveCount(1);
  await expect(page.locator('[data-screenshot=ready]')).toHaveCount(1);
  await expect(stage).toHaveCSS('touch-action','pan-y');
  await page.getByRole('button',{name:'Next project',exact:true}).tap();
  await expect(page.locator('.project-summary h3')).toHaveText(projectsFixture.data[1].title);
  await page.getByRole('button',{name:'Exit inspection',exact:true}).tap();
  await expect(page.locator('.project-vault')).toHaveAttribute('data-inspection','false');
  await page.emulateMedia({reducedMotion:'no-preference'});await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-running','true');
  await page.screenshot({path:info.outputPath('project-vault-mobile.png')});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
});

test('project vault tablet preserves access after screenshot failure',async({page,context})=>{
 await mockApi(context);await page.setViewportSize({width:900,height:1100});
 await context.route('**/image/upload/f_webp,**',route=>route.abort());
 await page.goto('/projects');const stage=page.locator('.vault-canvas');await stage.scrollIntoViewIfNeeded();
 await expect(stage).toHaveAttribute('data-ready','true');
 await expect(page.locator('[data-screenshot=failed]')).toHaveCount(3);
 await page.getByRole('button',{name:'Next project',exact:true}).click();
 await expect(page.locator('.project-summary h3')).toHaveText(projectsFixture.data[1].title);
 await expect(page.locator('.project-summary a')).toHaveAttribute('href',/projects\//);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
