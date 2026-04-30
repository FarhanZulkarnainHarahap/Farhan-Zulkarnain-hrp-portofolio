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
  console.log(API_URL) 
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/api/portofolios`);
        const result = await res.json();
        
        // Sesuaikan dengan struktur response API kamu (result.data)
        if (result.success) {
          setProjects(result.data);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return (
    <div className="flex h-96 w-full items-center justify-center bg-[#030406]">
      <div className="flex flex-col items-center gap-4">
        <LuLoader className="animate-spin text-blue-500" size={40} />
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Accessing Database...</p>
      </div>
    </div>
  );

  return (
    <section id="portfolio" className="relative py-32 px-6 bg-[#030406] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/5 blur-[150px] -z-10" />
      
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-20 space-y-5">
          <div className="flex items-center gap-4">
             <div className="h-px w-12 bg-blue-500/50" />
             <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500">Selected Works</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">
            Creative <span className="text-zinc-800 not-italic">&</span> Solutions<span className="text-blue-600">.</span>
          </h2>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.length > 0 ? (
            projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <ProjectCard 
                  title={project.title} 
                  category={project.category || "Web Application"} 
                  imageUrl={project.imageUrl}
                  // Redirect ke demoUrl, jika kosong lari ke repoUrl, jika kosong lari ke #
                  link={project.demoUrl || project.repoUrl || "#"}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center border border-dashed border-white/5 rounded-[40px] bg-white/1">
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.4em]">No digital assets found in archive</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
