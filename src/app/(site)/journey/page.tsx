import type { Metadata } from "next";
import { connection } from "next/server";
import { Timeline } from "@/components/journey/Timeline";
import { NextSteps } from "@/components/site/NextSteps";
import { PageHeader } from "@/components/site/PageHeader";
import { loadExperiences } from "@/lib/server/content";

export const metadata: Metadata = {
  title: "Journey",
  description:
    "Work experience and learning path of Farhan Zulkarnain Harahap, full-stack engineer.",
  alternates: { canonical: "/journey" },
};

/** Full timeline from /api/experiences (no hardcoded milestones, decision §8.1). */
export default async function JourneyPage() {
  await connection();
  const experiences = await loadExperiences();
  return (
    <main id="main-content" className="flex-1">
      <PageHeader
        eyebrow="Journey"
        title="Experience & learning"
        lead="Roles, training, and projects that shaped how I build software."
      />
      <Timeline initial={experiences} />
      <NextSteps
        title="Next: see the projects."
        primary={{ href: "/projects", label: "See the projects" }}
      />
    </main>
  );
}
