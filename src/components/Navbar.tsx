"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LuBriefcase,
  LuCodeXml,
  LuFileText,
  LuHouse,
  LuMail,
  LuUser,
} from "react-icons/lu";

const menuItems = [
  { id: "home", label: "HOME", shortLabel: "HOME", icon: LuHouse },
  { id: "about", label: "ABOUT", shortLabel: "ABOUT", icon: LuUser },
  { id: "skills", label: "SKILL", shortLabel: "SKILL", icon: LuCodeXml },
  { id: "projects", label: "PROJECT", shortLabel: "PROJ", icon: LuBriefcase },
  { id: "documents", label: "DOCUMENTS", shortLabel: "DOCS", icon: LuFileText },
  { id: "contact", label: "CONTACT", shortLabel: "MAIL", icon: LuMail },
];

export default function Navbar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("HOME");

  useEffect(() => {
    const getActiveSection = () => {
      const sections = menuItems
        .map((item) => document.getElementById(item.id))
        .filter((section): section is HTMLElement => Boolean(section));

      if (!sections.length) {
        return;
      }

      const horizontalStage = document.querySelector<HTMLElement>("[data-horizontal-stage]");
      const isDesktopHorizontal = window.matchMedia("(min-width: 1024px)").matches && horizontalStage;
      const viewportCenter = isDesktopHorizontal ? window.innerWidth / 2 : window.innerHeight / 2;

      const closest = sections
        .map((section) => {
          const rect = section.getBoundingClientRect();
          const sectionCenter = isDesktopHorizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
          return { id: section.id, distance: Math.abs(sectionCenter - viewportCenter) };
        })
        .sort((a, b) => a.distance - b.distance)[0];

      if (closest?.id) {
        setActiveSection(closest.id.toUpperCase());
      }
    };

    getActiveSection();

    const horizontalStage = document.querySelector<HTMLElement>("[data-horizontal-stage]");
    window.addEventListener("scroll", getActiveSection, { passive: true });
    window.addEventListener("resize", getActiveSection, { passive: true });
    horizontalStage?.addEventListener("scroll", getActiveSection, { passive: true });

    return () => {
      window.removeEventListener("scroll", getActiveSection);
      window.removeEventListener("resize", getActiveSection);
      horizontalStage?.removeEventListener("scroll", getActiveSection);
    };
  }, []);

  useEffect(() => {
    const pathSection = pathname.replace("/", "").toUpperCase() || "HOME";
    if (menuItems.some((item) => item.label === pathSection || item.id.toUpperCase() === pathSection)) {
      setActiveSection(pathSection);
    }
  }, [pathname]);

  const handleNavigation = (item: (typeof menuItems)[number]) => {
    const element = document.getElementById(item.id);
    const horizontalStage = document.querySelector<HTMLElement>("[data-horizontal-stage]");
    const isDesktopHorizontal = window.matchMedia("(min-width: 1024px)").matches && horizontalStage;

    setActiveSection(item.id.toUpperCase());
    window.history.pushState(null, "", "/home");

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: isDesktopHorizontal ? "nearest" : "start",
        inline: isDesktopHorizontal ? "center" : "nearest",
      });
    }

  };

  return (
    <>
      <nav
        className="fixed bottom-3 left-1/2 z-120 w-[min(calc(100vw-1rem),22.5rem)] -translate-x-1/2 sm:bottom-4 sm:w-[min(calc(100vw-1.5rem),28rem)] lg:bottom-5 lg:w-[calc(100%-1rem)] lg:max-w-[94rem]"
        aria-label="Section navigation"
      >
        <div className="relative overflow-hidden rounded-2xl border border-blue-400/55 bg-[#020712]/90 px-1.5 py-1.5 shadow-[0_0_28px_rgba(37,99,235,0.45),inset_0_0_42px_rgba(37,99,235,0.12)] backdrop-blur-2xl sm:px-2 sm:py-2 lg:rounded-none lg:px-5 lg:py-4 lg:[clip-path:polygon(2.5%_0,17%_0,18.2%_6%,82%_6%,83.2%_0,97.5%_0,100%_28%,100%_72%,97.5%_100%,82%_100%,80.8%_94%,19.2%_94%,18%_100%,2.5%_100%,0_72%,0_28%)]">
          <div className="pointer-events-none absolute inset-x-10 top-1 h-px bg-linear-to-r from-transparent via-blue-300 to-transparent" />
          <div className="pointer-events-none absolute inset-x-14 bottom-1 h-px bg-linear-to-r from-transparent via-blue-500/80 to-transparent" />
          <div className="pointer-events-none absolute left-4 top-4 hidden h-16 w-16 border-l border-t border-blue-400/30 sm:block" />
          <div className="pointer-events-none absolute bottom-4 right-4 hidden h-16 w-16 border-b border-r border-blue-400/30 sm:block" />
          <div className="pointer-events-none absolute left-1/2 top-1 h-0.5 w-12 -translate-x-1/2 rounded-full bg-blue-300 shadow-[0_0_16px_rgba(96,165,250,0.9)] lg:top-2 lg:h-1 lg:w-18" />
          <div className="pointer-events-none absolute bottom-2 left-1/2 hidden -translate-x-1/2 gap-1.5 lg:flex">
            <span className="h-1 w-1 rounded-full bg-blue-400" />
            <span className="h-1 w-1 rounded-full bg-blue-400" />
            <span className="h-1 w-1 rounded-full bg-blue-400" />
            <span className="h-1 w-1 rounded-full bg-blue-400" />
          </div>

          <div className="relative z-10 flex items-center gap-2 lg:gap-5">
            <button
              type="button"
              onClick={() => handleNavigation(menuItems[0])}
              data-cursor-label="HOME"
              className="hidden h-18 min-w-64 items-center gap-4 border border-blue-500/35 bg-black/35 px-5 text-left shadow-[inset_0_0_34px_rgba(37,99,235,0.12)] [clip-path:polygon(7%_0,100%_0,100%_82%,93%_100%,0_100%,0_18%)] lg:flex"
            >
              <span className="grid h-12 w-12 place-items-center border border-blue-400/55 bg-blue-500/10 text-2xl font-black italic text-blue-300 shadow-[0_0_24px_rgba(59,130,246,0.45)] [clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]">
                N
              </span>
              <span>
                <span className="block text-lg font-black uppercase tracking-[0.32em] text-white">Nexxus</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.28em] text-blue-400">Developer Portfolio</span>
              </span>
            </button>

            <ul className="grid w-full grid-cols-6 items-stretch gap-0 overflow-hidden rounded-xl border border-blue-500/20 bg-black/28 lg:flex lg:w-auto lg:rounded-none lg:border-0 lg:bg-transparent">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label || activeSection === item.id.toUpperCase();

              return (
                <li key={item.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => handleNavigation(item)}
                    data-cursor-label={item.label}
                    className={`group relative flex h-11 min-w-0 flex-col items-center justify-center gap-0.5 border-r border-blue-500/16 px-0.5 text-center last:border-r-0 min-[390px]:h-12 sm:h-13 sm:px-1 lg:h-18 lg:min-w-30 lg:gap-1.5 lg:border-r lg:px-4 xl:min-w-36 ${
                      isActive
                        ? "bg-blue-500/16 shadow-[inset_0_0_32px_rgba(37,99,235,0.28)] lg:[clip-path:polygon(0_0,100%_0,100%_82%,82%_100%,18%_100%,0_82%)]"
                        : "bg-transparent hover:bg-blue-500/8"
                    }`}
                    aria-label={item.label}
                  >
                    <span className={`${isActive ? "text-blue-300 drop-shadow-[0_0_10px_rgba(96,165,250,0.9)]" : "text-blue-300/80 group-hover:text-blue-200"}`}>
                      <Icon className="h-4 w-4 min-[390px]:h-4.5 min-[390px]:w-4.5 sm:h-5 sm:w-5 lg:h-8 lg:w-8" />
                    </span>
                    <span className={`max-w-full truncate text-[5px] font-black uppercase tracking-[-0.02em] transition-colors min-[390px]:text-[6px] sm:text-[7px] sm:tracking-[0.04em] lg:text-sm lg:tracking-[0.02em] ${isActive ? "text-white" : "text-white/75 group-hover:text-white"}`}>
                      <span className="sm:hidden">{item.shortLabel}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </span>
                    {isActive && (
                      <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-blue-300 shadow-[0_0_12px_rgba(96,165,250,0.95)] lg:bottom-2 lg:w-10" />
                    )}
                  </button>
                </li>
              );
            })}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
