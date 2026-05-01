"use client";
import Navbar from "@/components/Navbar";
import HeroCard from "@/components/HeroCard";
import SkillSection from "@/components/SkillSection";
import PortfolioSection from "@/components/ProjectSection"; 
import { FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";
// Hapus import icon HiOutline karena sudah dihandle di dalam SkillSection
import dynamic from 'next/dynamic';

const AboutSection = dynamic(() => import('@/components/AboutSection'), {
  loading: () => <div className="h-screen flex items-center justify-center text-blue-500 font-black tracking-widest animate-pulse">LOADING...</div>,
  ssr: false 
});

const ContactSection = dynamic(() => import('@/components/ContactSection'), { ssr: false });
const DocSection = dynamic(() => import('@/components/DocSection'), { ssr: false });

export default function Home() {
  return (
    <main className="bg-[#030406] text-white">
      {/* SECTION 1: HOME */}
      <section id="home" className="h-screen w-full snap-start">
        <HeroCard />
      </section>

      {/* SECTION 2: ABOUT */}
      <section id="about" className="h-screen w-full snap-start overflow-hidden">
        <AboutSection />
      </section>

      {/* SECTION 3: SKILLS - SEKARANG JADI SATU KOLOM KE BAWAH */}
      <section id="skills" className="min-h-screen w-full snap-start snap-always relative flex flex-col items-center py-24 bg-[#030406] overflow-visible">
        <h2 className="relative z-10 text-3xl md:text-5xl font-black mb-10 uppercase tracking-[0.4em] text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-blue-200">
          My Expertise
        </h2>

        {/* 
            PERBAIKAN DI SINI: 
            Hapus div Grid, panggil SkillSection cukup satu kali saja.
            Komponen ini akan otomatis mengambil data dari API dan 
            membaginya menjadi baris Frontend, Backend, dan Tools ke bawah.
        */}
        <div className="relative z-10 max-w-5xl w-full px-6">
          <SkillSection />
        </div>

        {/* Glow Background dekoratif */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* SECTION 4: PORTFOLIO */}
      <PortfolioSection />

      {/* SECTION 5: DOCUMENTS */}
      <section id="documents" className="h-screen w-full snap-start snap-always flex items-center justify-center p-6 bg-[#030406]">
        <DocSection />
      </section>

      {/* SECTION 6: CONTACT */}
      <section id="contact" className="min-h-screen w-full snap-start snap-always flex items-center justify-center p-6 bg-[#030406]">
        <div className="w-full max-w-5xl">
          <ContactSection />
        </div>
      </section>

      {/* SECTION 7: FOOTER SEPARATE */}
      <section className="w-full snap-start bg-[#030406] flex flex-col items-center justify-center py-12 gap-6 border-t border-white/5">
        <div className="flex gap-6 text-gray-600">
          <FaLinkedin size={22} className="hover:text-blue-500 transition-colors cursor-pointer" /> 
          <FaInstagram size={22} className="hover:text-pink-500 transition-colors cursor-pointer" /> 
          <FaGithub size={22} className="hover:text-white transition-colors cursor-pointer" />
        </div>

        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase text-gray-600 font-bold leading-loose">
            © 2026 Farhan Zulkarnain Harahap <br className="md:hidden" />
            <span className="hidden md:inline"> | </span> 
            Creative Web Developer
          </div>

          {/* Badge Status */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            OPEN FOR NEW OPPORTUNITIES
          </div>
        </div>
      </section>
    </main>
  );
}
