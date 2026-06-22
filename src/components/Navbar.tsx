"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LuBriefcase,
  LuFileText,
  LuHouse,
  LuMail,
  LuMenu,
  LuSparkles,
  LuUser,
  LuX,
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
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("HOME");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

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
    const nextPath = item.id === "home" ? "/home" : `/home#${item.id}`;

    setActiveSection(item.label);
    window.history.pushState(null, "", nextPath);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: isDesktopHorizontal ? "nearest" : "start",
        inline: isDesktopHorizontal ? "center" : "nearest",
      });
    }

    setIsOpen(false);
  };

  const activeIndex = Math.max(menuItems.findIndex((item) => item.label === activeSection), 0);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        data-cursor-label="MENU"
        className="fixed right-6 top-6 z-120 flex h-12 w-12 items-center justify-center rounded-full border border-blue-500/20 bg-black/55 text-blue-300 shadow-[0_0_30px_rgba(37,99,235,0.16)] backdrop-blur-xl lg:hidden"
        aria-label="Toggle Menu"
        whileTap={{ scale: 0.92 }}
      >
        {isOpen ? <LuX size={22} /> : <LuMenu size={22} />}
      </motion.button>

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
        className="fixed bottom-5 left-1/2 z-120 hidden -translate-x-1/2 lg:block"
        aria-label="Desktop section navigation"
      >
        <div className="relative flex items-center rounded-full border border-blue-500/20 bg-black/58 px-5 py-4 shadow-[0_22px_80px_rgba(0,0,0,0.35),0_0_40px_rgba(37,99,235,0.14)] backdrop-blur-2xl">
          <div className="absolute left-10 right-10 top-1/2 h-0.5 -translate-y-1/2 bg-blue-400/28" />
          <motion.div
            className="absolute left-5 top-4 h-11 w-11 rounded-full bg-blue-600/95 shadow-[0_0_30px_rgba(37,99,235,0.65)]"
            animate={{ x: activeIndex * 76 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
          />

          <ul className="relative z-10 flex items-center gap-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigation(item)}
                    data-cursor-label={item.label}
                    className="group relative flex flex-col items-center gap-2"
                    aria-label={item.label}
                  >
                    <motion.span
                      animate={{
                        scale: isActive ? 1.18 : 1,
                        backgroundColor: isActive ? "rgba(37,99,235,0.95)" : "rgba(3,7,18,0.95)",
                        borderColor: isActive ? "rgba(147,197,253,0.9)" : "rgba(147,197,253,0.36)",
                      }}
                      transition={{ type: "spring", stiffness: 240, damping: 18 }}
                      className="grid h-11 w-11 place-items-center rounded-full border text-white shadow-[0_0_24px_rgba(37,99,235,0.18)]"
                    >
                      <Icon size={17} />
                    </motion.span>
                    <span className={`text-[8px] font-black uppercase tracking-[0.22em] transition-colors ${isActive ? "text-blue-300" : "text-white/45 group-hover:text-white"}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-115 flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#030406] lg:hidden"
          >
            <div className="mb-8 flex items-center gap-3 text-blue-300">
              <LuSparkles size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.35em]">Navigation</span>
            </div>
            <ul className="flex flex-col items-center gap-7">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.label;

                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index + 0.15 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleNavigation(item)}
                      data-cursor-label={item.label}
                      className={`flex items-center gap-4 text-2xl font-black uppercase tracking-[0.18em] transition-all ${
                        isActive ? "scale-110 text-blue-500" : "text-white"
                      }`}
                    >
                      <Icon size={24} />
                      {item.label}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
