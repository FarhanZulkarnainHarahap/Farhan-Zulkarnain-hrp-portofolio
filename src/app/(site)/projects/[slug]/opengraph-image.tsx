import { splitCaseType } from "@/lib/display/projects";
import {
  imageDataUrl,
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOg,
} from "@/lib/og/render";
import { findProjectBySlug } from "@/lib/portfolio/projects";
import { getCachedProjects } from "@/lib/server/content";

export const alt = "Case study by Farhan Zulkarnain Harahap";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Case study card: title, case type badges and the project image (text-only fallback). */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let project = null;
  try {
    project = findProjectBySlug(await getCachedProjects(), slug) ?? null;
  } catch {
    project = null;
  }
  if (!project)
    return renderOg({
      eyebrow: "Case study",
      title: "Projects",
      description: "Web applications built end to end.",
    });
  return renderOg({
    eyebrow: "Case study",
    title: project.title.trim(),
    description: project.description,
    badges: splitCaseType(project.caseType),
    image: await imageDataUrl(project.imageUrl),
  });
}
