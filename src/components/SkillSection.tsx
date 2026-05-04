"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import * as Lu from "react-icons/lu";
import * as Fa from "react-icons/fa6";
import * as Si from "react-icons/si";
import * as Di from "react-icons/di";
interface SkillData {
  id: string;
  name: string;
  iconName: string;
  category: "FRONTEND" | "BACKEND" | "TOOLS" | "OTHERS";
}
import { LuLoader } from "react-icons/lu";
// --- HELPER: RENDER ICON ---
const DynamicIcon = ({ name }: { name: string }) => {
  const allIcons: any = { ...Lu, ...Fa, ...Si, ...Di };
  const normalized = name.toLowerCase().replace(/\.js/g, 'dotjs').replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const foundKey = Object.keys(allIcons).find((key) => 
    key.toLowerCase() === name.toLowerCase() || key.toLowerCase() === `si${normalized}`
  );
  const Icon = foundKey ? allIcons[foundKey] : Lu.LuShieldAlert;
  return <Icon size={26} />; // Ukuran icon diperbesar dikit sesuai request
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export default function SkillSection() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState<{id: number, size: number, x: number, y: number, duration: number}[]>([]);
  useEffect(() => {
    // 1. Fetch Data
    fetch(`${API_URL}/api/skills`)
      .then(res => res.json())
      .then(data => {
        setSkills(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      });

    // 2. Generate Bintang Galaxy (Animasi Bergerak)
    const generatedStars = [...Array(30)].map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 0.5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 5 + 3,
    }));
    setStars(generatedStars);
  }, []);

  // --- LOGIKA GROUPING ---
  const groupedSkills = useMemo(() => {
    return skills.reduce((acc: any, skill) => {
      const cat = skill.category || "OTHERS";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [skills]);

  const categoryOrder = ["FRONTEND", "BACKEND", "TOOLS"];

  return (
    <div className="relative w-full flex flex-col gap-6 md:gap-8 overflow-visible">
      
      {/* 🌌 LAYER ANIMASI GALAXY (Background) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden min-h-125">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            animate={{ 
              opacity: [0.1, 0.7, 0.1], 
              scale: [1, 1.4, 1],
              y: [0, -40, 0] 
            }}
            transition={{ 
              duration: star.duration, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: star.id * 0.1
            }}
            style={{ 
              position: "absolute",
              left: `${star.x}%`, 
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`
            }}
            className="bg-blue-400 rounded-full blur-[0.8px] shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        ))}
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 w-full flex flex-col gap-6">
        {loading ? (
          <div className="flex min-h-100 w-full items-center justify-center bg-[#030406]">
                <div className="flex flex-col items-center gap-4">
                  <LuLoader className="animate-spin text-blue-500" size={32} />
                  <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em]">Loading</p>
                </div>
              </div>
        ) : (
          categoryOrder.map((catKey, idx) => {
            const skillsInCat = groupedSkills[catKey];
            if (!skillsInCat || skillsInCat.length === 0) return null;

            return (
              <motion.div 
                key={catKey}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="w-full"
              >
                {/* Header Kategori - Dibuat Rapat agar muat 1 Screen */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <Lu.LuCode size={14} />
                  </div>
                  <h4 className="text-zinc-200 font-bold text-[9px] tracking-[0.5em] uppercase italic">
                    {catKey}
                  </h4>
                  <div className="h-px flex-1 bg-linear-to-r from-zinc-800 to-transparent" />
                </div>

                {/* Grid Skill Ikon */}
                <div className="flex flex-wrap gap-x-10 gap-y-6 pl-2">
                  {skillsInCat.map((skill: SkillData) => (
                    <motion.div 
                      key={skill.id}
                      whileHover={{ y: -6, scale: 1.1 }}
                      className="group relative flex flex-col items-center justify-center min-w-15"
                    >
                      {/* Aura Glow saat Hover */}
                      <div className="absolute inset-0 bg-blue-500/20 blur-[25px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      {/* Icon */}
                      <div className="relative z-10 text-zinc-500 group-hover:text-blue-400 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.7)] transition-all duration-500">
                        <DynamicIcon name={skill.iconName || skill.name} />
                      </div>
                      
                      {/* Name Label */}
                      <span className="relative z-10 mt-2 text-[8px] font-black text-zinc-600 group-hover:text-white uppercase tracking-[0.2em] transition-colors text-center">
                        {skill.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
