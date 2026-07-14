"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuBriefcaseBusiness,
  LuHouse,
  LuInfo,
  LuMail,
  LuShieldCheck,
} from "react-icons/lu";

const items = [
  { href: "/", label: "Home", icon: LuHouse },
  { href: "/about", label: "About", icon: LuInfo },
  { href: "/projects", label: "Projects", icon: LuBriefcaseBusiness },
  { href: "/contact", label: "Contact", icon: LuMail },
  { href: "/admin/home", label: "Admin", icon: LuShieldCheck },
];

export default function PublicDock() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:bottom-5 sm:px-6 sm:pb-0"
    >
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-1 rounded-[24px] border border-cyan-300/18 bg-[#030712]/88 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-12 min-w-12 flex-1 items-center justify-center gap-2 rounded-2xl px-3 text-[10px] font-black uppercase tracking-[0.14em] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:min-w-22 ${
                active
                  ? "bg-cyan-300/12 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.22)]"
                  : "text-slate-500 hover:bg-white/6 hover:text-slate-100"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
