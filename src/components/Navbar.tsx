"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  LuBriefcase,
  LuHouse,
  LuMail,
  LuUser,
} from "react-icons/lu";

const menuItems = [
  { id: "home", label: "HOME", shortLabel: "HOME", icon: LuHouse },
  { id: "about", label: "ABOUT", shortLabel: "ABOUT", icon: LuUser },
  { id: "projects", label: "PROJECT", shortLabel: "PROJ", icon: LuBriefcase },
  { id: "contact", label: "CONTACT", shortLabel: "MAIL", icon: LuMail },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
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
    if (pathname === "/about") {
      setActiveSection("ABOUT");
      return;
    }

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

    if (element) {
      window.history.pushState(null, "", item.id === "home" ? "/home" : `/home#${item.id}`);
      element.scrollIntoView({
        behavior: "smooth",
        block: isDesktopHorizontal ? "nearest" : "start",
        inline: isDesktopHorizontal ? "center" : "nearest",
      });
      return;
    }

    if (pathname === "/about" && item.id === "about") {
      window.history.replaceState(null, "", "/about");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push(item.id === "home" ? "/home" : `/home#${item.id}`);
  };

  return (
    <>
      <nav
        className="fixed bottom-2.5 left-1/2 z-120 w-[calc(100vw-1rem)] -translate-x-1/2 sm:bottom-3 sm:w-[min(calc(100vw-1.5rem),48rem)] lg:bottom-4 lg:w-[calc(100%-2rem)] lg:max-w-[66rem]"
        aria-label="Section navigation"
      >
        <div className="relative px-4 py-3 sm:px-5 lg:px-5 lg:py-3">
          <Image
            src="/cyber-navbar-frame.svg"
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 1056px"
            className="pointer-events-none select-none object-fill"
          />

          <div className="relative z-10 flex items-center justify-center gap-2 lg:mx-auto lg:w-fit lg:gap-2">
            <button
              type="button"
              onClick={() => handleNavigation(menuItems[0])}
              data-cursor-label="HOME"
              className="hidden h-15 min-w-48 items-center gap-3 border border-blue-500/35 bg-black/35 px-4 text-left shadow-[inset_0_0_34px_rgba(37,99,235,0.12)] [clip-path:polygon(7%_0,100%_0,100%_82%,93%_100%,0_100%,0_18%)] lg:flex"
            >
              <span className="grid h-10 w-10 place-items-center border border-blue-400/55 bg-blue-500/10 text-xl font-black italic text-blue-300 shadow-[0_0_24px_rgba(59,130,246,0.45)] [clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]">
                N
              </span>
              <span>
                <span className="block text-sm font-black uppercase tracking-[0.28em] text-white">Nexxus</span>
                <span className="mt-1 block text-[7px] font-bold uppercase tracking-[0.24em] text-blue-400">Developer Portfolio</span>
              </span>
            </button>

            <ul className="grid w-full grid-cols-4 items-stretch gap-0 overflow-hidden border border-blue-500/20 bg-black/28 lg:flex lg:w-auto lg:border-0 lg:bg-transparent">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label || activeSection === item.id.toUpperCase();

              return (
                <li key={item.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => handleNavigation(item)}
                    data-cursor-label={item.label}
                    className={`group relative flex h-16 min-w-0 flex-col items-center justify-center gap-1 border-r border-blue-500/16 px-0.5 text-center last:border-r-0 sm:h-17 sm:px-1 lg:h-15 lg:min-w-18 lg:gap-1 lg:border-r lg:px-2 xl:min-w-20 ${
                      isActive
                        ? "bg-blue-500/16 shadow-[inset_0_0_32px_rgba(37,99,235,0.28)] lg:[clip-path:polygon(0_0,100%_0,100%_82%,82%_100%,18%_100%,0_82%)]"
                        : "bg-transparent hover:bg-blue-500/8"
                    }`}
                    aria-label={item.label}
                  >
                    <span className={`${isActive ? "text-blue-300 drop-shadow-[0_0_10px_rgba(96,165,250,0.9)]" : "text-blue-300/80 group-hover:text-blue-200"}`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-6 lg:w-6" />
                    </span>
                    <span className={`max-w-full truncate text-[6px] font-black uppercase tracking-[-0.03em] transition-colors min-[390px]:text-[7px] sm:text-[8px] sm:tracking-[0.02em] lg:text-[10px] lg:tracking-[0.02em] ${isActive ? "text-white" : "text-white/75 group-hover:text-white"}`}>
                      <span>{item.label}</span>
                    </span>
                    {isActive && (
                      <span className="absolute bottom-1 h-0.5 w-7 bg-blue-300 shadow-[0_0_12px_rgba(96,165,250,0.95)] lg:w-8" />
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
