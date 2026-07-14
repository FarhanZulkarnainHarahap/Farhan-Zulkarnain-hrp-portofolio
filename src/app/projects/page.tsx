import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  LuArrowRight,
  LuExternalLink,
  LuGithub,
  LuSearch,
  LuTags,
} from "react-icons/lu";
import CinematicScrollController from "@/components/motion/CinematicScrollController";
import PublicDock from "@/components/navigation/PublicDock";
import { getProjects, type Project } from "@/services/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected web projects, case studies, demos, and repository links from Farhan Zulkarnain Harahap.",
  alternates: { canonical: "/projects" },
};

async function safeProjects() {
  try {
    return await getProjects();
  } catch {
    return [] as Project[];
  }
}

function collectTags(projects: Project[]) {
  return Array.from(new Set(projects.flatMap((project) => project.tags))).slice(0, 12);
}

export default async function ProjectsPage() {
  const projects = await safeProjects();
  const tags = collectTags(projects);
  const featured = projects[0];

  return (
    <>
      <PublicDock />
      <CinematicScrollController>
        <main className="min-h-screen bg-[#02040a] pb-40 text-slate-100">
          <section className="relative overflow-hidden px-5 pb-18 pt-28 sm:px-8 lg:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_10%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_12%_28%,rgba(139,92,246,0.14),transparent_30%)]" />
            <div className="relative mx-auto max-w-7xl">
              <p data-hero-reveal className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                Projects
              </p>
              <h1 data-hero-reveal className="mt-7 max-w-5xl text-5xl font-black uppercase leading-[0.92] text-white sm:text-7xl lg:text-8xl">
                Project archive built for real product stories.
              </h1>
              <p data-hero-reveal className="mt-7 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                Explore selected work across polished interfaces, product flows, and modern web
                experiences. Demo and repository links appear when they are available.
              </p>
              <div data-hero-reveal className="mt-8 flex flex-wrap gap-2">
                {tags.length ? (
                  tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                      <LuTags className="h-3.5 w-3.5 text-cyan-200" />
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                    <LuSearch className="h-3.5 w-3.5 text-cyan-200" />
                    Project tags are being curated.
                  </span>
                )}
              </div>
            </div>
          </section>

          {featured ? (
            <section className="px-5 py-14 sm:px-8 lg:px-12">
              <article data-cinematic className="mx-auto grid max-w-7xl overflow-hidden rounded-[34px] border border-cyan-200/18 bg-cyan-200/7 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative min-h-75 bg-slate-900 lg:min-h-115">
                  <Image
                    src={featured.imageUrl}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#02040a] via-transparent to-transparent lg:bg-linear-to-r" />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-100">
                    Latest Project
                  </p>
                  <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-5xl">
                    {featured.title}
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-slate-300">{featured.description}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href={`/projects/${featured.id}`}
                      className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-cyan-200 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white"
                    >
                      Read Case <LuArrowRight className="h-4 w-4" />
                    </Link>
                    {featured.demoUrl ? (
                      <a
                        href={featured.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-white/12 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/8"
                      >
                        Demo <LuExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                    {featured.repoUrl ? (
                      <a
                        href={featured.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-white/12 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/8"
                      >
                        Repo <LuGithub className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </section>
          ) : null}

          <section className="px-5 py-14 sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.length ? (
                projects.map((project) => (
                  <article key={project.id} data-cinematic className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]">
                    <Link href={`/projects/${project.id}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#02040a] via-transparent to-transparent" />
                      </div>
                      <div className="p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
                          {project.caseType || "Project"}
                        </p>
                        <h2 className="mt-3 text-2xl font-black uppercase text-white">{project.title}</h2>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                          {project.description}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {project.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </article>
                ))
              ) : (
                <div data-cinematic className="rounded-[28px] border border-white/10 bg-white/[0.035] p-8 text-slate-300 md:col-span-2 xl:col-span-3">
                  Projects are being curated for the next portfolio update.
                </div>
              )}
            </div>
          </section>
        </main>
      </CinematicScrollController>
    </>
  );
}
