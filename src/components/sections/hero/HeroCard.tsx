"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LuArrowDown,
  LuArrowRight,
  LuDownload,
  LuGithub,
  LuLinkedin,
  LuMessageCircle,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { fetchCachedJson } from "@/lib/client-cache";
import { getOptimizedImageUrl } from "@/lib/image";
import { getDocumentSlug } from "@/lib/portfolio/documents";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { MaskReveal } from "@/components/motion/MaskReveal";

type DocumentResponse = {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    category: string;
    fileUrl: string;
  }>;
};

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/FarhanZulkarnainHarahap",
    icon: LuGithub,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/farhan-zulkarnain-71801a347",
    icon: LuLinkedin,
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/6281958169283",
    icon: FaWhatsapp,
  },
];

const profileImage = getOptimizedImageUrl(
  "https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg",
  820,
);

export default function HeroCard() {
  const router = useRouter();
  const [cvHref, setCvHref] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadResume = async () => {
      try {
        const result = await fetchCachedJson<DocumentResponse>(
          "/api/documents",
          "portfolio-documents",
        );
        const resume = result.data.find((document) =>
          `${document.name} ${document.category}`.toLowerCase().match(/resume|cv|curriculum/),
        );

        if (active && resume) {
          setCvHref(`/api/documents/${getDocumentSlug(resume)}/download`);
        }
      } catch {
        if (active) setCvHref(null);
      }
    };

    loadResume();
    return () => {
      active = false;
    };
  }, []);

  const scrollToSection = (id: string, path: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.history.pushState(null, "", path);
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    router.push(path);
  };

  const openDocuments = () => {
    router.push("/about/docs");
  };

  return (
    <section className="relative isolate flex min-h-[100dvh] w-full items-center overflow-hidden bg-transparent px-5 pb-32 pt-24 sm:px-8 md:pb-36 lg:px-12 lg:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[18%] h-40 w-40 rounded-full bg-blue-600/10 blur-[90px]" />
        <div className="absolute bottom-[10%] right-[7%] h-56 w-56 rounded-full bg-cyan-400/8 blur-[110px]" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-blue-400/18 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)] lg:gap-16">
        <div className="max-w-3xl text-center lg:text-left">
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-blue-400/18 bg-blue-500/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-blue-200 lg:mx-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
            Available for Projects
          </div>

          <h1 className="mt-7 text-[clamp(3.2rem,10vw,8.5rem)] font-black uppercase leading-[0.84] tracking-normal text-white">
            <MaskReveal lines={["Farhan", "Zulkarnain"]} />
            <span className="mt-2 block text-[0.34em] tracking-[0.16em] text-blue-200/80">
              Harahap
            </span>
          </h1>

          <p className="mt-5 text-[11px] font-black uppercase tracking-[0.26em] text-blue-300/85 sm:text-xs sm:tracking-[0.34em]">
            Full-Stack Web Developer / UI Developer
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300/78 sm:text-lg lg:mx-0">
            I design and build modern web products with Next.js, React, TypeScript,
            Node.js, and clean interface systems that stay readable for teams and recruiters.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <MagneticButton
              onClick={() => scrollToSection("projects", "/projects")}
              data-cursor-label="PROJECTS"
              className="group flex min-h-12 items-center gap-3 rounded-full bg-blue-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_45px_rgba(37,99,235,0.32)] transition-colors hover:bg-blue-500"
            >
              Explore My Work
              <LuArrowRight className="transition-transform group-hover:translate-x-1" size={17} />
            </MagneticButton>

            {cvHref ? (
              <MagneticButton
                href={cvHref}
                download
                data-cursor-label="CV"
                className="flex min-h-12 items-center gap-3 rounded-full border border-white/12 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:border-blue-300/60 hover:bg-blue-500/12"
              >
                Download CV
                <LuDownload size={17} />
              </MagneticButton>
            ) : (
              <MagneticButton
                onClick={openDocuments}
                data-cursor-label="DOCS"
                className="flex min-h-12 items-center gap-3 rounded-full border border-white/12 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:border-blue-300/60 hover:bg-blue-500/12"
              >
                Download CV
                <LuDownload size={17} />
              </MagneticButton>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {socialLinks.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                data-cursor-label={name.toUpperCase()}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/4 text-slate-300 transition-colors hover:border-blue-300/60 hover:bg-blue-500/15 hover:text-white"
              >
                <Icon size={18} />
              </a>
            ))}
            <a
              href="mailto:farhanzulkarnaenhrp@gmail.com"
              className="ml-0 flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300 transition-colors hover:border-blue-300/60 hover:bg-blue-500/15 hover:text-white sm:ml-2"
            >
              <LuMessageCircle size={16} />
              Email
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[28rem]">
          <div className="pointer-events-none absolute -inset-4 rounded-[32px] border border-blue-400/8 bg-blue-500/5 blur-sm" />
          <div className="group relative overflow-hidden rounded-[28px] border border-blue-300/18 bg-[#080b13] p-2 shadow-[0_24px_90px_rgba(0,0,0,0.42),0_0_34px_rgba(37,99,235,0.14)]">
            <div className="pointer-events-none absolute left-[-16%] top-[34%] h-32 w-[132%] rotate-[-14deg] bg-linear-to-r from-blue-500 via-cyan-400 to-emerald-300 opacity-28 blur-2xl" />
            <div className="relative rounded-[22px] border border-white/8 bg-[#050911] p-2">
              <div className="relative h-[24rem] overflow-hidden rounded-[17px] bg-[#111827] sm:h-[29rem] lg:h-[34rem]">
                <Image
                  src={profileImage}
                  alt="Farhan Zulkarnain Harahap"
                  fill
                  priority
                  fetchPriority="high"
                  quality={72}
                  sizes="(max-width: 768px) 92vw, (max-width: 1280px) 420px, 460px"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#080b13]/60 via-transparent to-transparent opacity-55" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToSection("about", "/about")}
        aria-label="Scroll to about"
        className="absolute bottom-20 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-blue-200/72 transition-colors hover:text-blue-100 md:flex"
      >
        Scroll
        <LuArrowDown className="animate-bounce" size={15} />
      </button>
    </section>
  );
}
