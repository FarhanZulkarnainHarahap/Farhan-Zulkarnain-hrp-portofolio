"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaGithub, FaStar } from "react-icons/fa";
import { FiArrowUpRight, FiBookOpen } from "react-icons/fi";

interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string | null;
  repoUrl: string | null;
  index: number;
  variant: "featured" | "orbit" | "mobile";
  accent?: string;
  onSelect?: () => void;
  onDetails?: () => void;
}

export default function ProjectCard({
  title,
  description,
  imageUrl,
  demoUrl,
  repoUrl,
  index,
  variant,
  accent = "#3b82f6",
  onSelect,
  onDetails,
}: CardProps) {
  const isFeatured = variant !== "orbit";
  const projectNumber = String(index + 1).padStart(2, "0");
  const fallbackDescription = "A carefully crafted digital product with a clean and scalable interface.";
  const cardStyle = {
    "--project-accent": accent,
    borderColor: `${accent}70`,
    boxShadow: `0 16px 42px ${accent}14`,
  } as CSSProperties;

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={cardStyle}
      className={`group relative overflow-hidden border bg-[#080b14]/98 ${
        variant === "featured"
          ? "w-92 rounded-[28px] p-3 xl:w-100"
          : variant === "mobile"
            ? "w-full rounded-[26px] p-2.5"
            : "w-62 rounded-[22px] p-2.5 xl:w-68"
      }`}
    >
      {variant === "orbit" && (
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Show project ${title}`}
          data-cursor-label="SELECT"
          className="absolute inset-0 z-30"
        />
      )}

      <div className={`relative overflow-hidden rounded-[18px] bg-slate-950 ${variant === "orbit" ? "h-36" : "h-38 sm:h-42 lg:h-44"}`}>
        <Image
          src={imageUrl || "/placeholder-project.jpg"}
          alt={title}
          fill
          sizes={variant === "orbit" ? "272px" : "(max-width: 768px) 100vw, 400px"}
          className="object-cover opacity-85 transition-[transform,opacity] duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#060812] via-transparent to-transparent" />
      </div>

      <span
        className="absolute left-1 top-1 flex h-9 w-9 items-center justify-center rounded-full border bg-[#071020] font-mono text-xs font-black text-white shadow-lg"
        style={{ borderColor: accent, boxShadow: `0 0 18px ${accent}80` }}
      >
        {projectNumber}
      </span>

      {variant === "featured" && (
        <span
          className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border bg-[#071020]/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-white shadow-lg"
          style={{ borderColor: accent, boxShadow: `0 0 18px ${accent}40` }}
        >
          <FaStar className="text-yellow-300" size={10} />
          Featured
        </span>
      )}

      <div className={variant === "orbit" ? "px-2 pb-2 pt-4" : "px-3 pb-3 pt-4 text-center"}>
        <p className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: accent }}>
          Web Application
        </p>
        <h3 className={`mt-2 font-black uppercase tracking-tight text-white ${variant === "orbit" ? "text-lg" : "text-xl sm:text-2xl"}`}>
          {title}
        </h3>

        {isFeatured && (
          <>
            <p className="mx-auto mt-3 line-clamp-3 max-w-xs text-[11px] leading-relaxed text-zinc-400 sm:text-xs">
              {description || fallbackDescription}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {["Responsive UI", "Modern Web", "Scalable"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/4 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              {onDetails && (
                <button
                  type="button"
                  onClick={onDetails}
                  data-cursor-label="CASE"
                  aria-label={`Open case study for ${title}`}
                  className="group/case flex h-10 items-center gap-2 rounded-full border border-blue-500/35 bg-blue-500/12 px-4 text-[9px] font-black uppercase tracking-[0.16em] text-blue-200 transition-all hover:scale-105 hover:border-blue-300 hover:bg-blue-500 hover:text-white"
                >
                  <FiBookOpen size={14} />
                  Case
                </button>
              )}
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="OPEN"
                  aria-label={`Open demo ${title}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_0_22px_rgba(37,99,235,0.6)] transition-transform hover:scale-110"
                >
                  <FiArrowUpRight size={18} />
                </a>
              )}
              {repoUrl && (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="CODE"
                  aria-label={`Open repository ${title}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:scale-110 hover:bg-white/15"
                >
                  <FaGithub size={17} />
                </a>
              )}
            </div>
          </>
        )}

        {variant === "orbit" && (
          <>
            <p className="mt-3 line-clamp-3 text-[10px] leading-relaxed text-zinc-400">
              {description || fallbackDescription}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
              <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-zinc-500">View Case</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white transition-colors group-hover:bg-white/10">
                <FiArrowUpRight size={14} />
              </span>
            </div>
          </>
        )}
      </div>
    </motion.article>
  );
}
