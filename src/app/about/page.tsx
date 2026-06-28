"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  LuCalendarDays,
  LuCodeXml,
  LuFileText,
  LuMapPin,
  LuPanelsTopLeft,
  LuUser,
} from "react-icons/lu";
import { FaGithub, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import SkillSection from "@/components/sections/skill/SkillSection";
import DocSection from "@/components/sections/document/DocSection";
import { getOptimizedImageUrl } from "@/lib/image";

const profileImage = getOptimizedImageUrl(
  "https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg",
  1000,
);

const journeySections = [
  { id: "about-overview", number: "01", label: "About Me", icon: LuUser },
  { id: "about-skills", number: "02", label: "Skills", icon: LuCodeXml },
  { id: "about-documents", number: "03", label: "Documents", icon: LuFileText },
];

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/farhan-zulkarnain-71801a347",
    icon: FaLinkedinIn,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/farhan.nexxus",
    icon: FaInstagram,
  },
  {
    label: "GitHub",
    href: "https://github.com/FarhanZulkarnainHarahap",
    icon: FaGithub,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/6281958169283",
    icon: FaWhatsapp,
  },
];

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("about-overview");

  useEffect(() => {
    const sections = journeySections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    window.history.replaceState(null, "", "/about");

    const storedTarget = window.sessionStorage.getItem("about:target");
    if (storedTarget && journeySections.some(({ id }) => id === storedTarget)) {
      window.sessionStorage.removeItem("about:target");
      window.requestAnimationFrame(() => {
        document.getElementById(storedTarget)?.scrollIntoView({ block: "start" });
        setActiveSection(storedTarget);
      });
    }

    const updateActiveSection = () => {
      const target = sections
        .map((section) => ({
          id: section.id,
          distance: Math.abs(section.getBoundingClientRect().top - window.innerHeight * 0.28),
        }))
        .sort((a, b) => a.distance - b.distance)[0];

      if (target) setActiveSection(target.id);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  const goToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "/about");
  };

  return (
    <>
      <Navbar />
      <main className="portfolio-bg min-h-screen overflow-x-hidden text-white">
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-42 border-r border-blue-500/25 bg-[#030711]/88 px-5 py-7 backdrop-blur-xl xl:flex xl:flex-col">
          <button
            type="button"
            onClick={() => goToSection("about-overview")}
            aria-label="Go to About Me"
            className="mx-auto grid h-20 w-20 place-items-center border border-blue-400/60 bg-blue-500/8 text-3xl font-black italic text-white shadow-[0_0_28px_rgba(37,99,235,0.35),inset_0_0_22px_rgba(37,99,235,0.12)] [clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]"
          >
            N
          </button>

          <nav className="relative mt-12" aria-label="About page sections">
            <span className="absolute bottom-5 left-[10px] top-5 w-px bg-linear-to-b from-blue-400 via-blue-500/45 to-zinc-700" />
            <ul className="space-y-8">
              {journeySections.map(({ id, number, label }) => {
                const isActive = activeSection === id;
                return (
                  <li key={id} className="relative">
                    <button
                      type="button"
                      onClick={() => goToSection(id)}
                      className={`group flex w-full items-center gap-3 text-left transition-colors ${
                        isActive ? "text-blue-400" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <span
                        className={`relative z-10 h-5 w-5 shrink-0 rounded-full border-[3px] bg-[#030711] transition-all ${
                          isActive
                            ? "border-white shadow-[0_0_0_4px_#1677ff,0_0_20px_#1677ff]"
                            : "border-zinc-500 group-hover:border-blue-400"
                        }`}
                      />
                      <span>
                        <span className="block text-xs font-black">{number}</span>
                        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.09em]">
                          {label}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto grid gap-2">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-lg border border-blue-500/25 bg-blue-500/5 text-zinc-300 transition-all hover:border-blue-400 hover:bg-blue-500/15 hover:text-white"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </aside>

        <div className="relative xl:ml-42">
          <div className="sticky top-0 z-40 border-b border-blue-500/20 bg-[#030711]/90 px-4 py-3 backdrop-blur-xl xl:hidden">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-[0.24em] text-white">
                Nexxus <span className="text-blue-400">Journey</span>
              </span>
              <div className="flex gap-1">
                {journeySections.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => goToSection(id)}
                    aria-label={label}
                    className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${
                      activeSection === id
                        ? "border-blue-400 bg-blue-500/20 text-blue-300"
                        : "border-white/8 bg-white/3 text-zinc-500"
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <section
            id="about-overview"
            className="about-detail-section relative flex min-h-[100svh] scroll-mt-16 items-center px-5 pb-32 pt-18 sm:px-8 lg:px-14 lg:pb-52 xl:scroll-mt-0 xl:px-18 xl:pb-56"
          >
            <div className="pointer-events-none absolute right-[6%] top-[12%] h-48 w-48 bg-[radial-gradient(circle,#3b82f6_1px,transparent_1.5px)] bg-size-[14px_14px] opacity-20" />
            <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-400">
                  01 <span className="ml-2">About Me</span>
                </p>
                <h1 className="mt-8 text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl">
                  About <span className="text-blue-500">Me</span>
                </h1>
                <div className="mt-7 h-px w-full max-w-lg bg-linear-to-r from-blue-500 via-blue-500/30 to-transparent" />

                <h2 className="mt-8 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  Hi, I&apos;m <span className="text-blue-400">Farhan Zulkarnain.</span>
                </h2>
                <p className="mt-2 text-lg font-bold text-blue-500">Full-stack Developer</p>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                  I&apos;m a passionate Full-stack Developer based in Medan, Indonesia. I turn
                  complex problems into simple, polished, and user-friendly digital products—built
                  with thoughtful interfaces and dependable backend systems.
                </p>

                <div className="mt-8 grid max-w-2xl grid-cols-2 overflow-hidden rounded-2xl border border-blue-500/25 bg-[#07101c]/65 shadow-[inset_0_0_30px_rgba(37,99,235,0.05)] lg:mt-6">
                  {[
                    { icon: LuCalendarDays, label: "Experience", value: "2+ Years" },
                    { icon: LuCodeXml, label: "Technologies", value: "20+" },
                    { icon: LuMapPin, label: "Location", value: "Medan, Indonesia" },
                    { icon: LuPanelsTopLeft, label: "Focus", value: "Frontend & Backend" },
                  ].map(({ icon: Icon, label, value }, index) => (
                    <div
                      key={label}
                      className={`flex min-h-20 items-center gap-3 p-4 ${
                        index % 2 === 0 ? "border-r border-blue-500/16" : ""
                      } ${index < 2 ? "border-b border-blue-500/16" : ""}`}
                    >
                      <Icon className="shrink-0 text-blue-500" size={26} />
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                          {label}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-zinc-100 sm:text-sm">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-auto w-full max-w-md">
                <div className="about-cyber-frame relative p-3">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#08101d]">
                    <Image
                      src={profileImage}
                      alt="Farhan Zulkarnain"
                      fill
                      priority
                      sizes="(max-width: 1024px) 88vw, 440px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#02050b]/45 via-transparent to-blue-500/6" />
                  </div>
                  <span className="absolute -left-1 top-1/3 h-20 w-1 bg-blue-500 shadow-[0_0_18px_#3b82f6]" />
                  <span className="absolute -right-1 top-1/3 h-20 w-1 bg-blue-500 shadow-[0_0_18px_#3b82f6]" />
                </div>
              </div>
            </div>
          </section>

          <section
            id="about-skills"
            className="about-detail-section relative min-h-[100svh] scroll-mt-16 px-5 pb-36 pt-20 sm:px-8 lg:px-14 xl:scroll-mt-0 xl:px-18"
          >
            <div className="mx-auto w-full max-w-6xl">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-400">
                02 <span className="ml-2">My Skills</span>
              </p>
              <h2 className="mt-7 text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl">
                My Skills &amp; <span className="text-blue-500">Expertise</span>
              </h2>
              <p className="mt-7 max-w-5xl text-sm leading-7 text-zinc-400 sm:text-base">
                I build modern, scalable web applications from interface to API. My daily toolkit
                spans TypeScript, React, Next.js, Node.js, Express.js, databases, version control,
                deployment workflows, and the design tools needed to turn a concept into a clear
                digital experience.
              </p>
              <div className="mt-10 rounded-3xl border border-blue-500/18 bg-[#050b14]/58 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.24)] sm:p-8 lg:mt-8 lg:p-6">
                <SkillSection />
              </div>
            </div>
          </section>

          <div
            id="about-documents"
            className="about-detail-section min-h-[100svh] scroll-mt-16 pb-8 xl:scroll-mt-0"
          >
            <DocSection />
          </div>
        </div>
      </main>
    </>
  );
}
