import type { MetadataRoute } from "next";

const routes = [
  "",
  "/about",
  "/about/detail",
  "/about/skills",
  "/about/docs",
  "/projects",
  "/journey",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `https://farhanzulkarnainhrp.com${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.72,
  }));
}
