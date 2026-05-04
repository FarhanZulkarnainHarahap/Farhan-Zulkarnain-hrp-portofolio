"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LuLoader } from "react-icons/lu";
import ProjectCard from "./ProjectCard";

interface Project {
  id: string;
  title: string;
  category: string; // Pastikan ini ada di database atau set default
  imageUrl: string;
  demoUrl: string | null;
  repoUrl: string | null;
}

export default function PortfolioSection() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="flex min-h-100 w-full items-center justify-center bg-[#030406]">
      <div className="flex flex-col items-center gap-4">
        <LuLoader className="animate-spin text-blue-500" size={32} />
        <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em]">Accessing Database...</p>
      </div>
    </div>
  );

  return (
    <section id="projects" className="relative py-20 md:py-32 px-6 bg-[#030406] overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 md:w-125 md:h-125 bg-blue-600/5 blur-[100px] md:blur-[150px] -z-10" />
      
      <div className="max-w-6xl mx-auto">
        {/* Section Header - Responsive Alignment */}
        <div className="mb-12 md:mb-20 space-y-4 md:space-y-5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
             <div className="h-px w-8 md:w-12 bg-blue-500/50" />
             <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-blue-500">Selected Works</span>
          </div>
          <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-[1.1]">
            Creative <span className="text-zinc-800 md:text-zinc-800 not-italic">&</span> Solutions<span className="text-blue-600">.</span>
          </h2>
        </div>

        {/* Projects Grid - Menggunakan gap yang lebih rapat di mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {projects.length > 0 ? (
            projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <ProjectCard 
                  title={project.title} 
                  category={project.category || "Web Application"} 
                  imageUrl={project.imageUrl}
                  link={project.demoUrl || project.repoUrl || "#"}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-3xl bg-white/1">
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.4em]">No digital assets found in archive</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
