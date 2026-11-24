/** Fase 9: /about illustration (accessible, static without motion) and Open Graph images. */
import { test, expect, type APIRequestContext } from "@playwright/test";
import { initialHtml, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

test("illustration is in the initial HTML with an accessible name and description", async ({
  request,
}) => {
  const html = await initialHtml(request, "/about");
  expect(html).toMatch(/<svg[^>]*role="img"[^>]*aria-labelledby="[^"]+"/);
  expect(html).toContain("Anatomy of a full-stack application</title>");
  expect(html).toContain("<desc");
  for (const label of ["INTERFACE", "API", "SERVICE", "DATABASE", "DEPLOYMENT"])
    expect(html).toContain(`>${label}</text>`);
});

test("illustration is static under reduced motion and draws once with motion", async ({
  browser,
}) => {
  const still = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 900 },
  });
  const page = await still.newPage();
  await page.goto("/about");
  const svg = page.getByRole("img", {
    name: "Anatomy of a full-stack application",
  });
  await expect(svg).toBeVisible();
  const state = () =>
    svg.evaluate((el) => ({
      offsets: [...el.querySelectorAll<SVGElement>(".draw")].map(
        (n) => n.style.strokeDashoffset,
      ),
      fades: [...el.querySelectorAll<SVGElement>(".draw-fade")].map(
        (n) => getComputedStyle(n).opacity,
      ),
    }));
  const still1 = await state();
  expect(still1.offsets.every((o) => o === "")).toBe(true);
  expect(still1.fades.every((o) => o === "1")).toBe(true);
  await still.close();

  const moving = await browser.newContext({
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  });
  const page2 = await moving.newPage();
  await page2.goto("/about");
  const svg2 = page2.getByRole("img", {
    name: "Anatomy of a full-stack application",
  });
  await expect
    .poll(() =>
      svg2.evaluate(
        (el) =>
          [...el.querySelectorAll<SVGElement>(".draw")].every(
            (n) => n.style.strokeDashoffset === "",
          ) &&
          [...el.querySelectorAll<SVGElement>(".draw-fade")].every(
            (n) => getComputedStyle(n).opacity === "1",
          ),
      ),
    )
    .toBe(true);
  await moving.close();
});

async function pngSize(request: APIRequestContext, url: string) {
  const response = await request.get(url);
  expect(response.status(), url).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  const body = await response.body();
  return { width: body.readUInt32BE(16), height: body.readUInt32BE(20) };
}

const meta = (html: string, key: string) =>
  html.match(
    new RegExp(`<meta (?:property|name)="${key}" content="([^"]+)"`),
  )?.[1];

for (const [path, title] of [
  ["/", "Farhan Zulkarnain Harahap"],
  ["/about", "About"],
  ["/journey", "Journey"],
  ["/projects", "Projects"],
  ["/contact", "Contact"],
  ["/projects/kasirku", "Kasirku"],
] as const) {
  test(`og:image and twitter:image for ${path} are 1200x630 PNGs with the page's own title`, async ({
    request,
  }) => {
    const html = await initialHtml(request, path);
    const og = meta(html, "og:image");
    const tw = meta(html, "twitter:image");
    expect(og, "og:image").toBeTruthy();
    expect(tw, "twitter:image").toBeTruthy();
    expect(meta(html, "og:title")).toContain(title);
    expect(meta(html, "og:image:width")).toBe("1200");
    expect(meta(html, "og:image:height")).toBe("630");
    expect(meta(html, "twitter:card")).toBe("summary_large_image");
    if (path !== "/") expect(og).toContain(`${path}/opengraph-image`);
    for (const url of [og!, tw!]) {
      const local = url.replace(/^https?:\/\/[^/]+/, "");
      expect(await pngSize(request, local)).toEqual({
        width: 1200,
        height: 630,
      });
    }
  });
}
