"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LuBriefcase,
  LuHouse,
  LuMail,
  LuMap,
  LuMenu,
  LuUser,
  LuX,
} from "react-icons/lu";

const menuItems = [
  { id: "home", href: "/", label: "HOME", icon: LuHouse },
  { id: "about", href: "/about", label: "ABOUT", icon: LuUser },
  { id: "project", href: "/projects", label: "PROJECT", icon: LuBriefcase },
  { id: "journey", href: "/journey", label: "JOURNEY", icon: LuMap },
  { id: "contact", href: "/contact", label: "CONTACT", icon: LuMail },
] as const;

const mobilePrimary = ["home", "project", "contact"];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    let previousY = window.scrollY;

    const updateNavigationState = () => {
      frame = 0;
      const currentY = window.scrollY;
      setCompact(currentY > 90 && currentY >= previousY);
      previousY = currentY;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateNavigationState);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[130] -translate-y-24 rounded-full bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition focus:translate-y-0"
      >
        Skip to content
      </a>

      <nav
        className={`fixed left-1/2 top-4 z-120 hidden w-[min(calc(100%-2rem),58rem)] -translate-x-1/2 transition-all duration-300 lg:block ${
          compact ? "top-3 scale-[0.96] opacity-92" : "scale-100"
        }`}
        aria-label="Primary navigation"
      >
        <div className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-[#030711]/82 p-2 shadow-[0_18px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
          <Link
            href="/"
            aria-label="HOME"
            className="group mr-2 flex h-12 shrink-0 items-center gap-3 rounded-full border border-blue-300/22 bg-blue-500/8 pl-2 pr-5 text-left"
          >
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-blue-300/45">
              <Image src="/fz-logo.png" alt="FZH" width={32} height={32} className="h-full w-full object-cover" />
            </span>
            <span className="font-mono text-xs font-black uppercase tracking-[0.22em] text-white transition-transform group-hover:scale-105">
              FZH
            </span>
          </Link>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const selected = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={selected ? "page" : undefined}
                className={`relative flex h-11 items-center gap-2 rounded-full px-4 text-[10px] font-black uppercase tracking-[0.16em] transition-colors ${
                  selected ? "bg-blue-500/20 text-white" : "text-slate-400 hover:bg-white/6 hover:text-white"
                }`}
              >
                {selected && (
                  <span className="absolute inset-x-4 -bottom-1 h-px bg-linear-to-r from-transparent via-blue-200 to-transparent" />
                )}
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-120 w-[calc(100%-1rem)] max-w-[27rem] -translate-x-1/2 lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-4 gap-1 rounded-2xl border border-blue-400/22 bg-[#030711]/94 p-1.5 shadow-[0_14px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          {menuItems
            .filter((item) => mobilePrimary.includes(item.id))
            .map((item) => {
              const Icon = item.icon;
              const selected = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={selected ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[8px] font-black uppercase tracking-[0.08em] ${
                    selected ? "bg-blue-500/22 text-white" : "text-slate-400"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[8px] font-black uppercase tracking-[0.08em] text-slate-300"
          >
            <LuMenu size={20} />
            MENU
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
          aria-label="Mobile navigation"
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

          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const selected = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={selected ? "page" : undefined}
                  className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left text-xs font-black uppercase tracking-[0.12em] ${
                    selected ? "border-blue-300/55 bg-blue-500/18 text-white" : "border-white/8 bg-white/[0.035] text-slate-400"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
