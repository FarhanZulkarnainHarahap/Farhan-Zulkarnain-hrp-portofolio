"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LuBriefcase,
  LuFileText,
  LuHouse,
  LuMail,
  LuRocket,
  LuUser,
  LuZap,
} from "react-icons/lu";

const menuItems = [
  { id: "home", label: "HOME", icon: LuHouse },
  { id: "about", label: "ABOUT", icon: LuUser },
  { id: "skills", label: "SKILLS", icon: LuZap },
  { id: "projects", label: "PROJECTS", icon: LuBriefcase },
  { id: "documents", label: "DOCUMENTS", icon: LuFileText },
  { id: "contact", label: "CONTACT", icon: LuMail },
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
    if (menuItems.some((item) => item.label === pathSection)) {
      setActiveSection(pathSection);
    }
  }, [pathname]);

  const handleNavigation = (item: (typeof menuItems)[number]) => {
    const element = document.getElementById(item.id);
    const horizontalStage = document.querySelector<HTMLElement>("[data-horizontal-stage]");
    const isDesktopHorizontal = window.matchMedia("(min-width: 1024px)").matches && horizontalStage;

    setActiveSection(item.label);
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
      <button
        type="button"
        onClick={() => handleNavigation(menuItems[0])}
        className="fixed left-6 top-6 z-120 font-black uppercase italic tracking-tighter text-blue-500 lg:left-8 lg:top-7 lg:text-2xl"
        data-cursor-label="HOME"
      >
        Farhan Z.
      </button>

      <motion.nav
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-3 left-1/2 z-120 w-[calc(100%-1rem)] max-w-[24rem] -translate-x-1/2 sm:bottom-4 sm:max-w-[34rem] lg:bottom-5 lg:w-auto lg:max-w-none"
        aria-label="Section navigation"
      >
        <div className="relative flex items-center justify-center rounded-[1.75rem] border border-blue-500/24 bg-black/70 px-3 py-2 shadow-[0_22px_80px_rgba(0,0,0,0.45),0_0_48px_rgba(37,99,235,0.18)] backdrop-blur-2xl sm:px-4 sm:py-3 lg:rounded-full lg:px-5 lg:py-4">
          <div className="absolute -top-3 left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-blue-400/25 bg-[#030712]/92 px-3 py-1 text-[7px] font-black uppercase tracking-[0.24em] text-blue-200 shadow-[0_0_24px_rgba(37,99,235,0.28)] sm:flex">
            <LuRocket size={10} />
            Galaxy Nav
          </div>
          <div className="absolute left-8 right-8 top-1/2 h-0.5 -translate-y-1/2 bg-linear-to-r from-transparent via-blue-400/35 to-transparent sm:left-10 sm:right-10" />
          <div className="absolute -left-2 top-1/2 h-8 w-5 -translate-y-1/2 rounded-l-full border border-blue-500/20 bg-blue-500/8 blur-[1px]" />
          <div className="absolute -right-2 top-1/2 h-8 w-5 -translate-y-1/2 rounded-r-full border border-blue-500/20 bg-blue-500/8 blur-[1px]" />

          <ul className="relative z-10 grid w-full grid-cols-6 items-center gap-1.5 sm:gap-3 lg:flex lg:w-auto lg:gap-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigation(item)}
                    data-cursor-label={item.label}
                    className="group relative flex flex-col items-center gap-1.5 sm:gap-2"
                    aria-label={item.label}
                  >
                    <motion.span
                      animate={{
                        scale: isActive ? 1.18 : 1,
                        backgroundColor: isActive ? "rgba(37,99,235,0.95)" : "rgba(3,7,18,0.95)",
                        borderColor: isActive ? "rgba(147,197,253,0.9)" : "rgba(147,197,253,0.36)",
                      }}
                      transition={{ type: "spring", stiffness: 240, damping: 18 }}
                      className="grid h-9 w-9 place-items-center rounded-full border text-white shadow-[0_0_24px_rgba(37,99,235,0.18)] sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </motion.span>
                    <span className={`text-[6px] font-black uppercase tracking-[0.14em] transition-colors sm:text-[7px] sm:tracking-[0.18em] lg:text-[8px] lg:tracking-[0.22em] ${isActive ? "text-blue-300" : "text-white/45 group-hover:text-white"}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.nav>
    </>
  );
}
