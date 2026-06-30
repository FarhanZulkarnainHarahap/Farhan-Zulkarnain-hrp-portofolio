"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import HeroCard from "@/components/sections/hero/HeroCard";

const CyberBackground = dynamic(() => import("@/components/CyberBackground"), {
  ssr: false,
});
const AboutSection = dynamic(() => import("@/components/sections/about/AboutSection"), {
  loading: () => <SectionBlockSkeleton label="About" />,
});
const ProjectSection = dynamic(() => import("@/components/sections/portfolio/project/ProjectSection"), {
  loading: () => <SectionBlockSkeleton label="Projects" />,
});
const ContactSection = dynamic(() => import("@/components/sections/contact/ContactSection"), {
  loading: () => <SectionBlockSkeleton label="Contact" />,
});

const SectionBlockSkeleton = ({ label }: { label: string }) => (
  <div className="portfolio-section-bg flex min-h-[70svh] w-full items-center justify-center px-6 py-20">
    <div className="w-full max-w-3xl animate-pulse rounded-[28px] border border-blue-500/10 bg-[#07101d]/55 p-8 text-center shadow-[0_24px_80px_rgba(37,99,235,0.08)]">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/70">{label}</p>
      <div className="mx-auto mt-5 h-9 w-64 rounded-2xl bg-white/8" />
      <div className="mx-auto mt-5 h-4 w-full max-w-md rounded-full bg-white/5" />
      <div className="mx-auto mt-3 h-4 w-3/4 max-w-sm rounded-full bg-white/5" />
    </div>
  </div>
);

export default function Home() {
  const pathname = usePathname();

  useEffect(() => {
    const routeTargets: Record<string, string> = {
      "/explore": "about",
      "/projects": "projects",
      "/contact": "contact",
    };
    const targetId = routeTargets[pathname] ?? "home";
    let animationFrame = 0;
    let attempts = 0;

    const scrollToRoute = () => {
      const target = document.getElementById(targetId);

      if (!target) {
        attempts += 1;
        if (attempts < 30) animationFrame = window.requestAnimationFrame(scrollToRoute);
        return;
      }

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    animationFrame = window.requestAnimationFrame(scrollToRoute);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [pathname]);

  return (
    <main
      data-portfolio-root
      className="portfolio-bg relative overflow-x-clip text-white"
    >
      <CyberBackground />
      <div className="relative z-10">
        <section id="home" className="scroll-mt-4">
          <HeroCard />
        </section>
        <AboutSection />
        <ProjectSection />
        <section id="contact" className="portfolio-section-bg relative flex min-h-screen scroll-mt-4 items-center px-0 pb-36 pt-24 md:pb-40 lg:py-28">
          <ContactSection />
        </section>
      </div>
    </main>
  );
}
