"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuCodeXml, LuFileText, LuUser } from "react-icons/lu";

const items = [
  { href: "/about/detail", label: "ABOUT ME", icon: LuUser },
  { href: "/about/skills", label: "SKILLS", icon: LuCodeXml },
  { href: "/about/docs", label: "DOCS", icon: LuFileText },
] as const;

export default function AboutSubNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="About navigation"
      className="sticky top-4 z-50 mx-auto w-[min(calc(100%-1.5rem),42rem)] pt-20 lg:pt-24"
    >
      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-[#030711]/88 p-1.5 shadow-[0_16px_55px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2 text-[9px] font-black uppercase tracking-[0.12em] transition-colors sm:text-[10px] ${
                active ? "bg-blue-500/22 text-white" : "text-slate-400 hover:bg-white/6 hover:text-white"
              }`}
            >
              <Icon className="shrink-0" size={15} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
