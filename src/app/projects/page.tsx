import type { Metadata } from "next";
import CyberBackground from "@/components/CyberBackground";
import MusicPlayer from "@/components/MusicPlayer";
import Navbar from "@/components/Navbar";
import PortfolioSection from "@/components/sections/portfolio/project/ProjectSection";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected full-stack projects by Farhan Zulkarnain Harahap, including case studies, live demos, source code, and technology stacks.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <MusicPlayer />
      <main id="main-content" className="portfolio-bg relative min-h-screen overflow-x-clip text-white">
        <CyberBackground />
        <PortfolioSection />
      </main>
    </>
  );
}
