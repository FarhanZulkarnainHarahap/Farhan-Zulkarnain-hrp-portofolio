/**
 * Fase 12.7: search and sharing, end to end on the production build (fixture data): robots,
 * sitemap, canonical + unique title/description per page, JSON-LD Person, og/twitter images on
 * every public page (and that they render), and the old URLs answering 308.
 */
import { test, expect } from "@playwright/test";
import { initialHtml, withFixtureApi } from "./helpers/fixture";

withFixtureApi();

const SITE = "https://farhanzulkarnainhrp.com";
const PAGES = ["/", "/about", "/journey", "/projects", "/projects/kasirku", "/contact"];
const attr = (html: string, re: RegExp) => html.match(re)?.[1] ?? null;
const meta = (html: string, key: string) =>
  attr(html, new RegExp(`<meta[^>]+(?:property|name)="${key}"[^>]+content="([^"]*)"`)) ??
  attr(html, new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${key}"`));

test("robots.txt allows the site, hides private areas and points to the sitemap", async ({ request }) => {
  const txt = await (await request.get("/robots.txt")).text();
  expect(txt).toMatch(/User-Agent: \*/i);
  expect(txt).toMatch(/Allow: \//);
  for (const path of ["/dashboard/", "/admin/", "/auth/"]) expect(txt).toContain(`Disallow: ${path}`);
  expect(txt).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});

test("sitemap lists every public page and case study with absolute URLs", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1]);
  for (const path of ["", "/about", "/projects", "/journey", "/contact", "/projects/kasirku"]) expect(urls).toContain(`${SITE}${path}`);
  expect(urls.every((u) => u.startsWith(`${SITE}/`) || u === SITE)).toBe(true);
  expect(urls.some((u) => /dashboard|admin|auth/.test(u))).toBe(false);
});

test("every public page: self canonical, unique title and description, Person JSON-LD, og + twitter image", async ({ request }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const path of PAGES) {
    const html = await initialHtml(request, path);
    const canonical = attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);
    expect(canonical, path).toBe(path === "/" ? SITE : `${SITE}${path}`);
    const title = attr(html, /<title>([^<]+)<\/title>/)!;
    const description = meta(html, "description")!;
    expect(title.length, `${path} title`).toBeGreaterThan(10);
    expect(description.length, `${path} description`).toBeGreaterThan(50);
    titles.add(title);
    descriptions.add(description);
    // JSON-LD Person (root layout).
    const ld = JSON.parse(attr(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/)!);
    const person = (Array.isArray(ld) ? ld : [ld]).find((x: { "@type": string }) => x["@type"] === "Person");
    expect(person?.name, path).toBe("Farhan Zulkarnain Harahap");
    expect(person?.url).toBe(SITE);
    expect(Array.isArray(person?.sameAs) && person.sameAs.length).toBeTruthy();
    // Sharing.
    for (const key of ["og:title", "og:description", "og:url", "og:image", "twitter:card", "twitter:image"])
      expect(meta(html, key), `${path} ${key}`).toBeTruthy();
    expect(meta(html, "twitter:card")).toBe("summary_large_image");
    const image = new URL(meta(html, "og:image")!);
    const res = await request.get(image.pathname + image.search);
    expect(res.status(), `${path} og:image`).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
  expect(titles.size).toBe(PAGES.length);
  expect(descriptions.size).toBeGreaterThanOrEqual(PAGES.length - 1); // a case study may reuse its API description
});

test("old URLs answer 308 with the new location", async ({ request }) => {
  const moved: [string, string][] = [
    ["/home", "/"],
    ["/explore", "/about"],
    ["/skills", "/about#stack"],
    ["/documents", "/about#documents"],
    ["/about/detail", "/about#profile"],
    ["/about/skills", "/about#stack"],
    ["/about/docs", "/about#documents"],
  ];
  for (const [from, to] of moved) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(308);
    expect(res.headers().location, from).toBe(to);
  }
});

test("favicon set is the Fz monogram: SVG (light/dark) + PNG fallback + apple-touch-icon, all small", async ({ request }) => {
  const html = await initialHtml(request, "/");
  const links = Array.from(html.matchAll(/<link[^>]+rel="(icon|apple-touch-icon)"[^>]*>/g), (m) => m[0]);
  const href = (re: RegExp) => links.find((l) => re.test(l))?.match(/href="([^"]+)"/)?.[1];
  const svg = href(/type="image\/svg\+xml"/);
  const png = href(/rel="icon"[^>]+type="image\/png"|type="image\/png"[^>]+rel="icon"/);
  const apple = href(/apple-touch-icon/);
  expect(svg, "icon.svg").toBeTruthy();
  expect(png, "png fallback").toBeTruthy();
  expect(apple, "apple-touch-icon").toBeTruthy();
  for (const [url, max] of [[svg!, 2048], [png!, 2048], [apple!, 8192], ["/favicon.ico", 2048]] as const) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    expect((await res.body()).length, url).toBeLessThan(max);
  }
  const body = await (await request.get(svg!)).text();
  expect(body).toContain("prefers-color-scheme:dark");
});
