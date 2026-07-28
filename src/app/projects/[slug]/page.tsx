import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LuArrowLeft,
  LuArrowRight,
  LuCircleCheck,
  LuExternalLink,
  LuGithub,
  LuLayers,
  LuRocket,
  LuTarget,
} from "react-icons/lu";
import CyberBackground from "@/components/CyberBackground";
import MusicPlayer from "@/components/MusicPlayer";
import Navbar from "@/components/Navbar";
import {
  findProjectBySlug,
  getProjectCategory,
  getProjectSlug,
  inferProjectDetails,
} from "@/lib/portfolio/projects";
import { getOptimizedImageUrl } from "@/lib/image";
import { getProjects } from "@/services/api";

type ProjectDetailProps = {
  params: Promise<{ slug: string }>;
};

async function getProject(slug: string) {
  const projects = await getProjects();
  const project = findProjectBySlug(projects, slug);
  return { project, projects };
}

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { project } = await getProject(slug);
    if (!project) return { title: "Project Not Found" };

    return {
      title: project.title,
      description: project.description,
      alternates: { canonical: `/projects/${getProjectSlug(project)}` },
      openGraph: {
        title: project.title,
        description: project.description,
        images: project.imageUrl ? [{ url: project.imageUrl }] : undefined,
      },
    };
  } catch {
    return { title: "Project" };
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { slug } = await params;
  const { project, projects } = await getProject(slug);

  if (!project) notFound();

  const details = inferProjectDetails(project);
  const category = getProjectCategory(project);
  const index = projects.findIndex((item) => item.id === project.id);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <Navbar />
      <MusicPlayer />
      <main id="main-content" className="portfolio-bg relative min-h-screen overflow-x-clip text-white">
        <CyberBackground />
        <section className="relative mx-auto w-[min(calc(100%-2rem),80rem)] pb-28 pt-28">
          <div className="mb-8 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <Link href="/projects" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-blue-200 hover:border-blue-300/60">
              <LuArrowLeft size={14} />
              Back to Projects
            </Link>
            <span>/</span>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span>{category}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="relative aspect-[16/11] overflow-hidden rounded-[30px] border border-blue-300/14 bg-slate-950 shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
              <Image
                src={getOptimizedImageUrl(project.imageUrl || "/window.svg", 1400)}
                alt={project.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 620px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#02050b]/65 via-transparent to-transparent" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">
                Project Case Study
              </p>
              <h1 className="mt-5 text-[clamp(2.7rem,7vw,6.4rem)] font-black uppercase leading-[0.9] text-white">
                {project.title}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                {project.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {details.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 items-center gap-3 rounded-full bg-blue-600 px-5 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-blue-500"
                  >
                    Live Demo
                    <LuExternalLink size={16} />
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 items-center gap-3 rounded-full border border-white/12 bg-white/5 px-5 text-xs font-black uppercase tracking-[0.16em] text-white hover:border-blue-300/60"
                  >
                    Source Code
                    <LuGithub size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { title: "Problem", text: details.problem, icon: LuTarget },
              { title: "Solution", text: details.solution, icon: LuLayers },
              { title: "Result", text: details.result, icon: LuRocket },
            ].map(({ title, text, icon: Icon }) => (
              <article key={title} className="rounded-[26px] border border-white/9 bg-white/[0.035] p-6">
                <Icon className="text-blue-300" size={24} />
                <h2 className="mt-4 text-lg font-black uppercase tracking-[0.1em] text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[28px] border border-white/9 bg-[#050911]/70 p-6">
              <h2 className="text-xl font-black text-white">Project Overview</h2>
              <dl className="mt-5 grid gap-3 text-sm">
                {[
                  ["Project Type", details.type],
                  ["Role", "Full-Stack Web Developer"],
                  ["Platform", "Responsive Web"],
                  ["Status", "Published / Portfolio Ready"],
                  ["Deployment", project.demoUrl ? "Live demo available" : "Repository / case study"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right font-bold text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="rounded-[28px] border border-white/9 bg-[#050911]/70 p-6">
              <h2 className="text-xl font-black text-white">Key Features</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {details.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 text-sm text-slate-300"
                  >
                    <LuCircleCheck className="shrink-0 text-blue-300" size={17} />
                    {feature}
                  </div>
                ))}
              </div>
            </article>
          </div>

          <section className="mt-8 rounded-[28px] border border-white/9 bg-white/[0.035] p-6">
            <h2 className="text-xl font-black text-white">Development Process</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-6">
              {["Research", "Planning", "UI Design", "Development", "Testing", "Deployment"].map((step, stepIndex) => (
                <div key={step} className="rounded-2xl border border-white/8 bg-[#07101d]/72 p-4">
                  <p className="font-mono text-xs font-black text-blue-300">{String(stepIndex + 1).padStart(2, "0")}</p>
                  <p className="mt-3 text-sm font-bold text-white">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href={`/projects/${getProjectSlug(previous)}`} className="flex min-h-12 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 text-xs font-black uppercase tracking-[0.16em] text-white hover:border-blue-300/60">
              <LuArrowLeft size={16} />
              Previous Project
            </Link>
            <Link href="/projects" className="flex min-h-12 items-center justify-center rounded-full border border-blue-300/25 bg-blue-500/10 px-5 text-xs font-black uppercase tracking-[0.16em] text-blue-100">
              Back to All Projects
            </Link>
            <Link href={`/projects/${getProjectSlug(next)}`} className="flex min-h-12 items-center justify-end gap-3 rounded-full border border-white/10 bg-white/5 px-5 text-xs font-black uppercase tracking-[0.16em] text-white hover:border-blue-300/60">
              Next Project
              <LuArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
