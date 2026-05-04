"use client";
import Navbar from "@/components/Navbar";
import HeroCard from "@/components/HeroCard";
import SkillSection from "@/components/SkillSection";
import PortfolioSection from "@/components/ProjectSection"; 
import { FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";
import dynamic from 'next/dynamic';

const AboutSection = dynamic(() => import('@/components/AboutSection'), {
  loading: () => <div className="h-screen flex items-center justify-center text-blue-500 font-black tracking-widest animate-pulse">LOADING...</div>,
  ssr: false 
});

const ContactSection = dynamic(() => import('@/components/ContactSection'), { ssr: false });
const DocSection = dynamic(() => import('@/components/DocSection'), { ssr: false });

export default function Home() {
  return (
    <main className="bg-[#030406] text-white overflow-x-hidden">
      <Navbar />

      {/* SECTION 1: HOME - Tetap min-h-screen agar konten tetap kuat di mobile */}
      <section id="home" className="min-h-screen w-full snap-start shrink-0">
        <HeroCard />
      </section>

      {/* SECTION 2: ABOUT - Gunakan min-h-screen agar konten panjang di mobile tidak terpotong */}
      <section id="about" className="min-h-screen w-full snap-start shrink-0 overflow-hidden flex items-center justify-center px-4 md:px-6">
        <div className="w-full max-w-6xl">
          <AboutSection />
        </div>
      </section>

      {/* SECTION 3: SKILLS */}
      <section id="skills" className="min-h-screen w-full snap-start snap-always relative flex flex-col items-center py-16 md:py-24 xl:py-32 bg-[#030406] px-4 md:px-6">
        <h2 className="relative z-10 text-3xl md:text-5xl font-black mb-8 md:mb-16 uppercase tracking-[0.25em] md:tracking-[0.4em] text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-blue-200 text-center w-full max-w-4xl">
          My Expertise
        </h2>

        <div className="relative z-10 max-w-5xl w-full">
          <SkillSection />
        </div>

        {/* Glow Background - Ukuran lebih kecil di mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-72 md:h-72 bg-blue-600/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      </section>

      {/* SECTION 4: PORTFOLIO */}
      <section id="projects" className="min-h-screen w-full snap-start snap-always flex items-center justify-center px-4 md:px-6 bg-[#030406]">
        <div className="w-full max-w-6xl">
          <PortfolioSection />
        </div>
      </section>

      {/* SECTION 5: DOCUMENTS */}
      <section id="documents" className="min-h-screen w-full snap-start snap-always flex items-center justify-center px-4 md:px-6 bg-[#030406]">
        <div className="w-full max-w-6xl">
          <DocSection />
        </div>
      </section>

      {/* SECTION 6: CONTACT */}
      <section id="contact" className="min-h-screen w-full snap-start snap-always flex items-center justify-center px-4 md:px-6 py-10 md:py-14 bg-[#030406]">
        <div className="w-full max-w-6xl">
          <ContactSection />
        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="w-full snap-start bg-[#030406] flex flex-col items-center justify-center py-10 md:py-16 gap-6 border-t border-white/5 px-4 md:px-6">
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
      </footer>
    </main>
  );
}
