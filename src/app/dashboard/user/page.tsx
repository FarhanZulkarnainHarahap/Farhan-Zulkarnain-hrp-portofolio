"use client";

import { useEffect, useRef } from "react";
import HeroCard from "@/components/sections/hero/HeroCard";
import AboutSection from "@/components/sections/about/AboutSection";
import SkillSection from "@/components/sections/skill/SkillSection";
import ProjectSection from "@/components/sections/portfolio/project/ProjectSection";
import DocSection from "@/components/sections/document/DocSection";
import SocialProofSection from "@/components/sections/social/SocialProofSection";
import ContactSection from "@/components/sections/contact/ContactSection";
import AntiGravity from "@/components/AntiGravity";

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const media = window.matchMedia("(min-width: 1024px)");

    const handleWheel = (event: WheelEvent) => {
      if (!media.matches || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();
      stage.scrollBy({ left: event.deltaY, behavior: "smooth" });
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      stage.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <main
      ref={stageRef}
      data-horizontal-stage
      className="portfolio-bg relative text-white lg:h-screen lg:overflow-x-auto lg:overflow-y-hidden lg:snap-x lg:snap-mandatory"
    >
      <AntiGravity />
      <div className="relative z-10 lg:flex lg:w-max">
        <section id="home" className="lg:h-screen lg:w-screen lg:shrink-0 lg:snap-center lg:overflow-hidden">
          <HeroCard />
        </section>
        <div className="lg:h-screen lg:w-screen lg:shrink-0 lg:snap-center lg:overflow-hidden">
        <AboutSection />
      </div>
        <section id="skills" className="portfolio-section-bg mx-auto w-full max-w-7xl px-6 py-20 md:px-12 md:py-24 lg:flex lg:h-screen lg:w-screen lg:max-w-none lg:shrink-0 lg:snap-center lg:flex-col lg:items-center lg:justify-center lg:overflow-hidden lg:px-16 lg:pb-32 lg:pt-18">
          <div className="mb-10 text-center lg:mb-6">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-blue-400 lg:mb-3 lg:text-[9px]">My Expertise</p>
            <h2 className="text-4xl font-black uppercase leading-none text-white md:text-6xl lg:text-5xl">
              Skills<span className="text-blue-500">.</span>
            </h2>
          </div>
          <SkillSection />
        </section>
        <div className="lg:h-screen lg:w-screen lg:shrink-0 lg:snap-center lg:overflow-hidden">
          <ProjectSection />
        </div>
        <div className="lg:h-screen lg:w-screen lg:shrink-0 lg:snap-center lg:overflow-hidden">
          <DocSection />
        </div>
        <div className="lg:h-screen lg:w-screen lg:shrink-0 lg:snap-center lg:overflow-hidden">
          <SocialProofSection />
        </div>
        <section id="contact" className="portfolio-section-bg px-0 py-20 md:py-24 lg:flex lg:h-screen lg:w-screen lg:shrink-0 lg:snap-center lg:items-center lg:justify-center lg:overflow-hidden lg:py-0">
          <ContactSection />
        </section>
      </div>
    </main>
  );
}
