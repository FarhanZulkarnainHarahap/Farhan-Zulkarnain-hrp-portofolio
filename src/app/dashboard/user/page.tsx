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

      {/* SECTION 6: CONTACT & FOOTER */}
      <section id="contact" className="h-screen w-full snap-start snap-always relative flex flex-col items-center justify-center p-6 bg-[#030406]">
        <div className="w-full max-w-5xl mb-24">
          <ContactSection />
        </div>

        <footer className="absolute bottom-10 w-full flex flex-col items-center gap-4">
          <div className="flex gap-6 text-gray-600">
            <FaLinkedin size={22} className="hover:text-blue-500 transition-colors cursor-pointer" /> 
            <FaInstagram size={22} className="hover:text-pink-500 transition-colors cursor-pointer" /> 
            <FaGithub size={22} className="hover:text-white transition-colors cursor-pointer" />
          </div>
          <div className="text-[8px] md:text-[10px] tracking-[0.5em] uppercase text-gray-700 font-bold text-center px-4">
            © 2026 Farhan Zulkarnain Harahap Creative Web Developer
          </div>
        </footer>
      </section>
    </main>
  );
}
