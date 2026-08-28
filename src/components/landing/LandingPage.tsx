import MusicPlayerLoader from "@/components/MusicPlayerLoader";
import Navbar from "@/components/Navbar";
import LandingScrollManager from "@/components/landing/LandingScrollManager";
import ThreeBackgroundLoader from "@/components/landing/ThreeBackgroundLoader";
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
  return (
    <>
      <LandingScrollManager initialSection={initialSection} />
      <Navbar />
      <MusicPlayerLoader />
      <main id="main-content" className="portfolio-bg relative min-h-screen overflow-x-clip text-white">
        <ThreeBackgroundLoader />
        <div className="relative z-10">
          <HeroCard />
          <AboutSection />
          <PortfolioSection />
          <JourneySection />
          <ContactSection />
        </div>
      </main>
    </>
  );
}
