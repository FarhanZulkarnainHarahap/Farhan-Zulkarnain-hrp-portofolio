import type { Metadata } from "next";
import CyberBackground from "@/components/CyberBackground";
import MusicPlayer from "@/components/MusicPlayer";
import Navbar from "@/components/Navbar";
import JourneySection from "@/components/sections/journey/JourneySection";

export const metadata: Metadata = {
  title: "Journey",
  description:
    "Farhan Zulkarnain Harahap's development journey, bootcamp, training, internship, and full-stack project milestones.",
  alternates: { canonical: "/journey" },
};

export default function JourneyPage() {
  return (
    <>
      <Navbar />
      <MusicPlayer />
      <main id="main-content" className="portfolio-bg relative min-h-screen overflow-x-clip text-white">
        <CyberBackground />
        <JourneySection />
      </main>
    </>
  );
}
