/**
 * Visual guard for the dashboard: its appearance is out of scope for the public redesign
 * (see CLAUDE.md). Baselines were captured before the admin isolation (Fase 1.5) and must
 * stay identical while globals.css and public components are rewritten.
 * Update baselines only on purpose: npx playwright test tests/admin-visual.spec.ts --update-snapshots
 */
import { test, expect, type BrowserContext } from "@playwright/test";
import { createHmac } from "node:crypto";
import projectsFixture from "./fixtures/projects.json";
import skillsFixture from "./fixtures/skills.json";
import documentsFixture from "./fixtures/documents.json";

const testSecret = "kinetic-local-qa-only-not-a-production-secret";

function token(role: string) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ id: "qa-local-user", role, exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString("base64url");
  return `${header}.${payload}.${createHmac("sha256", testSecret).update(`${header}.${payload}`).digest("base64url")}`;
}

async function setup(context: BrowserContext, role: string) {
  await context.addCookies([
    { name: "accessToken", value: token(role), domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ]);
  const collections: Record<string, unknown[]> = {
    portofolios: projectsFixture.data,
    skills: skillsFixture.data,
    documents: documentsFixture.data,
    experiences: [
      {
        id: "qa-experience",
        title: "Full-Stack Developer",
        company: "QA Company",
        location: "Medan",
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: null,
        current: true,
        description: "Fixture entry",
        technologies: ["Next.js", "Prisma"],
        sortOrder: 0,
      },
    ],
  };
  // Every API call is answered locally; nothing reaches the real backend.
  await context.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    const resource = url.pathname.replace("/api/public/", "").replace("/api/", "").split("/")[0];
    const body =
      url.pathname === "/api/users/profile"
        ? { success: true, data: { name: "QA Administrator", role } }
        : { success: true, data: collections[resource] ?? [] };
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
      headers: {
        "access-control-allow-origin": "http://localhost:3101",
        "access-control-allow-credentials": "true",
      },
    });
  });
}

const routes = [
  "/dashboard/admin",
  "/admin/home",
  "/admin/skill",
  "/admin/skill/manage",
  "/admin/portofolio",
  "/admin/portofolio/upload",
  "/admin/document",
  "/admin/document/upload",
  "/dashboard/admin/experience",
  "/dashboard/user",
];

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  for (const route of routes) {
    test(`dashboard look is unchanged: ${route} @${viewport.width}`, async ({ page, context }) => {
      await setup(context, route === "/dashboard/user" ? "USER" : "ADMIN");
      await page.setViewportSize(viewport);
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      await page.addStyleTag({
        content: "*{caret-color:transparent!important} canvas{visibility:hidden!important}",
      });
      await expect(page).toHaveScreenshot(
        `${viewport.width}${route.replaceAll("/", "_")}.png`,
        {
          fullPage: true,
          animations: "disabled",
          // Live Asia/Jakarta clock in the member footer.
          mask: [page.locator(".footer-bottom > span:nth-child(2)")],
          // Tolerates sub-pixel anti-aliasing noise on rounded corners only.
          maxDiffPixels: 100,
        },
      );
    });
  }
}
