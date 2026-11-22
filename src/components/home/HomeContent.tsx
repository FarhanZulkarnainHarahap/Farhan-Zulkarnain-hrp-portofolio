"use client";
import { useCollection } from "@/hooks/useCollection";
import { countTechnologies } from "@/lib/display/skills";
import { topStack } from "@/lib/display/projects";
import type { Project } from "@/services/api";
import type { Experience, Skill } from "@/types/content";
import { ContactBand } from "./ContactBand";
import { Hero, type HeroProof } from "./Hero";
import { HowIWork } from "./HowIWork";
import { JourneyPreview } from "./JourneyPreview";
import { SelectedWork } from "./SelectedWork";
import { StackSummary } from "./StackSummary";

/** Home page body. Each API collection is fetched once and shared by the sections that use it. */
export function HomeContent() {
  const projects = useCollection<Project>("/api/portofolios");
  const skills = useCollection<Skill>("/api/skills");
  const experiences = useCollection<Experience>("/api/experiences");

  const proof: HeroProof =
    projects.loading || skills.loading
      ? "loading"
      : projects.error && skills.error
        ? null
        : {
            projects: projects.error ? 0 : projects.data.length,
            technologies: skills.error ? 0 : countTechnologies(skills.data),
            stack:
              projects.error || skills.error
                ? []
                : topStack(skills.data, projects.data, 3),
          };

  return (
    <main id="main-content" className="flex-1">
      <Hero proof={proof} />
      <SelectedWork state={projects} />
      <StackSummary state={skills} />
      <JourneyPreview state={experiences} />
      <HowIWork />
      <ContactBand />
    </main>
  );
}
