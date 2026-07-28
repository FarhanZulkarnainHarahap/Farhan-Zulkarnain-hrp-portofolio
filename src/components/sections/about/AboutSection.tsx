"use client";

import { useEffect, useMemo, useState, type PointerEvent } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  LuBriefcaseBusiness,
  LuCodeXml,
  LuFileBadge,
  LuMapPin,
  LuSparkles,
} from "react-icons/lu";
import { fetchCachedJson } from "@/lib/client-cache";
import { getOptimizedImageUrl } from "@/lib/image";
import { MaskReveal } from "@/components/motion/MaskReveal";

const profileImage = getOptimizedImageUrl(
  "https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg",
  900,
);

type ProjectResponse = { success: boolean; data: Array<{ id: string }> };
type SkillResponse = Array<{ id: string; name: string }> | { data?: Array<{ id: string; name: string }> };
type DocumentResponse = { success: boolean; data: Array<{ id: string }> };

export default function AboutSection() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const blobRadius = useTransform(
    pointerX,
    [-1, 0, 1],
    [
      "34% 66% 48% 52% / 38% 42% 58% 62%",
      "28% 72% 58% 42% / 46% 38% 62% 54%",
      "58% 42% 35% 65% / 54% 46% 54% 46%",
    ],
  );
  const blobOffset = useTransform(pointerY, [-1, 1], ["-10px", "10px"]);
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    documents: 0,
  });

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      const [projects, skills, documents] = await Promise.allSettled([
        fetchCachedJson<ProjectResponse>("/api/portofolios", "portfolio-projects"),
        fetchCachedJson<SkillResponse>("/api/skills", "portfolio-skills"),
        fetchCachedJson<DocumentResponse>("/api/documents", "portfolio-documents"),
      ]);

      if (!active) return;

      const nextSkills =
        skills.status === "fulfilled"
          ? Array.isArray(skills.value)
            ? skills.value.length
            : skills.value.data?.length ?? 0
          : 0;

      setStats({
        projects:
          projects.status === "fulfilled" && projects.value.success
            ? projects.value.data.length
            : 0,
        skills: nextSkills,
        documents:
          documents.status === "fulfilled" && documents.value.success
            ? documents.value.data.length
            : 0,
      });
    };

    loadStats();
    return () => {
      active = false;
    };
  }, []);

  const statItems = useMemo(
    () => [
      { label: "Projects", value: stats.projects, icon: LuBriefcaseBusiness },
      { label: "Technologies", value: stats.skills, icon: LuCodeXml },
      { label: "Documents", value: stats.documents, icon: LuFileBadge },
      { label: "Self-Led Years", value: 1, icon: LuSparkles },
    ],
    [stats],
  );

  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      id="about"
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-transparent px-5 py-28 sm:px-8 lg:px-12"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[5%] top-[14%] h-40 w-40 bg-[radial-gradient(circle,#3b82f6_1px,transparent_1.6px)] bg-size-[14px_14px] opacity-20" />
        <div className="absolute right-0 top-1/4 h-px w-[32%] bg-linear-to-r from-blue-400/22 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <motion.div
          onPointerMove={updatePointer}
          onPointerLeave={resetPointer}
          className="mx-auto w-full max-w-[31rem]"
          initial={{ opacity: 0, clipPath: "inset(0 48% 0 48%)" }}
          whileInView={{ opacity: 1, clipPath: "inset(0 0 0 0)" }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="relative aspect-[4/5] overflow-hidden border border-blue-300/20 bg-[#07101d] p-3 shadow-[0_28px_95px_rgba(0,0,0,0.32)]"
            style={{ borderRadius: blobRadius, y: blobOffset }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(37,99,235,0.28),transparent_34%),linear-gradient(135deg,rgba(147,197,253,0.1)_1px,transparent_1px)] bg-size-[auto,22px_22px]" />
            <div className="relative h-full overflow-hidden rounded-[inherit]">
              <Image
                src={profileImage}
                alt="Farhan Zulkarnain Harahap"
                fill
                sizes="(max-width: 1024px) 86vw, 500px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#02050b]/52 via-transparent to-blue-500/8" />
            </div>
            <span className="absolute left-7 top-7 h-12 w-12 border-l border-t border-blue-200/50" />
            <span className="absolute bottom-7 right-7 h-12 w-12 border-b border-r border-cyan-200/45" />
          </motion.div>
        </motion.div>

        <div>
          <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.42em] text-blue-300 lg:justify-start">
            <span className="h-px w-10 bg-blue-400" />
            About Me
          </div>

          <h2 className="mt-6 text-center text-[clamp(2.8rem,7vw,6rem)] font-black uppercase leading-[0.9] tracking-normal text-white lg:text-left">
            <MaskReveal lines={["Builder from", "Medan."]} />
          </h2>

          <div className="mx-auto mt-7 h-px w-24 bg-linear-to-r from-blue-400 to-transparent lg:mx-0" />

          <p className="mx-auto mt-7 max-w-2xl text-center text-base leading-8 text-slate-300/76 sm:text-lg lg:mx-0 lg:text-left">
            I&apos;m Farhan Zulkarnain Harahap, a full-stack web developer focused on
            Next.js, React, Node.js, Express.js, and TypeScript. I like building
            product flows end to end: interface, API, database, deployment, and the
            little details that make a recruiter or user understand the work quickly.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            {[
              { icon: LuCodeXml, label: "Full-Stack Web Developer" },
              { icon: LuMapPin, label: "Medan, Indonesia" },
              { icon: LuSparkles, label: "Open to work, freelance, collaboration" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300"
              >
                <Icon className="text-blue-300" size={15} />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statItems.map(({ label, value, icon: Icon }) => (
              <motion.div
                key={label}
                className="min-h-30 rounded-2xl border border-white/9 bg-white/[0.035] p-4"
                initial={{ opacity: 0, scaleX: 0.82 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon className="text-blue-300" size={20} />
                <motion.p
                  className="mt-5 text-3xl font-black text-white"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  {value}
                  {label !== "Self-Led Years" && value > 0 ? "+" : ""}
                </motion.p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
