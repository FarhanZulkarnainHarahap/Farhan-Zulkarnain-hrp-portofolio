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
      <section id="about-skills" className="relative w-full overflow-hidden pb-16 sm:pb-20 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.1),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[58%] bg-linear-to-r from-[#030711] via-[#030711]/82 to-transparent lg:block" />

        <div className="relative z-20 w-full">
          <div className="grid min-w-0 gap-12 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)] lg:gap-16 xl:gap-18">
            <div className="min-w-0 pt-2 lg:pt-10">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">
                Skills
              </p>
              <h1 className="mt-7 max-w-[920px] text-[clamp(2.6rem,5.45vw,5rem)] font-black uppercase leading-[0.97] text-white">
                Technologies I Use to Build Digital Products
              </h1>
              <p className="mt-8 max-w-[760px] text-sm leading-[1.75] text-slate-400 sm:text-base">
                A recruiter-friendly map of the tools behind my frontend, backend,
                database, deployment, and integration work.
              </p>
            </div>

            <div className="relative min-w-0 lg:min-h-[30rem]">
              <div className="pointer-events-none absolute inset-x-[-18%] top-0 hidden h-72 rounded-full bg-[radial-gradient(circle_at_52%_45%,rgba(34,211,238,0.17),rgba(59,130,246,0.08)_42%,transparent_70%)] opacity-80 blur-sm lg:block" />
              <div className="pointer-events-none absolute inset-y-0 left-[-22%] hidden w-1/2 bg-linear-to-r from-[#030711] via-[#030711]/80 to-transparent lg:block" />
              <div className="relative z-10 flex min-h-0 flex-col justify-end gap-10 pt-4 lg:min-h-[30rem] lg:pt-44">
                <div className="hidden h-16 lg:block" aria-hidden="true" />
                <div className="ml-auto min-w-0 w-full max-w-[430px] rounded-2xl border border-white/9 bg-[#07101d]/88 p-6 text-left shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:p-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                    Live from backend data
                  </p>
                  <p className="mt-3 text-xs leading-6 text-slate-500">
                    Skills are loaded from the active portfolio API and organized into a readable stack map.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 sm:mt-16 lg:mt-18">
            <SkillSection />
          </div>
        </div>
      </section>
    </AboutNestedShell>
  );
}
