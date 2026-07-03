"use client";

import { motion, type Variants } from "framer-motion";
import { useFetchProjects } from "@/hooks/useFetchProjects";
import ProjectCard from "./ProjectCard";

const cardAccents = ["#22d3ee", "#a855f7", "#60a5fa", "#c084fc"];

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 38, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function ProjectSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.045] p-3 shadow-[0_22px_70px_rgba(34,211,238,0.08)] backdrop-blur-2xl">
      <div className="absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="h-52 animate-pulse rounded-[20px] bg-white/[0.07]" />
      <div className="space-y-3 px-2 pb-3 pt-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-cyan-300/10" />
        <div className="h-7 w-3/4 animate-pulse rounded-lg bg-white/10" />
        <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
    </div>
  );
}

export default function ProjectList() {
  const { projects, isLoading, error, refetch } = useFetchProjects();

  if (isLoading) {
    return (
      <div
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        aria-label="Memuat proyek"
        aria-busy="true"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <ProjectSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="rounded-[26px] border border-red-300/15 bg-red-500/[0.06] px-6 py-14 text-center backdrop-blur-xl">
        <p className="text-sm text-red-100">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-5 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-300/20"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      variants={listVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
    >
      {projects.map((project, index) => (
        <motion.div key={project.id} variants={cardVariants}>
          <ProjectCard
            title={project.title}
            description={project.description}
            imageUrl={project.imageUrl}
            demoUrl={project.demoUrl}
            repoUrl={project.repoUrl}
            categoryLabel={project.caseType ?? "Web Application"}
            tags={project.tags ?? []}
            index={index}
            variant="mobile"
            accent={cardAccents[index % cardAccents.length]}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
