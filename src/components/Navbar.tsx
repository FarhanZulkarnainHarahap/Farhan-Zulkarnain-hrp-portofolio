"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  LuBriefcase,
  LuCpu,
  LuFileText,
  LuHouse,
  LuMail,
  LuUser,
} from "react-icons/lu";

const menuItems = [
  { id: "home", href: "/home", label: "HOME", shortLabel: "HOME", icon: LuHouse },
  { id: "about", href: "/explore", label: "ABOUT", shortLabel: "ABOUT", icon: LuUser },
  { id: "skills", href: "/skills", label: "SKILL", shortLabel: "SKILL", icon: LuCpu },
  { id: "projects", href: "/projects", label: "PROJECT", shortLabel: "PROJ", icon: LuBriefcase },
  { id: "documents", href: "/documents", label: "DOCUMENT", shortLabel: "DOCS", icon: LuFileText },
  { id: "contact", href: "/contact", label: "CONTACT", shortLabel: "MAIL", icon: LuMail },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("HOME");

  useEffect(() => {
    let frame = 0;

    const getActiveSection = () => {
      frame = 0;
      const sections = menuItems
        .map((item) => document.getElementById(item.id))
        .filter((section): section is HTMLElement => Boolean(section));

      if (!sections.length) {
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      const containingSection = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
      });

      const closest = containingSection
        ? { id: containingSection.id }
        : sections
            .map((section) => {
              const rect = section.getBoundingClientRect();
              const sectionCenter = rect.top + Math.min(rect.height, window.innerHeight) / 2;
              return { id: section.id, distance: Math.abs(sectionCenter - viewportCenter) };
            })
            .sort((a, b) => a.distance - b.distance)[0];

      if (closest?.id) {
        const nextSection = closest.id.toUpperCase();
        setActiveSection((current) =>
          current === nextSection ? current : nextSection,
        );
      }
    };

    const requestSectionUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(getActiveSection);
    };

    requestSectionUpdate();
    window.addEventListener("scroll", requestSectionUpdate, { passive: true });
    window.addEventListener("resize", requestSectionUpdate, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestSectionUpdate);
      window.removeEventListener("resize", requestSectionUpdate);
    };
  }, []);

  useEffect(() => {
    if (pathname === "/about" || pathname === "/explore") {
      setActiveSection("ABOUT");
      return;
    }

    const pathSection = pathname.replace("/", "").toUpperCase() || "HOME";
    if (menuItems.some((item) => item.label === pathSection || item.id.toUpperCase() === pathSection)) {
      setActiveSection(pathSection);
    }
  }, [pathname]);

  const handleNavigation = (item: (typeof menuItems)[number]) => {
    if (item.id === "about" && pathname === "/about") {
      setActiveSection("ABOUT");
      window.history.replaceState(null, "", "/about");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(item.id);

    setActiveSection(item.id.toUpperCase());

    if (element) {
      window.history.pushState(null, "", item.href);
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    router.push(item.href);
  };

  return (
    <>
      <nav
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-120 w-[calc(100vw-1rem)] max-w-[32rem] -translate-x-1/2 sm:bottom-4 sm:w-[calc(100vw-2rem)] sm:max-w-[36rem] lg:w-[calc(100%-2rem)] lg:max-w-[66rem]"
        aria-label="Section navigation"
      >
        <div className="relative rounded-2xl border border-blue-400/35 bg-[#030711]/94 p-1.5 shadow-[0_14px_45px_rgba(0,0,0,0.55),0_0_28px_rgba(37,99,235,0.16)] backdrop-blur-xl sm:p-2 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-5 lg:py-3 lg:shadow-none lg:backdrop-blur-none">
          <Image
            src="/cyber-navbar-frame.svg"
            alt=""
            fill
            priority
            sizes="1056px"
            className="pointer-events-none hidden select-none object-fill lg:block"
          />

          <div className="relative z-10 flex items-center justify-center lg:mx-auto lg:w-fit lg:gap-2">
            <button
              type="button"
              onClick={() => handleNavigation(menuItems[0])}
              data-cursor-label="HOME"
              className="hidden h-15 min-w-48 items-center gap-3 border border-blue-500/35 bg-black/35 px-4 text-left shadow-[inset_0_0_34px_rgba(37,99,235,0.12)] [clip-path:polygon(7%_0,100%_0,100%_82%,93%_100%,0_100%,0_18%)] lg:flex"
            >
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-blue-400/55 bg-transparent shadow-[0_0_24px_rgba(59,130,246,0.45)]">
                <Image
                  src="/fz-logo.png"
                  alt="FZ Dev"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </span>
              <span>
                <span className="block text-sm font-black uppercase tracking-[0.28em] text-white">Nexxus</span>
                <span className="mt-1 block text-[7px] font-bold uppercase tracking-[0.24em] text-blue-400">Developer Portfolio</span>
              </span>
            </button>

            <ul className="grid w-full grid-cols-6 items-stretch overflow-hidden rounded-xl bg-black/18 lg:flex lg:w-auto lg:rounded-none lg:border-0 lg:bg-transparent">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label || activeSection === item.id.toUpperCase();

              return (
                <li key={item.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => handleNavigation(item)}
                    data-cursor-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex h-14 w-full min-w-0 flex-col items-center justify-center gap-1 border-r border-blue-500/18 px-1 text-center transition-all duration-300 last:border-r-0 sm:h-15 sm:px-2 lg:h-15 lg:min-w-18 lg:gap-1 lg:px-2 xl:min-w-20 ${
                      isActive
                        ? "bg-blue-500/22 shadow-[inset_0_0_30px_rgba(37,99,235,0.3),0_0_18px_rgba(34,211,238,0.08)] lg:[clip-path:polygon(0_0,100%_0,100%_82%,82%_100%,18%_100%,0_82%)]"
                        : "bg-transparent opacity-72 hover:bg-blue-500/8 hover:opacity-100"
                    }`}
                    aria-label={item.label}
                  >
                    <span className={`${isActive ? "text-blue-300 drop-shadow-[0_0_10px_rgba(96,165,250,0.9)]" : "text-blue-300/80 group-hover:text-blue-200"}`}>
                      <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6" />
                    </span>
                    <span className={`max-w-full truncate text-[7px] font-black uppercase tracking-[-0.01em] transition-colors sm:text-[8px] sm:tracking-[0.02em] lg:text-[9px] ${isActive ? "text-white" : "text-white/70 group-hover:text-white"}`}>
                      <span className="sm:hidden">{item.shortLabel}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </span>
                    {isActive && (
                      <>
                        <span className="absolute inset-x-2 top-0 h-px bg-linear-to-r from-transparent via-cyan-200 to-transparent shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
                        <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-cyan-200 shadow-[0_0_12px_#67e8f9]" />
                        <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-blue-300 shadow-[0_0_12px_rgba(96,165,250,0.95)] lg:bottom-1" />
                      </>
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
