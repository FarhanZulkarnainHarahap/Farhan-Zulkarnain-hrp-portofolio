"use client";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { FiExternalLink } from "react-icons/fi";
import { MouseEvent } from "react";
import Image from "next/image"; // Import Next/Image

interface CardProps {
  title: string;
  category: string;
  imageUrl: string;
  link: string;
}

export default function ProjectCard({ title, category, imageUrl, link }: CardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.15), transparent 80%)`;

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -6, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      className="relative block w-full overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md group cursor-pointer transition-all duration-300 hover:border-blue-500/40 shadow-xl"
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background }}
      />

      {/* Image Area */}
      <div className="h-48 bg-[#0a0a0a] relative overflow-hidden">
        <Image 
          src={imageUrl || "/placeholder-project.jpg"} 
          alt={title} 
          fill // Mengisi kontainer parent (h-48)
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0"
          priority={false}
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent opacity-90" />
      </div>

      {/* Content Area */}
      <div className="p-6 flex justify-between items-center relative z-10">
        <div className="leading-tight">
          <h4 className="font-bold text-[15px] text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
            {title}
          </h4>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-black mt-2">
            {category}
          </p>
        </div>
        
        {/* Icon Button */}
        <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-blue-600 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-500 text-zinc-400 group-hover:text-white">
          <FiExternalLink size={16} />
        </div>
      </div>
    </motion.a>
  );
}
