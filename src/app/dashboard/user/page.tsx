"use client";
import { motion } from "framer-motion";
import HeroCard from "@/components/sections/hero/HeroCard";
import AboutSection from "@/components/sections/about/AboutSection";
import SkillSection from "@/components/sections/skill/SkillSection";
import PortfolioSection from "@/components/sections/portfolio/project/ProjectSection";
import DocSection from "@/components/sections/document/DocSection";
import SocialProofSection from "@/components/sections/social/SocialProofSection";
import ContactSection from "@/components/sections/contact/ContactSection";
import { FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";

const sectionMotion = {
  initial: { opacity: 0, y: 42, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] as const },
};

const sectionClass = "portfolio-section-bg min-h-screen w-full";

export default function Home() {
  return (
    <main className="portfolio-bg text-white overflow-x-hidden">
      {/* SECTION 1: HOME */}
      <motion.section id="home" data-cursor-label="HOME" className={`${sectionClass} shrink-0`} {...sectionMotion}>
        <HeroCard />
      </motion.section>

      {/* SECTION 2: ABOUT */}
      <motion.section id="about" data-cursor-label="ABOUT" className={`${sectionClass} shrink-0 overflow-hidden flex items-center justify-center px-4 md:px-6`} {...sectionMotion}>
        <div className="w-full max-w-6xl">
          <AboutSection />
        </div>
      </motion.section>

      {/* SECTION 3: SKILLS */}
      <motion.section id="skills" data-cursor-label="SKILLS" className={`${sectionClass} relative flex flex-col items-center py-16 md:py-24 xl:py-32 px-4 md:px-6`} {...sectionMotion}>
        <h2 className="relative z-10 text-3xl md:text-5xl font-black mb-8 md:mb-16 uppercase tracking-[0.25em] md:tracking-[0.4em] text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-blue-200 text-center w-full max-w-4xl">
          My Expertise
        </h2>

        <div className="relative z-10 max-w-5xl w-full">
          <SkillSection />
        </div>

        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-72 md:h-72 bg-blue-600/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      </motion.section>

      {/* SECTION 4: PORTFOLIO */}
      <motion.section id="projects" data-cursor-label="PROJECTS" className={`${sectionClass} flex items-center justify-center px-4 md:px-6`} {...sectionMotion}>
        <div className="w-full max-w-6xl">
          <PortfolioSection />
        </div>
      </motion.section>

      {/* SECTION 5: DOCUMENTS */}
      <motion.section id="documents" data-cursor-label="DOCS" className={`${sectionClass} flex items-center justify-center px-4 md:px-6`} {...sectionMotion}>
        <div className="w-full max-w-6xl">
          <DocSection />
        </div>
      </motion.section>

      {/* SECTION 6: PROOF */}
      <motion.section id="proof" data-cursor-label="PROOF" className="portfolio-section-bg w-full" {...sectionMotion}>
        <SocialProofSection />
      </motion.section>

      {/* SECTION 7: CONTACT */}
      <motion.section id="contact" data-cursor-label="CONTACT" className={`${sectionClass} flex items-center justify-center px-4 md:px-6 py-10 md:py-14`} {...sectionMotion}>
        <div className="w-full max-w-6xl">
          <ContactSection />
        </div>
      </motion.section>

      {/* SECTION 8: FOOTER */}
      <motion.footer data-cursor-label="FARHAN" className="portfolio-section-bg w-full flex flex-col items-center justify-center py-10 md:py-16 gap-6 px-4 md:px-6" {...sectionMotion}>
        <div className="flex flex-wrap justify-center gap-6 text-gray-500">
          <FaLinkedin size={24} href="https://www.linkedin.com/in/farhan-zulkarnain-71801a347?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" className="hover:text-blue-500 transition-all cursor-pointer hover:scale-110" /> 
          <FaInstagram size={24} href="https://www.instagram.com/farhan.nexxus?igsh=bmw4cmI4djQzeTN1" className="hover:text-pink-500 transition-all cursor-pointer hover:scale-110" /> 
          <FaGithub size={24} href="https://github.com/FarhanZulkarnainHarahap" className="hover:text-white transition-all cursor-pointer hover:scale-110" />
        </div>

        <div className="flex flex-col items-center gap-4 text-center max-w-2xl">
          <p className="text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.4em] uppercase text-gray-500 font-bold leading-relaxed">
            © 2026 Farhan Zulkarnain Harahap
            <span className="hidden md:inline mx-2">|</span>
            <br className="md:hidden" />
            Creative Web Developer
          </p>

          <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-gray-400 font-bold bg-white/5 px-5 py-2.5 rounded-full border border-white/10 tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AVAILABLE FOR PROJECTS
          </div>
        </div>
      </motion.footer>
    </main>
  );
}
