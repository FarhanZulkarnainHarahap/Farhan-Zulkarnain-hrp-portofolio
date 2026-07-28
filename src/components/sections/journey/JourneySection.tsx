"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  LuBookOpen,
  LuBriefcaseBusiness,
  LuCodeXml,
  LuGraduationCap,
  LuLayers,
  LuRocket,
} from "react-icons/lu";
import { MaskReveal } from "@/components/motion/MaskReveal";

const milestones = [
  {
    title: "Independent Web Development",
    period: "Foundation",
    icon: LuBookOpen,
    text: "Built a self-directed foundation in HTML, CSS, JavaScript, Git, responsive layout, and product-minded interface decisions.",
  },
  {
    title: "Purwadhika Full-Stack Bootcamp",
    period: "Structured Training",
    icon: LuGraduationCap,
    text: "Practiced full-stack delivery with React, Next.js, TypeScript, Node.js, Express.js, database modeling, and team-style workflows.",
  },
  {
    title: "Laravel Training",
    period: "Backend Expansion",
    icon: LuLayers,
    text: "Expanded backend thinking through Laravel patterns, MVC structure, routing, validation, and application maintenance.",
  },
  {
    title: "PT Tokio Marine Indonesia",
    period: "Internship",
    icon: LuBriefcaseBusiness,
    text: "Worked as a data-entry intern, building discipline around accuracy, operational detail, and professional communication.",
  },
  {
    title: "Portfolio Product Builds",
    period: "Current Focus",
    icon: LuRocket,
    text: "Developing end-to-end projects such as Market Snap, Nexxora, Raserva, dashboards, API integrations, and deployable web products.",
  },
];

export default function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 70%", "end 35%"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.04, 1]);

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative min-h-[100dvh] overflow-hidden px-5 py-28 sm:px-8 lg:px-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(59,130,246,0.13),transparent_32%)]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">
            Journey
          </p>
          <h2 className="mt-6 text-[clamp(2.8rem,7vw,6.5rem)] font-black uppercase leading-[0.9] tracking-normal text-white">
            <MaskReveal lines={["Learning path", "into product work."]} />
          </h2>
        </div>

        <div className="relative mt-14 grid gap-8 lg:grid-cols-[18rem_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-white/9 bg-white/[0.035] p-5">
              <LuCodeXml className="text-blue-300" size={28} />
              <p className="mt-4 text-sm leading-7 text-slate-400">
                A practical route from structured learning into real full-stack projects,
                with each milestone adding a different layer to the developer workflow.
              </p>
            </div>
          </div>

          <div className="relative">
            <svg
              className="absolute left-6 top-0 hidden h-full w-24 lg:block"
              viewBox="0 0 120 760"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <path
                d="M58 10 C 18 120, 96 180, 54 286 C 16 388, 98 436, 56 560 C 42 628, 70 690, 58 750"
                fill="none"
                stroke="rgba(148,163,184,0.16)"
                strokeWidth="2"
              />
              <motion.path
                d="M58 10 C 18 120, 96 180, 54 286 C 16 388, 98 436, 56 560 C 42 628, 70 690, 58 750"
                fill="none"
                stroke="url(#journey-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ pathLength }}
              />
              <defs>
                <linearGradient id="journey-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#93c5fd" />
                  <stop offset="0.55" stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>

            <div className="space-y-5 lg:pl-36">
              {milestones.map(({ title, period, icon: Icon, text }, index) => (
                <motion.article
                  key={title}
                  className="relative overflow-hidden rounded-[24px] border border-white/9 bg-[#070b13]/70 p-5 sm:p-6"
                  initial={{ opacity: 0, clipPath: "inset(0 0 0 100%)" }}
                  whileInView={{ opacity: 1, clipPath: "inset(0 0 0 0%)" }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 0.58, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-blue-400/70" />
                  <div className="flex gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-blue-300/25 bg-blue-500/10 text-blue-200">
                      <Icon size={21} />
                    </span>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-blue-300">
                        {period}
                      </p>
                      <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">{title}</h3>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{text}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
