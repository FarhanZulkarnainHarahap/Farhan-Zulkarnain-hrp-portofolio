import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected full-stack projects by Farhan Zulkarnain Harahap, including case studies, live demos, source code, and technology stacks.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return <LandingPage initialSection="projects" />;
}
