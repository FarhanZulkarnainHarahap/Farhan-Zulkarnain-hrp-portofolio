"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuArrowLeft,
  LuArrowRight,
  LuCircleCheck,
  LuExternalLink,
  LuGithub,
  LuLayers,
  LuRocket,
  LuSparkles,
  LuTarget,
  LuX,
} from "react-icons/lu";
import ProjectCard from "./ProjectCard";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string | null;
  repoUrl: string | null;
  category?: string | null;
  caseType?: string | null;
  type?: string | null;
  tags?: string[] | string | null;
  techStack?: string[] | string | null;
  problem?: string | null;
  caseProblem?: string | null;
  solution?: string | null;
  caseSolution?: string | null;
  result?: string | null;
  caseResult?: string | null;
  features?: string[] | string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROJECTS_PER_PAGE = 6;
const projectAccents = ["#3b82f6", "#10b981", "#facc15", "#a855f7"];

const splitListValue = (value?: string[] | string | null) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value
    .split(/[,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const firstText = (...values: Array<string | null | undefined>) =>
  values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();

const inferProjectDetails = (project: Project) => {
  const text = `${project.title} ${project.description}`.toLowerCase();
  let details = {
    type: "Web Application",
    tags: ["Responsive UI", "Modern Web", "Scalable", "API Ready"],
    problem: "Digital products need a clean interface, clear user flow, and a codebase that can grow without becoming messy.",
    solution: "Built a polished web application experience with reusable UI patterns, structured layout, and performance-minded presentation.",
    result: "A modern project that communicates the product idea clearly and gives the codebase room to scale.",
    features: ["Responsive layout", "Reusable components", "Clean navigation", "Modern visual system"],
  };

  if (text.includes("market") || text.includes("grocery")) {
    details = {
      type: "Grocery App",
      tags: ["Product Catalog", "Cart Flow", "Responsive UI", "Order Ready"],
      problem: "Users need a clean grocery interface that makes product discovery, cart management, and checkout feel quick on mobile.",
      solution: "Built a structured shopping experience with clear product grouping, focused navigation, and a modern storefront layout.",
      result: "A practical commerce-style interface that is easier to scan, faster to use, and ready to scale into real order workflows.",
      features: ["Product browsing", "Category based layout", "Cart-oriented flow", "Mobile-first presentation"],
    };
  }

  if (text.includes("calendar") || text.includes("callender")) {
    details = {
      type: "Productivity App",
      tags: ["Schedule UI", "Task Flow", "Cards", "Clean Dashboard"],
      problem: "A productivity interface needs to organize schedules and notes without making the screen feel crowded.",
      solution: "Designed a compact calendar dashboard with card-based information, readable hierarchy, and smooth visual states.",
      result: "A sharper planning experience with a focused layout for daily schedules, reminders, and task context.",
      features: ["Calendar layout", "Schedule cards", "Workflow buttons", "Dark productivity UI"],
    };
  }

  if (text.includes("nexxora") || text.includes("store") || text.includes("e-commerce")) {
    details = {
      type: "E-Commerce Platform",
      tags: ["Storefront", "Checkout", "Admin", "User Profile"],
      problem: "An online store needs a premium storefront while still supporting product, user, order, and admin flows.",
      solution: "Created a polished e-commerce experience with product catalog structure, shopping actions, and dashboard-ready architecture.",
      result: "A scalable commerce foundation that balances visual quality with practical full-stack product management.",
      features: ["Product catalog", "Checkout flow", "User profile", "Admin dashboard"],
    };
  }

  if (text.includes("talk") || text.includes("chat")) {
    details = {
      type: "Chat Application",
      tags: ["Authentication", "Realtime UI", "User List", "Clean Chat"],
      problem: "Messaging apps need fast context switching while keeping conversations readable and secure.",
      solution: "Built a focused chat interface with authentication-minded structure, user list, and clear conversation hierarchy.",
      result: "A clean communication product concept that feels modern, responsive, and easy to extend.",
      features: ["Conversation layout", "User list", "Authentication flow", "Realtime-ready UI"],
    };
  }

  const dbTags = splitListValue(project.tags).length
    ? splitListValue(project.tags)
    : splitListValue(project.techStack);
  const dbFeatures = splitListValue(project.features);

  return {
    ...details,
    type: firstText(project.caseType, project.type, project.category) ?? details.type,
    tags: dbTags.length ? dbTags : details.tags,
    problem: firstText(project.caseProblem, project.problem) ?? details.problem,
    solution: firstText(project.caseSolution, project.solution) ?? details.solution,
    result: firstText(project.caseResult, project.result) ?? details.result,
    features: dbFeatures.length ? dbFeatures : details.features,
  };
};

const ProjectCaseStudyModal = ({
  project,
  accent,
  onClose,
}: {
  project: Project;
  accent: string;
  onClose: () => void;
}) => {
  const details = inferProjectDetails(project);
  const cards = [
    { icon: LuTarget, title: "Problem", text: details.problem },
    { icon: LuLayers, title: "Solution", text: details.solution },
    { icon: LuRocket, title: "Result", text: details.result },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 30, scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border bg-[#060a12]/98 p-4 shadow-[0_32px_120px_rgba(37,99,235,0.2)] md:p-6"
        style={{ borderColor: `${accent}70` }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close case study"
          className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-blue-400 hover:bg-blue-500/20"
        >
          <LuX size={18} />
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="relative h-62 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 md:h-82">
              <Image
                src={project.imageUrl || "/placeholder-project.jpg"}
                alt={project.title}
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#060a12] via-transparent to-transparent" />
              <motion.div
                animate={{ x: ["-18%", "18%", "-18%"], opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-[70px]"
                style={{ backgroundColor: accent }}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {cards.map(({ icon: Icon, title, text }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.08 }}
                  className="rounded-2xl border border-white/8 bg-white/4 p-4"
                >
                  <Icon className="mb-3 text-blue-400" size={20} />
                  <h4 className="text-xs font-black uppercase tracking-[0.18em] text-white">{title}</h4>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
                {details.type}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Case Study
              </span>
            </div>

            <h3 className="text-4xl font-black uppercase leading-none text-white md:text-5xl">
              {project.title}
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-zinc-400">
              {project.description || "A carefully crafted digital product with a clean and scalable interface."}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {details.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-7 space-y-3">
              {details.features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.06 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/7 bg-white/4 px-4 py-3 text-sm text-zinc-300"
                >
                  <LuCircleCheck className="shrink-0 text-blue-400" size={17} />
                  {feature}
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="LIVE"
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_0_28px_rgba(37,99,235,0.45)] transition-all hover:-translate-y-1 hover:bg-blue-500"
                >
                  Live Demo
                  <LuExternalLink size={15} />
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="CODE"
                  className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/10"
                >
                  Source Code
                  <LuGithub size={15} />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProjectSkeleton = () => (
  <section className="relative isolate min-h-screen w-full overflow-hidden bg-transparent px-5 py-20 md:px-8 lg:py-24">
    <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.18),transparent_55%)]" />

    <div className="mx-auto grid w-full max-w-390 grid-cols-1 items-center gap-10 lg:grid-cols-[285px_minmax(0,1fr)] 2xl:grid-cols-[285px_minmax(0,1fr)_235px]">
      <div className="animate-pulse text-center lg:text-left">
        <div className="mx-auto h-3 w-42 rounded-full bg-blue-500/18 lg:mx-0" />
        <div className="mt-6 space-y-3">
          <div className="mx-auto h-12 w-70 rounded-2xl bg-white/10 lg:mx-0" />
          <div className="mx-auto h-12 w-58 rounded-2xl bg-white/8 lg:mx-0" />
          <div className="mx-auto h-12 w-52 rounded-2xl bg-blue-500/16 lg:mx-0" />
        </div>
        <div className="mx-auto mt-6 h-18 w-full max-w-sm rounded-2xl bg-white/6 lg:mx-0" />
        <div className="mt-7 flex items-center justify-center gap-3 lg:justify-start">
          <div className="h-11 w-11 rounded-full border border-white/10 bg-white/5" />
          <div className="h-11 w-48 rounded-full border border-white/10 bg-white/5" />
        </div>
      </div>

      <div className="relative mx-auto h-165 w-full max-w-220 animate-pulse">
        <div className="absolute left-1/2 top-1/2 h-108 w-108 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/25" />
        <div className="absolute left-1/2 top-1/2 h-135 w-135 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-blue-500/20" />
        <div className="absolute left-1/2 top-1/2 z-20 h-125 w-full max-w-96 -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-blue-500/25 bg-[#070b16]/92 shadow-[0_30px_90px_rgba(37,99,235,0.14)]">
          <div className="m-4 h-48 rounded-2xl bg-white/10" />
          <div className="mx-auto mt-6 h-4 w-32 rounded-full bg-blue-500/18" />
          <div className="mx-auto mt-5 h-8 w-54 rounded-xl bg-white/10" />
          <div className="mx-auto mt-4 h-18 w-70 rounded-2xl bg-white/6" />
          <div className="mx-auto mt-7 flex justify-center gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-7 w-20 rounded-full border border-white/8 bg-white/5" />
            ))}
          </div>
        </div>
        <div className="absolute left-0 top-16 hidden h-78 w-64 rotate-[-7deg] rounded-[24px] border border-blue-500/18 bg-white/5 xl:block" />
        <div className="absolute bottom-6 right-0 hidden h-78 w-64 rotate-[8deg] rounded-[24px] border border-blue-500/18 bg-white/5 xl:block" />
      </div>

      <aside className="hidden animate-pulse rounded-[24px] border border-blue-500/18 bg-[#080b16]/80 px-5 py-6 2xl:block">
        <div className="space-y-5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex gap-3">
              <div className="h-7 w-7 shrink-0 rounded-lg bg-blue-500/14" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded-full bg-white/12" />
                <div className="h-10 rounded-xl bg-white/6" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  </section>
);

export default function PortfolioSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/api/portofolios`);
        const result = await res.json();
        if (result.success) setProjects(result.data);
      } catch (error) {
        console.error("Failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedProject]);

  const pageCount = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const visibleProjects = useMemo(
    () => projects.slice((safePage - 1) * PROJECTS_PER_PAGE, safePage * PROJECTS_PER_PAGE),
    [projects, safePage],
  );

  if (loading) {
    return <ProjectSkeleton />;
  }

  return (
    <section id="projects" className="relative isolate min-h-screen w-full overflow-hidden bg-transparent px-5 py-20 md:px-8 lg:py-24">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.2),transparent_55%)]" />
      <div className="absolute inset-0 -z-20 bg-linear-to-b from-transparent via-[#030406]/14 to-transparent" />
      <div className="absolute left-[45%] top-[42%] -z-20 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[80px]" />
      <div className="absolute -bottom-28 -left-28 -z-10 h-80 w-80 rounded-full border border-blue-500/25 opacity-50" />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 border-b border-white/10 pb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.35em] text-blue-400">
                <LuSparkles size={14} />
                My Works
              </p>
              <h2 className="text-4xl font-black uppercase leading-none tracking-tight text-white md:text-6xl">
                Projects Built With <span className="text-blue-500">Purpose.</span>
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-400">
                A collection of digital products, crafted with clean code, modern design, and scalable architecture.
              </p>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
              {projects.length} Project Assets
            </p>
          </div>
        </div>

        {visibleProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((project, index) => {
              const projectIndex = (safePage - 1) * PROJECTS_PER_PAGE + index;

              return (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  imageUrl={project.imageUrl}
                  demoUrl={project.demoUrl}
                  repoUrl={project.repoUrl}
                  index={projectIndex}
                  variant="mobile"
                  accent={projectAccents[projectIndex % projectAccents.length]}
                  onDetails={() => setSelectedProject(project)}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 px-6 py-24 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-600">
            No digital assets found in archive
          </div>
        )}

        <div className="mt-9 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
            data-cursor-label="PREV"
            aria-label="Previous project page"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-zinc-400 transition-colors hover:border-blue-500/45 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <LuArrowLeft size={14} />
          </button>

          {Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                data-cursor-label={`PAGE ${pageNumber}`}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold transition-colors ${
                  pageNumber === safePage
                    ? "border-blue-400 bg-blue-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.35)]"
                    : "border-white/10 bg-white/3 text-zinc-400 hover:border-blue-500/45 hover:text-blue-400"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            disabled={safePage === pageCount}
            data-cursor-label="NEXT"
            aria-label="Next project page"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-zinc-400 transition-colors hover:border-blue-500/45 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <LuArrowRight size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectCaseStudyModal
            project={selectedProject}
            accent={projectAccents[Math.max(projects.findIndex((project) => project.id === selectedProject.id), 0) % projectAccents.length]}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
