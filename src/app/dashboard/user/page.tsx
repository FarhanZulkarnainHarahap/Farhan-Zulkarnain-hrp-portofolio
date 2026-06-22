"use client";

import HeroCard from "@/components/sections/hero/HeroCard";
import AboutSection from "@/components/sections/about/AboutSection";
import SkillSection from "@/components/sections/skill/SkillSection";
import ProjectSection from "@/components/sections/portfolio/project/ProjectSection";
import DocSection from "@/components/sections/document/DocSection";
import SocialProofSection from "@/components/sections/social/SocialProofSection";
import ContactSection from "@/components/sections/contact/ContactSection";
import AntiGravity from "@/components/AntiGravity";

export default function Home() {
  return (
    <main className="portfolio-bg relative text-white">
      <AntiGravity />
      <div className="relative z-10">
        <HeroCard />
        <AboutSection />
      </div>
      <section id="skills" className="portfolio-section-bg relative z-10 mx-auto w-full max-w-7xl px-6 py-20 md:px-12 md:py-24">
        <div className="mb-10 text-center">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-blue-400">My Expertise</p>
          <h2 className="text-4xl font-black uppercase leading-none text-white md:text-6xl">
            Skills <span className="text-blue-500">Database.</span>
          </h2>
        </div>
        <SkillSection />
      </section>
      <div className="relative z-10">
        <ProjectSection />
        <DocSection />
        <SocialProofSection />
      </div>
      <section id="contact" className="portfolio-section-bg relative z-10 px-0 py-20 md:py-24">
        <ContactSection />
      </section>
    </main>
  );
}
