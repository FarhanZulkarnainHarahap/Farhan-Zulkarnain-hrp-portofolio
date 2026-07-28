"use client";

import { useEffect } from "react";
import CyberBackground from "@/components/CyberBackground";
import MusicPlayer from "@/components/MusicPlayer";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/sections/about/AboutSection";
import ContactSection from "@/components/sections/contact/ContactSection";
import HeroCard from "@/components/sections/hero/HeroCard";
import JourneySection from "@/components/sections/journey/JourneySection";
import PortfolioSection from "@/components/sections/portfolio/project/ProjectSection";

type LandingSection = "home" | "about" | "projects" | "journey" | "contact";

export default function LandingPage({
  initialSection = "home",
}: {
  initialSection?: LandingSection;
}) {
  useEffect(() => {
    if (initialSection === "home") {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(initialSection)?.scrollIntoView({
        block: "start",
        behavior: "auto",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialSection]);

  return (
    <>
      <Navbar />
      <MusicPlayer />
      <main id="main-content" className="portfolio-bg relative min-h-screen overflow-x-clip text-white">
        <CyberBackground />
        <HeroCard />
        <AboutSection />
        <PortfolioSection />
        <JourneySection />
        <ContactSection />
      </main>
    </>
  );
}
