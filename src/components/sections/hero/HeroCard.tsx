"use client";

import { FaArrowRight, FaDownload, FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { getOptimizedImageUrl } from "@/lib/image";
import ShinyText from "./ShinyText";

const profileImage = getOptimizedImageUrl(
  "https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg",
  720,
);

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/farhan.nexxus?igsh=bmw4cmI4djQzeTN1",
    icon: FaInstagram,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/farhan-zulkarnain-71801a347",
    icon: FaLinkedinIn,
  },
  {
    name: "GitHub",
    href: "https://github.com/FarhanZulkarnainHarahap",
    icon: FaGithub,
  },
];

export default function HeroCard() {
  const scrollToProjects = () => {
    const element = document.getElementById("projects");
    const horizontalStage = document.querySelector<HTMLElement>("[data-horizontal-stage]");
    const isDesktopHorizontal = window.matchMedia("(min-width: 1024px)").matches && horizontalStage;

    window.history.pushState(null, "", "/home#projects");

    element?.scrollIntoView({
      behavior: "smooth",
      block: isDesktopHorizontal ? "nearest" : "start",
      inline: isDesktopHorizontal ? "center" : "nearest",
    });
  };

  return (
    <section className="relative flex min-h-[100svh] w-full items-center justify-center bg-transparent pb-28 pt-16 sm:pb-30 sm:pt-20 lg:h-screen lg:overflow-hidden lg:py-0">
      <div className="absolute top-1/4 -left-20 hidden w-80 h-80 bg-blue-600/8 rounded-full blur-[90px] pointer-events-none md:block" />
      
      <div className="z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 md:px-12 lg:grid-cols-12 lg:gap-12">
        
        {/* Profile Photo Column */}
        <div
          className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2"
        >
          <div className="hero-profile-card group">
            <div className="hero-profile-content">
              <div className="hero-profile-image">
                <Image
                  src={profileImage}
                  alt="Farhan Zulkarnain"
                  fill
                  priority
                  fetchPriority="high"
                  quality={72}
                  sizes="(max-width: 768px) 265px, 330px"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#080b13] via-transparent to-transparent opacity-55" />
              </div>

              <div className="relative z-10 pt-4">
                <p className="text-center text-[9px] font-black uppercase tracking-[0.45em] text-blue-400">
                  Connect With Me
                </p>
                <div className="mt-3 flex gap-2.5">
                  {socialLinks.map(({ name, href, icon: Icon }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      data-cursor-label={name.toUpperCase()}
                      className="flex h-10 flex-1 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-zinc-300 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Main Text Column */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8 order-2 lg:order-1 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3 text-blue-500 font-bold tracking-[0.3em] md:tracking-[0.5em] text-[9px] md:text-[10px] uppercase">
              <span className="h-px w-8 md:w-10 bg-blue-500"></span> Available for projects
            </div>
            
            <h1 className="flex flex-col items-center text-4xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl lg:items-start lg:text-7xl">
              <ShinyText
                text="FARHAN"
                speed={3}
                color="rgba(255, 255, 255, 0.2)"
                shineColor="#ffffff"
              />
              <ShinyText
                text="ZULKARNAIN."
                speed={3}
                color="#3b82f6"
                shineColor="#ffffff"
              />
            </h1>
          </div>

          <p
            className="mx-auto max-w-xl px-2 text-base font-light leading-relaxed text-gray-500 md:px-0 md:text-xl lg:mx-0 lg:text-lg"
          >
            Crafting high-performance digital experiences through <span className="text-white font-medium underline decoration-blue-500/30">clean code</span> and <span className="text-white font-medium italic">immersive design</span>.
          </p>

          <div className="pt-4 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <button
              type="button"
              onClick={scrollToProjects}
              data-cursor-label="EXPLORE"
              className="group flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">View My Projects</span>
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
            <Link href="/about#about-documents">
              <button
                data-cursor-label="RESUME"
                className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-white/12 bg-white/5 px-8 py-3.5 text-white transition-all hover:border-blue-400/60 hover:bg-blue-500/10 md:px-9 md:py-4"
              >
                <span className="relative text-[10px] font-black uppercase tracking-widest md:text-xs">View Resume</span>
                <FaDownload className="relative text-blue-400 transition-transform group-hover:-translate-y-0.5" />
              </button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
