import type { Metadata } from "next";
import AboutNestedShell from "@/components/navigation/AboutNestedShell";
import SkillSection from "@/components/sections/skill/SkillSection";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Technologies Farhan Zulkarnain Harahap uses across frontend, backend, database, tools, deployment, and integrations.",
  alternates: { canonical: "/about/skills" },
};

export default function SkillsPage() {
  return (
    <AboutNestedShell>
      <section className="relative min-h-[100dvh] pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.11),transparent_34%)]" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">
            Skills
          </p>
          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(16rem,0.38fr)] lg:items-end">
            <div className="min-w-0">
              <h1 className="max-w-4xl text-[clamp(2.25rem,5vw,4.7rem)] font-black uppercase leading-[0.98] text-white">
                Technologies I Use to Build Digital Products
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-400 sm:text-base">
                A recruiter-friendly map of the tools behind my frontend, backend,
                database, deployment, and integration work.
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/9 bg-[#07101d]/86 p-5 text-left lg:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                Live from backend data
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Skills are loaded from the active portfolio API.
              </p>
            </div>
          </div>

          <div className="mt-12 sm:mt-14">
            <SkillSection />
          </div>
        </div>
      </section>
    </AboutNestedShell>
  );
}
