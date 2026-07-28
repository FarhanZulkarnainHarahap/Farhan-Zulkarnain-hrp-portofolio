import type { MetadataRoute } from "next";

const routes = ["", "/home", "/explore", "/skills", "/projects", "/journey", "/documents", "/contact", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `https://farhanzulkarnainhrp.com${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/home" ? "weekly" : "monthly",
    priority: route === "" || route === "/home" ? 1 : 0.72,
  }));
}
