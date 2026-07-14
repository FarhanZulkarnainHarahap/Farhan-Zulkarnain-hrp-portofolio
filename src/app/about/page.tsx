import Link from "next/link";
import type { Metadata } from "next";
import type { IconType } from "react-icons";
import {
  LuArrowRight,
  LuBriefcaseBusiness,
  LuCalendarDays,
  LuCode,
  LuFileText,
  LuLayers3,
  LuMapPin,
  LuPalette,
} from "react-icons/lu";
import CinematicScrollController from "@/components/motion/CinematicScrollController";
import PublicDock from "@/components/navigation/PublicDock";
import SkillIconGrid from "@/components/public/SkillIconGrid";
import CinematicCanvas from "@/components/three/cinematic/CinematicCanvas";
import {
  getDocuments,
  getExperiences,
  getProjects,
  getSkills,
  type Document,
  type Experience,
  type Project,
  type Skill,
} from "@/services/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Farhan Zulkarnain Harahap, his skills, selected work, and full-stack web development approach.",
  alternates: { canonical: "/about" },
};

async function safeLoad<T>(loader: () => Promise<T>, fallback: T) {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

function groupSkills(skills: Skill[]) {
  return skills.reduce<Record<string, Skill[]>>((groups, skill) => {
    const key = skill.category || "TOOLS";
    groups[key] = groups[key] ? [...groups[key], skill] : [skill];
    return groups;
  }, {});
}

function formatMonthYear(value?: string | null) {
  if (!value) return "Present";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export default async function AboutPage() {
  const [projects, skills, experiences, documents] = await Promise.all([
    safeLoad(getProjects, [] as Project[]),
    safeLoad(getSkills, [] as Skill[]),
    safeLoad(getExperiences, [] as Experience[]),
    safeLoad(getDocuments, [] as Document[]),
  ]);
  const groupedSkills = groupSkills(skills);
  const skillGroups = Object.entries(groupedSkills).map(([category, items]) => ({
    category,
    items,
  }));
  const stats: Array<{ label: string; value: number; icon: IconType }> = [
    { label: "Projects", value: projects.length, icon: LuBriefcaseBusiness },
    { label: "Skills", value: skills.length, icon: LuCode },
    { label: "Experience", value: experiences.length, icon: LuLayers3 },
    { label: "Documents", value: documents.length, icon: LuFileText },
  ];

  return (
    <>
      <PublicDock />
      <CinematicScrollController>
        <main className="min-h-screen overflow-x-clip bg-[#02040a] pb-36 text-slate-100">
          <section className="relative isolate overflow-hidden px-5 pb-28 pt-28 sm:px-8 lg:px-12">
            <CinematicCanvas />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,10,0.68),#02040a_82%)]" />
            <div className="relative z-10 mx-auto max-w-7xl">
              <p data-hero-reveal className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                About
              </p>
              <h1 data-hero-reveal className="mt-7 max-w-5xl text-5xl font-black uppercase leading-[0.92] text-white sm:text-7xl lg:text-8xl">
                Full-stack developer with a cinematic eye for digital products.
              </h1>
              <p data-hero-reveal className="mt-7 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                I combine interface craft, application engineering, product thinking, and motion
                details to create web experiences that feel polished and useful.
              </p>
            </div>
          </section>

          <section className="px-5 py-18 sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <article key={label} data-cinematic className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
                  <Icon className="h-6 w-6 text-cyan-200" />
                  <p className="mt-8 text-4xl font-black text-white">{value}</p>
                  <h2 className="mt-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                    {label}
                  </h2>
                </article>
              ))}
            </div>
          </section>

          <section className="px-5 py-18 sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div data-cinematic>
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Professional Focus
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  Design, development, motion, and launch.
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Interface", "Readable screens, responsive states, and accessible user flows."],
                  ["Engineering", "Clean application structure for real product features."],
                  ["Motion", "Subtle animation that supports storytelling without hurting usability."],
                  ["Delivery", "Production-minded polish, performance checks, and responsive refinement."],
                ].map(([title, text]) => (
                  <article key={title} data-cinematic className="rounded-[26px] border border-white/10 bg-white/[0.035] p-6">
                    <LuPalette className="h-5 w-5 text-cyan-200" />
                    <h3 className="mt-6 text-2xl font-black uppercase text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 py-18 sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
              <div data-cinematic>
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Skills
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  Tools I use across modern web builds.
                </h2>
              </div>
              <SkillIconGrid groups={skillGroups} />
            </div>
          </section>

          {experiences.length ? (
          <section className="px-5 py-18 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div data-cinematic className="max-w-4xl">
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Experience
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  Professional timeline.
                </h2>
              </div>
              <div className="mt-12 grid gap-5">
                {experiences.map((item: Experience) => (
                    <article key={item.id} data-cinematic className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-2xl font-black uppercase text-white">{item.title}</h3>
                          <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                            {item.company}
                          </p>
                        </div>
                        <p className="flex items-center gap-2 text-sm font-bold text-cyan-100">
                          <LuCalendarDays className="h-4 w-4" />
                          {formatMonthYear(item.startDate)} - {item.current ? "Present" : formatMonthYear(item.endDate)}
                        </p>
                      </div>
                      {item.location ? (
                        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                          <LuMapPin className="h-4 w-4" /> {item.location}
                        </p>
                      ) : null}
                      {item.description ? (
                        <p className="mt-5 text-sm leading-7 text-slate-300">{item.description}</p>
                      ) : null}
                    </article>
                  ))}
              </div>
            </div>
          </section>
          ) : null}

          {documents.length ? (
          <section className="px-5 py-18 sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div data-cinematic>
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Documents
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  Resume and supporting documents.
                </h2>
              </div>
              <div className="grid gap-4">
                {documents.slice(0, 5).map((doc: Document) => (
                    <a
                      key={doc.id}
                      data-cinematic
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-5 rounded-[24px] border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-200/35 hover:bg-cyan-200/8"
                    >
                      <span>
                        <span className="block text-lg font-black uppercase text-white">{doc.name}</span>
                        <span className="mt-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          {doc.category}
                        </span>
                      </span>
                      <LuArrowRight className="h-5 w-5 text-cyan-200 transition group-hover:translate-x-1" />
                    </a>
                  ))}
              </div>
            </div>
          </section>
          ) : null}

          <section className="px-5 py-18 sm:px-8 lg:px-12">
            <div data-cinematic className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[32px] border border-cyan-200/18 bg-cyan-200/8 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-100">
                  Next Chapter
                </p>
                <h2 className="mt-3 text-3xl font-black uppercase text-white">
                  Explore the project archive.
                </h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex min-h-13 items-center justify-center gap-3 rounded-2xl bg-cyan-200 px-6 text-[11px] font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-white"
              >
                Projects <LuArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </CinematicScrollController>
    </>
  );
}
