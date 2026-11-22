import type { MetadataRoute } from "next";
import { getProjectSlug } from "@/lib/portfolio/projects";
import { getCachedProjects } from "@/lib/server/content";

// Read at request time (cached 300 s in content.ts), not frozen at build time.
export const dynamic = "force-dynamic";

const SITE = "https://farhanzulkarnainhrp.com";
const routes = ["", "/about", "/projects", "/journey", "/contact"];

/** Static routes plus every case study (from the same cached project read as the pages). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${SITE}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.72,
  }));
  try {
    const projects = await getCachedProjects();
    const seen = new Set<string>();
    for (const project of projects) {
      const slug = getProjectSlug(project);
      if (seen.has(slug)) continue;
      seen.add(slug);
      const updated = project.updatedAt ?? project.createdAt;
      pages.push({
        url: `${SITE}/projects/${slug}`,
        lastModified:
          updated && !Number.isNaN(Date.parse(updated))
            ? new Date(updated)
            : now,
        changeFrequency: "monthly",
        priority: 0.64,
      });
    }
  } catch {
    // API unavailable: keep the static routes; the next regeneration adds the case studies.
  }
  return pages;
}
