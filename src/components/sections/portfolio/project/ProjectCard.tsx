"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import { FaGithub, FaStar } from "react-icons/fa";
import { FiArrowUpRight, FiBookOpen } from "react-icons/fi";
import { getOptimizedImageUrl } from "@/lib/image";

interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string | null;
  repoUrl: string | null;
  categoryLabel?: string;
  tags?: string[];
  index: number;
  variant: "featured" | "orbit" | "mobile" | "showcase";
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
  categoryLabel = "Web Application",
  tags = ["Responsive UI", "Modern Web", "Scalable"],
  index,
  variant,
  accent = "#3b82f6",
  onSelect,
  onDetails,
}: CardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const isFeatured = variant !== "orbit";
  const projectNumber = String(index + 1).padStart(2, "0");
  const fallbackDescription = "A carefully crafted digital product with a clean and scalable interface.";
  const cardStyle = {
    "--project-accent": accent,
    "--tilt-x": "0deg",
    "--tilt-y": "0deg",
    "--tilt-glow-x": "50%",
    "--tilt-glow-y": "50%",
    borderColor: `${accent}70`,
    boxShadow: `0 16px 42px ${accent}14`,
  } as CSSProperties;

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    cardRef.current.style.setProperty("--tilt-x", `${(0.5 - y) * 5}deg`);
    cardRef.current.style.setProperty("--tilt-y", `${(x - 0.5) * 6}deg`);
    cardRef.current.style.setProperty("--tilt-glow-x", `${x * 100}%`);
    cardRef.current.style.setProperty("--tilt-glow-y", `${y * 100}%`);
  };

  const resetTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--tilt-x", "0deg");
    cardRef.current.style.setProperty("--tilt-y", "0deg");
    cardRef.current.style.setProperty("--tilt-glow-x", "50%");
    cardRef.current.style.setProperty("--tilt-glow-y", "50%");
  };

  return (
    <article
      ref={cardRef}
      style={cardStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      className={`premium-tilt group relative overflow-hidden border bg-[#080b14]/95 backdrop-blur-xl ${
        variant === "featured"
          ? "w-92 rounded-[28px] p-3 xl:w-100"
        : variant === "showcase"
          ? "w-[86vw] shrink-0 rounded-[28px] p-3 sm:w-[76vw] sm:max-w-190 lg:grid lg:w-190 lg:grid-cols-[1.08fr_0.92fr] lg:gap-5 lg:p-4"
        : variant === "mobile"
            ? "grid w-full grid-cols-[0.92fr_1fr] gap-4 rounded-[26px] p-3 sm:grid-cols-[0.82fr_1fr] sm:items-center sm:gap-5 md:p-4 lg:block lg:rounded-[20px] lg:p-2"
            : "w-62 rounded-[22px] p-2.5 xl:w-68"
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at var(--tilt-glow-x) var(--tilt-glow-y), color-mix(in srgb, var(--project-accent) 20%, transparent), transparent 34%)",
        }}
      />
      {variant === "orbit" && (
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Show project ${title}`}
          data-cursor-label="SELECT"
          className="absolute inset-0 z-30"
        />
      )}

      <div className={`relative overflow-hidden bg-slate-950 ${
        variant === "orbit"
          ? "h-36 rounded-[18px]"
          : variant === "showcase"
            ? "h-54 rounded-[22px] sm:h-68 lg:h-full lg:min-h-96"
          : "h-full min-h-44 rounded-[20px] sm:min-h-48 sm:rounded-[18px] md:min-h-52 lg:h-30 lg:min-h-0"
      }`}>
        <Image
          src={getOptimizedImageUrl(imageUrl || "/placeholder-project.jpg", 900)}
          alt={title}
          fill
          sizes={
            variant === "orbit"
              ? "272px"
              : variant === "showcase"
                ? "(max-width: 1023px) 86vw, 760px"
                : "(max-width: 768px) 100vw, 400px"
          }
          className="object-cover opacity-85 transition-[transform,opacity] duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#060812] via-transparent to-transparent" />
      </div>

      <span
        className={`absolute left-3 top-3 h-10 w-10 items-center justify-center rounded-full border bg-[#071020] font-mono text-xs font-black text-white shadow-lg sm:h-9 sm:w-9 lg:left-2.5 lg:top-2.5 lg:h-7 lg:w-7 lg:text-[9px] ${variant === "mobile" ? "hidden" : "flex"}`}
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

      <div className={
        variant === "orbit"
          ? "px-2 pb-2 pt-4"
          : variant === "showcase"
            ? "flex min-w-0 flex-col justify-center px-2 pb-3 pt-5 text-left sm:px-4 lg:p-3"
            : "flex min-w-0 flex-col justify-center px-1 py-1 text-left lg:px-3 lg:pb-2 lg:pt-3 lg:text-center"
      }>
        <p className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.16em] sm:text-xs lg:block lg:line-clamp-1 lg:text-[9px] lg:tracking-[0.24em]" style={{ color: accent }}>
          <span className="lg:hidden text-xl font-black leading-none">{projectNumber}</span>
          {categoryLabel}
        </p>
        <h3 className={`mt-2 line-clamp-2 font-black tracking-tight text-white ${variant === "orbit" ? "text-lg" : "text-2xl leading-tight sm:text-3xl lg:mt-1.5 lg:text-lg"}`}>
          {title}
        </h3>

        {isFeatured && (
          <>
            <p className="mt-3 line-clamp-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base md:text-lg lg:mx-auto lg:mt-1.5 lg:line-clamp-2 lg:max-w-sm lg:text-[11px] lg:leading-4">
              {description || fallbackDescription}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 lg:mt-2 lg:justify-center">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-300 lg:px-2.5 lg:py-0.5 lg:text-[8px] lg:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 lg:mt-2 lg:justify-center">
              {onDetails && (
                <button
                  type="button"
                  onClick={onDetails}
                  data-cursor-label="CASE"
                  aria-label={`Open case study for ${title}`}
                  className="group/case flex h-11 items-center gap-2 rounded-full border border-blue-500/35 bg-blue-500/12 px-4 text-[9px] font-black uppercase tracking-[0.16em] text-blue-200 transition-all hover:scale-105 hover:border-blue-300 hover:bg-blue-500 hover:text-white lg:h-8 lg:px-3"
                >
                  <FiBookOpen size={14} />
                  <span className="hidden sm:inline lg:hidden">Case Study</span>
                  <span className="sm:hidden lg:inline">Case</span>
                </button>
              )}
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="OPEN"
                  aria-label={`Open demo ${title}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_0_22px_rgba(37,99,235,0.6)] transition-transform hover:scale-110 lg:h-8 lg:w-8"
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
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:scale-110 hover:bg-white/15 lg:h-8 lg:w-8"
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
    </article>
  );
}
