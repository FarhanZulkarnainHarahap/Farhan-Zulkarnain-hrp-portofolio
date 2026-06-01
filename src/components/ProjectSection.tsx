"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuArrowLeft, LuArrowRight, LuLoader, LuSparkles } from "react-icons/lu";
import ProjectCard from "./ProjectCard";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string | null;
  repoUrl: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROJECTS_PER_PAGE = 4;
const projectAccents = ["#3b82f6", "#10b981", "#facc15", "#a855f7"];
const orbitPositions = [
  "left-[1%] top-[30%] -rotate-[8deg]",
  "left-[25%] bottom-[2%] rotate-[6deg]",
  "right-[1%] top-[37%] rotate-[7deg]",
];

export default function PortfolioSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const pageCount = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
  const currentProjects = useMemo(
    () => projects.slice(page * PROJECTS_PER_PAGE, (page + 1) * PROJECTS_PER_PAGE),
    [page, projects],
  );
  const safeActiveIndex = Math.min(activeIndex, Math.max(currentProjects.length - 1, 0));
  const activeProject = currentProjects[safeActiveIndex];
  const orbitProjects = currentProjects
    .map((project, index) => ({ project, index }))
    .filter(({ index }) => index !== safeActiveIndex);

  const changePage = (nextPage: number) => {
    setPage((nextPage + pageCount) % pageCount);
    setActiveIndex(0);
  };

  const showPrevious = () => {
    if (safeActiveIndex > 0) {
      setActiveIndex(safeActiveIndex - 1);
      return;
    }
    changePage(page - 1);
  };

  const showNext = () => {
    if (safeActiveIndex < currentProjects.length - 1) {
      setActiveIndex(safeActiveIndex + 1);
      return;
    }
    changePage(page + 1);
  };

  if (loading) {
    return (
      <div className="flex min-h-100 w-full items-center justify-center bg-[#030406]">
        <div className="flex flex-col items-center gap-4">
          <LuLoader className="animate-spin text-blue-500" size={32} />
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 md:text-[10px]">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <section id="projects" className="relative isolate min-h-screen w-full overflow-hidden bg-[#02040b] px-5 py-20 md:px-8 lg:py-24">
      <div
        className="absolute inset-0 -z-20 opacity-70"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(96,165,250,0.65) 1px, transparent 1px)",
          backgroundSize: "78px 78px",
        }}
      />
      <div className="absolute left-[45%] top-[42%] -z-20 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/12 blur-[130px]" />
      <div className="absolute -bottom-28 -left-28 -z-10 h-80 w-80 rounded-full border border-blue-500/25 opacity-50" />

      <div className="mx-auto grid w-full max-w-380 grid-cols-1 items-center gap-10 lg:grid-cols-[285px_minmax(0,1fr)]">
        <header className="relative z-20 text-center lg:text-left">
          <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 lg:justify-start">
            <LuSparkles size={14} />
            My Works
          </div>
          <h2 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl lg:text-6xl">
            Projects Built With <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-blue-400">Purpose.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-zinc-400 lg:mx-0">
            A collection of digital products, crafted with clean code, modern design, and scalable architecture.
          </p>

          {projects.length > 1 && (
            <div className="mt-7 flex items-center justify-center gap-3 lg:justify-start">
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Project sebelumnya"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-all hover:border-blue-400 hover:bg-blue-500/15"
              >
                <LuArrowLeft size={17} />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Project berikutnya"
                className="flex items-center gap-3 rounded-full border border-white/15 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:border-blue-400 hover:bg-blue-500/15"
              >
                Explore
                <LuArrowRight size={15} />
              </button>
            </div>
          )}
        </header>

        {activeProject ? (
          <>
            <div className="hidden min-h-172 lg:block">
              <div className="relative h-172 w-full">
                <div className="absolute left-1/2 top-1/2 h-120 w-120 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/45 shadow-[0_0_40px_rgba(37,99,235,0.24)]" />
                <div className="absolute left-1/2 top-1/2 h-145 w-145 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-blue-500/35" />
                <div className="absolute left-1/2 top-1/2 h-94 w-166 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-blue-500/25 rotate-[-14deg]" />
                <div className="absolute left-1/2 top-1/2 h-90 w-184 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-purple-500/25 rotate-[11deg]" />

                {orbitProjects.map(({ project, index }, slotIndex) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, delay: slotIndex * 0.08 }}
                    className={`absolute z-20 ${orbitPositions[slotIndex]}`}
                  >
                    <ProjectCard
                      title={project.title}
                      description={project.description}
                      imageUrl={project.imageUrl}
                      demoUrl={project.demoUrl}
                      repoUrl={project.repoUrl}
                      index={page * PROJECTS_PER_PAGE + index}
                      variant="orbit"
                      accent={projectAccents[index % projectAccents.length]}
                      onSelect={() => setActiveIndex(index)}
                    />
                  </motion.div>
                ))}

                <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
                  <AnimatePresence mode="wait">
                    <ProjectCard
                      key={activeProject.id}
                      title={activeProject.title}
                      description={activeProject.description}
                      imageUrl={activeProject.imageUrl}
                      demoUrl={activeProject.demoUrl}
                      repoUrl={activeProject.repoUrl}
                      index={page * PROJECTS_PER_PAGE + safeActiveIndex}
                      variant="featured"
                      accent={projectAccents[safeActiveIndex % projectAccents.length]}
                    />
                  </AnimatePresence>
                </div>

                <div className="absolute bottom-2 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2">
                  {currentProjects.map((project, index) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Tampilkan ${project.title}`}
                      className={`h-2.5 rounded-full transition-all ${index === safeActiveIndex ? "w-7 bg-blue-500" : "w-2.5 bg-white/20 hover:bg-white/40"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:hidden">
              <AnimatePresence mode="wait">
                <ProjectCard
                  key={activeProject.id}
                  title={activeProject.title}
                  description={activeProject.description}
                  imageUrl={activeProject.imageUrl}
                  demoUrl={activeProject.demoUrl}
                  repoUrl={activeProject.repoUrl}
                  index={page * PROJECTS_PER_PAGE + safeActiveIndex}
                  variant="mobile"
                  accent={projectAccents[safeActiveIndex % projectAccents.length]}
                />
              </AnimatePresence>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {currentProjects.map((project, index) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Tampilkan ${project.title}`}
                    className={`rounded-xl border px-2 py-3 text-[10px] font-black transition-all ${
                      index === safeActiveIndex
                        ? "border-blue-400 bg-blue-500/15 text-blue-300"
                        : "border-white/10 bg-white/3 text-zinc-500"
                    }`}
                  >
                    {String(page * PROJECTS_PER_PAGE + index + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 px-6 py-24 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-600">
            No digital assets found in archive
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mx-auto mt-7 flex max-w-380 items-center justify-center gap-2">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => changePage(index)}
              aria-label={`Buka halaman project ${index + 1}`}
              className={`h-2 rounded-full transition-all ${index === page ? "w-8 bg-purple-500" : "w-2 bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
