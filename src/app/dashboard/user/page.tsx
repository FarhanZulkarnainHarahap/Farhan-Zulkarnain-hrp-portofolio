"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import HeroCard from "@/components/sections/hero/HeroCard";

const AboutSection = dynamic(() => import("@/components/sections/about/AboutSection"), {
  loading: () => <SectionBlockSkeleton label="About" />,
});
const SkillSection = dynamic(() => import("@/components/sections/skill/SkillSection"), {
  loading: () => <SectionBlockSkeleton label="Skills" />,
});
const ProjectSection = dynamic(() => import("@/components/sections/portfolio/project/ProjectSection"), {
  loading: () => <SectionBlockSkeleton label="Projects" />,
});
const DocSection = dynamic(() => import("@/components/sections/document/DocSection"), {
  loading: () => <SectionBlockSkeleton label="Documents" />,
});
const ContactSection = dynamic(() => import("@/components/sections/contact/ContactSection"), {
  loading: () => <SectionBlockSkeleton label="Contact" />,
});

const SectionBlockSkeleton = ({ label }: { label: string }) => (
  <div className="portfolio-section-bg flex min-h-[70svh] w-full items-center justify-center px-6 py-20 lg:h-screen lg:w-screen">
    <div className="w-full max-w-3xl animate-pulse rounded-[28px] border border-blue-500/10 bg-[#07101d]/55 p-8 text-center shadow-[0_24px_80px_rgba(37,99,235,0.08)]">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/70">{label}</p>
      <div className="mx-auto mt-5 h-9 w-64 rounded-2xl bg-white/8" />
      <div className="mx-auto mt-5 h-4 w-full max-w-md rounded-full bg-white/5" />
      <div className="mx-auto mt-3 h-4 w-3/4 max-w-sm rounded-full bg-white/5" />
    </div>
  </div>
);

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
      <div className="relative z-10 lg:flex lg:w-max">
        <section id="home" className="lg:h-screen lg:w-screen lg:shrink-0 lg:snap-center lg:overflow-hidden">
          <HeroCard />
        </section>
        <div className="lg:h-screen lg:w-screen lg:shrink-0 lg:snap-center lg:overflow-hidden">
        <AboutSection />
      </div>
        <section id="skills" className="portfolio-section-bg mx-auto w-full max-w-7xl px-5 pb-34 pt-16 sm:px-7 md:px-12 md:py-24 lg:flex lg:h-screen lg:w-screen lg:max-w-none lg:shrink-0 lg:snap-center lg:flex-col lg:items-center lg:justify-center lg:overflow-hidden lg:px-16 lg:pb-28 lg:pt-14">
          <div className="mb-9 text-left sm:text-center lg:mb-6">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-blue-400 sm:tracking-[0.45em] lg:mb-3 lg:text-[9px]">My Expertise</p>
            <h2 className="text-5xl font-black uppercase leading-none text-white sm:text-6xl lg:text-4xl">
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
        <section id="contact" className="portfolio-section-bg px-0 py-20 md:py-24 lg:flex lg:h-screen lg:w-screen lg:shrink-0 lg:snap-center lg:items-center lg:justify-center lg:overflow-hidden lg:py-0">
          <ContactSection />
        </section>
      </div>
    </main>
  );
}
