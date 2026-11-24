import type { Metadata } from "next";
import { connection } from "next/server";
import { ContactBand } from "@/components/home/ContactBand";
import { Hero, type HeroProof } from "@/components/home/Hero";
import { HowIWork } from "@/components/home/HowIWork";
import { FlyThrough } from "@/components/flythrough/FlyThrough";
import { JourneyPreview } from "@/components/home/JourneyPreview";
import { SelectedWork } from "@/components/home/SelectedWork";
import { StackSummary } from "@/components/home/StackSummary";
import { topStack } from "@/lib/display/projects";
import { countTechnologies } from "@/lib/display/skills";
import { getHomeContent } from "@/lib/server/content";

// Title/description come from the root defaults (docs/COPY.md → Global).
export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Rendered on the server per request from cached API reads (unstable_cache, 300 s), so project
 * titles, skills and experience are in the initial HTML. Each collection is read once and
 * shared; a failed collection only affects its own section.
 */
export default async function HomePage() {
  await connection();
  const { projects, skills, experiences } = await getHomeContent();

  const proof: HeroProof =
    projects.error && skills.error
      ? null
      : {
          projects: projects.data.length,
          technologies: countTechnologies(skills.data),
          stack: topStack(skills.data, projects.data, 3),
        };

  return (
    <main id="main-content" className="flex-1">
      <Hero proof={proof} />
      <FlyThrough />
      {/* Below the fly-through (≥ 7.8 screens down): rendering is skipped until near the viewport
          (content-visibility, Fase 12.1), so the first paint does not lay out, or fetch fonts for,
          sections nobody can see yet. */}
      <div className="defer-render">
        <SelectedWork initial={projects} />
      </div>
      <div className="defer-render">
        <StackSummary initial={skills} />
      </div>
      <div className="defer-render">
        <JourneyPreview initial={experiences} />
      </div>
      <div className="defer-render">
        <HowIWork />
      </div>
      <div className="defer-render">
        <ContactBand />
      </div>
    </main>
  );
}
