"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const navigationItems = [
  { id: "home", label: "Index", path: "/" },
  { id: "about", label: "About", path: "/about" },
  { id: "journey", label: "Journey", path: "/journey" },
  { id: "projects", label: "Work", path: "/projects" },
  { id: "contact", label: "Contact", path: "/contact" },
] as const;

export default function ImmersiveNavigation() {
  const reducedMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const cursor = window.scrollY + window.innerHeight * 0.42;
      let active: string = navigationItems[0].id;

      navigationItems.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= cursor) active = id;
      });
      setActiveSection((current) => (current === active ? current : active));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const navigate = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
    path: string,
  ) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    window.history.replaceState(null, "", path);
    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[140] -translate-y-20 border border-cyan-200/50 bg-[#03070d] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white transition-transform focus:translate-y-0"
      >
        Skip to experience
      </a>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 sm:px-7 lg:px-10">
        <a
          href="#home"
          onClick={(event) => navigate(event, "home", "/")}
          className="pointer-events-auto flex items-center gap-3"
          aria-label="Farhan Zulkarnain — back to top"
          data-cursor-label="TOP"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border border-cyan-100/30 bg-[#06101a]/70 font-mono text-[10px] font-black tracking-[-0.08em] text-cyan-50 backdrop-blur-md">
            FZ
          </span>
          <span className="hidden text-[8px] font-bold uppercase leading-4 tracking-[0.24em] text-white/60 sm:block">
            Farhan Zulkarnain
            <br />
            Creative Developer
          </span>
        </a>

        <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/45">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.9)]" />
          <span className="hidden sm:inline">Available for select projects</span>
          <span className="sm:hidden">Available</span>
        </div>
      </header>

      <nav
        aria-label="Portfolio sections"
        className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 lg:block"
      >
        <div className="relative py-2">
          <span className="absolute bottom-2 right-[3px] top-2 w-px bg-white/12" />
          <span
            className="absolute right-[3px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-cyan-200/75"
            style={{ transform: "scaleY(var(--story-progress, 0))" }}
            aria-hidden="true"
          />
          <ol className="relative space-y-5">
            {navigationItems.map((item, index) => {
              const active = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => navigate(event, item.id, item.path)}
                    className="group flex items-center justify-end gap-3"
                    aria-current={active ? "location" : undefined}
                    data-cursor-label={item.label.toUpperCase()}
                  >
                    <span
                      className={`text-[8px] font-bold uppercase tracking-[0.2em] transition-opacity ${active ? "text-cyan-100 opacity-100" : "text-white/35 opacity-0 group-hover:opacity-100"}`}
                    >
                      {String(index).padStart(2, "0")} / {item.label}
                    </span>
                    <span
                      className={`relative h-[7px] w-[7px] rounded-full border transition-all ${active ? "scale-125 border-cyan-100 bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,.8)]" : "border-white/35 bg-[#03070d] group-hover:border-white"}`}
                    />
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      <nav
        aria-label="Mobile portfolio sections"
        className="fixed bottom-[max(0.6rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 lg:hidden"
      >
        <ol className="grid grid-cols-5 border border-white/12 bg-[#03070d]/88 px-1 py-1.5 shadow-[0_18px_50px_rgba(0,0,0,.45)] backdrop-blur-xl">
          {navigationItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => navigate(event, item.id, item.path)}
                  className={`flex min-h-9 items-center justify-center text-[7px] font-bold uppercase tracking-[0.1em] ${active ? "text-cyan-100" : "text-white/35"}`}
                  aria-current={active ? "location" : undefined}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
