"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LuBriefcase,
  LuFileText,
  LuHouse,
  LuMail,
  LuMap,
  LuMenu,
  LuSparkles,
  LuUser,
  LuX,
} from "react-icons/lu";

const menuItems = [
  { id: "home", href: "/home", label: "Home", icon: LuHouse },
  { id: "about", href: "/explore", label: "About", icon: LuUser },
  { id: "skills", href: "/skills", label: "Skills", icon: LuSparkles },
  { id: "projects", href: "/projects", label: "Projects", icon: LuBriefcase },
  { id: "journey", href: "/journey", label: "Journey", icon: LuMap },
  { id: "documents", href: "/documents", label: "Docs", icon: LuFileText },
  { id: "contact", href: "/contact", label: "Contact", icon: LuMail },
];

const mobilePrimary = ["home", "projects", "contact"];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("home");
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const observedSectionIds = useMemo(() => menuItems.map((item) => item.id), []);

  useEffect(() => {
    let frame = 0;
    let previousY = window.scrollY;

    const updateNavigationState = () => {
      frame = 0;
      const sections = observedSectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => Boolean(section));

      const viewportCenter = window.innerHeight * 0.42;
      const closest = sections
        .map((section) => {
          const rect = section.getBoundingClientRect();
          return {
            id: section.id,
            distance: Math.abs(rect.top + Math.min(rect.height, window.innerHeight) / 2 - viewportCenter),
          };
        })
        .sort((a, b) => a.distance - b.distance)[0];

      if (closest?.id) {
        setActiveSection((current) => (current === closest.id ? current : closest.id));
      }

      const currentY = window.scrollY;
      setCompact(currentY > 90 && currentY >= previousY);
      previousY = currentY;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateNavigationState);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [observedSectionIds]);

  useEffect(() => {
    const path = pathname === "/" ? "home" : pathname.replace("/", "");
    const item = menuItems.find((entry) => entry.href.replace("/", "") === path || entry.id === path);
    if (item) setActiveSection(item.id);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const handleNavigation = (item: (typeof menuItems)[number]) => {
    setMenuOpen(false);
    setActiveSection(item.id);

    if (pathname === "/about") {
      if (item.id === "about") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push(item.href);
      return;
    }

    const element = document.getElementById(item.id);
    if (element) {
      window.history.pushState(null, "", item.href);
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    router.push(item.href);
  };

  return (
    <>
      <a
        href="#home"
        className="fixed left-4 top-4 z-[130] -translate-y-24 rounded-full bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition focus:translate-y-0"
      >
        Skip to content
      </a>

      <nav
        className={`fixed left-1/2 top-4 z-120 hidden -translate-x-1/2 transition-all duration-300 lg:block ${
          compact ? "top-3 scale-[0.94] opacity-92" : "scale-100"
        }`}
        aria-label="Primary navigation"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#030711]/82 p-2 shadow-[0_18px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => handleNavigation(menuItems[0])}
            aria-label="Home"
            className="group mr-2 flex h-12 items-center gap-3 rounded-full border border-blue-300/22 bg-blue-500/8 pl-2 pr-5 text-left"
          >
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-blue-300/45">
              <Image src="/fz-logo.png" alt="FZH" width={32} height={32} className="h-full w-full object-cover" />
            </span>
            <span className="font-mono text-xs font-black uppercase tracking-[0.22em] text-white transition-transform group-hover:scale-105">
              FZH
            </span>
          </button>

          {menuItems.slice(1).map((item) => {
            const Icon = item.icon;
            const selected = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item)}
                aria-current={selected ? "page" : undefined}
                className={`relative flex h-11 items-center gap-2 rounded-full px-4 text-[10px] font-black uppercase tracking-[0.16em] transition-colors ${
                  selected
                    ? "bg-blue-500/20 text-white"
                    : "text-slate-400 hover:bg-white/6 hover:text-white"
                }`}
              >
                {selected && (
                  <span className="absolute inset-x-4 -bottom-1 h-px bg-linear-to-r from-transparent via-blue-200 to-transparent" />
                )}
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <nav
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-120 w-[calc(100vw-1rem)] max-w-[27rem] -translate-x-1/2 lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-4 gap-1 rounded-2xl border border-blue-400/22 bg-[#030711]/94 p-1.5 shadow-[0_14px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          {menuItems
            .filter((item) => mobilePrimary.includes(item.id))
            .map((item) => {
              const Icon = item.icon;
              const selected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigation(item)}
                  aria-current={selected ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[8px] font-black uppercase tracking-[0.08em] ${
                    selected ? "bg-blue-500/22 text-white" : "text-slate-400"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[8px] font-black uppercase tracking-[0.08em] text-slate-300"
          >
            <LuMenu size={20} />
            Menu
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[125] bg-[#010308]/72 backdrop-blur-xl transition-opacity lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile section navigation"
          className={`absolute inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] rounded-[28px] border border-blue-300/18 bg-[#050911]/96 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.55)] transition-[clip-path,transform] duration-300 ${
            menuOpen
              ? "[clip-path:circle(140%_at_50%_100%)] translate-y-0"
              : "[clip-path:circle(0%_at_50%_100%)] translate-y-8"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
              Navigate
            </p>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white"
            >
              <LuX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const selected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigation(item)}
                  aria-current={selected ? "page" : undefined}
                  className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left text-xs font-black uppercase tracking-[0.12em] ${
                    selected
                      ? "border-blue-300/55 bg-blue-500/18 text-white"
                      : "border-white/8 bg-white/[0.035] text-slate-400"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
