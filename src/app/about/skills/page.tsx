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
      <section className="relative mx-auto min-h-[100dvh] w-[min(calc(100%-2rem),80rem)] pb-32 pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.13),transparent_34%)]" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">
            Skills
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-[clamp(2.5rem,6vw,5.6rem)] font-black uppercase leading-[0.9] text-white">
                Technologies I Use to Build Digital Products
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                A recruiter-friendly map of the tools behind my frontend, backend,
                database, deployment, and integration work.
              </p>
            </div>
            <div className="rounded-2xl border border-white/9 bg-white/[0.035] px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Live from backend data
            </div>
          </div>

          <div className="mt-10">
            <SkillSection />
          </div>
        </div>
      </section>
    </AboutNestedShell>
  );
}
