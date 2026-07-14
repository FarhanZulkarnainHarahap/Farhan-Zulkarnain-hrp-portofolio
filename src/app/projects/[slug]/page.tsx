import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  LuArrowLeft,
  LuExternalLink,
  LuGithub,
  LuLayers3,
  LuRocket,
  LuTarget,
} from "react-icons/lu";
import CinematicScrollController from "@/components/motion/CinematicScrollController";
import PublicDock from "@/components/navigation/PublicDock";
import { getProjectById, getProjects, type Project } from "@/services/api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

async function loadProject(slug: string) {
  try {
    return await getProjectById(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title: project.title,
      description: project.description,
      images: [{ url: project.imageUrl }],
    },
  };
}

function CaseBlock({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof LuTarget;
  title: string;
  text: string | null;
}) {
  if (!text) return null;

  return (
    <article data-cinematic className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
      <Icon className="h-6 w-6 text-cyan-200" />
      <h2 className="mt-6 text-2xl font-black uppercase text-white">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">{text}</p>
    </article>
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await loadProject(slug);

  if (!project) notFound();

  let related: Project[] = [];
  try {
    related = (await getProjects())
      .filter((item) => item.id !== project.id)
      .slice(0, 3);
  } catch {
    related = [];
  }

  return (
    <>
      <PublicDock />
      <CinematicScrollController>
        <main className="min-h-screen bg-[#02040a] pb-40 text-slate-100">
          <section className="px-5 pb-18 pt-28 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <Link
                href="/projects"
                data-hero-reveal
                className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-white/12 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                <LuArrowLeft className="h-4 w-4" /> Projects
              </Link>
              <div className="mt-10 grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
                <div>
                  <p data-hero-reveal className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                    {project.caseType || "Case Study"}
                  </p>
                  <h1 data-hero-reveal className="mt-5 text-5xl font-black uppercase leading-[0.92] text-white sm:text-7xl">
                    {project.title}
                  </h1>
                  <p data-hero-reveal className="mt-7 text-base leading-8 text-slate-300">
                    {project.description}
                  </p>
                  <div data-hero-reveal className="mt-8 flex flex-wrap gap-3">
                    {project.demoUrl ? (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-cyan-200 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white"
                      >
                        Live Demo <LuExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                    {project.repoUrl ? (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-white/12 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/8"
                      >
                        Repository <LuGithub className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
                <div data-hero-reveal className="relative aspect-[16/11] overflow-hidden rounded-[34px] border border-white/10 bg-slate-900">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#02040a]/82 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-12 sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
              <CaseBlock icon={LuTarget} title="Problem" text={project.caseProblem} />
              <CaseBlock icon={LuLayers3} title="Solution" text={project.caseSolution} />
              <CaseBlock icon={LuRocket} title="Result" text={project.caseResult} />
            </div>
          </section>

          {(project.tags.length || project.features.length) ? (
            <section className="px-5 py-12 sm:px-8 lg:px-12">
              <div data-cinematic className="mx-auto grid max-w-7xl gap-5 rounded-[30px] border border-white/10 bg-white/[0.035] p-6 lg:grid-cols-2">
                {project.tags.length ? (
                  <div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100">
                      Technologies
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/[0.06] px-3 py-2 text-xs font-bold text-slate-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {project.features.length ? (
                  <div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100">
                      Features
                    </h2>
                    <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
                      {project.features.map((feature) => (
                        <li key={feature} className="rounded-2xl bg-white/[0.04] px-4 py-3">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {related.length ? (
            <section className="px-5 py-12 sm:px-8 lg:px-12">
              <div className="mx-auto max-w-7xl">
                <h2 data-cinematic className="text-3xl font-black uppercase text-white">
                  Related Projects
                </h2>
                <div className="mt-7 grid gap-5 md:grid-cols-3">
                  {related.map((item) => (
                    <Link key={item.id} href={`/projects/${item.id}`} data-cinematic className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-200/35 hover:bg-cyan-200/8">
                      <span className="text-lg font-black uppercase text-white">{item.title}</span>
                      <span className="mt-3 block text-sm leading-6 text-slate-400">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </main>
      </CinematicScrollController>
    </>
  );
}
