"use client";

import dynamic from "next/dynamic";
import { Component, ReactNode, useRef } from "react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useHorizontalScroll } from "./hooks/useHorizontalScroll";

const HorizontalScene = dynamic(
  () => import("./scene/HorizontalScene").then((module) => module.HorizontalScene),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-0 bg-black" />,
  },
);

class SceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Horizontal scene failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,85,255,0.22),transparent_45%),#000]" />;
    }

    return this.props.children;
  }
}

const skills = ["Next.js", "TypeScript", "Node.js", "Prisma", "PostgreSQL", "UI/UX", "GSAP", "R3F"];
const projects = ["Learnova", "Nexxora", "Market-Snap", "ReservA"];
const documents = ["Curriculum Vitae", "Fullstack Certificate", "Competency Test"];

export default function HorizontalPortfolio() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { progressRef, velocityRef } = useHorizontalScroll({ wrapperRef, trackRef });

  return (
    <main ref={wrapperRef} className="relative min-h-screen bg-black text-white">
      <SceneErrorBoundary>
        <HorizontalScene progressRef={progressRef} velocityRef={velocityRef} />
      </SceneErrorBoundary>

      <div
        ref={trackRef}
        className="relative z-10 flex h-screen w-max will-change-transform"
      >
        <section id="home" className="flex h-screen w-screen items-center px-6 pt-24 md:px-16 lg:px-24">
          <div className="max-w-xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.55em] text-cyan-300">Section 01 / About + Skills</p>
            <h1 className="text-5xl font-black uppercase leading-none text-white md:text-7xl">
              Farhan <span className="text-blue-500">Zulkarnain.</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300 md:text-base">
              Dark Tech OS portfolio rebuilt as a pinned horizontal experience. Scroll vertically to move through the 3D system nodes.
            </p>
            <div id="about" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  {skill}
                </span>
              ))}
            </div>
            <div id="skills" className="mt-8 text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">
              Hover the 3D frames to shift image textures.
            </div>
          </div>
        </section>

        <section id="projects" className="flex h-screen w-screen items-center justify-end px-6 pt-24 md:px-16 lg:px-24">
          <div className="max-w-xl text-left lg:text-right">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.55em] text-cyan-300">Section 02 / Projects</p>
            <h2 className="text-4xl font-black uppercase leading-none md:text-6xl">
              Cyberpunk <span className="text-blue-500">Tablet.</span>
            </h2>
            <p className="mt-6 text-sm leading-7 text-slate-300 md:text-base">
              Project cards are rendered as shader-driven planes inside a futuristic tablet. Scroll velocity feeds structural Z-axis distortion.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {projects.map((project) => (
                <div key={project} className="rounded-2xl border border-blue-500/20 bg-blue-500/8 p-4 shadow-[0_0_40px_rgba(37,99,235,0.12)]">
                  <p className="text-sm font-black uppercase text-white">{project}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-blue-300">Project Plane</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="documents" className="flex h-screen w-screen items-center px-6 pt-24 md:px-16 lg:px-24">
          <div className="max-w-xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.55em] text-cyan-300">Section 03 / Documents</p>
            <h2 className="text-4xl font-black uppercase leading-none md:text-6xl">
              Glass <span className="text-blue-500">Whiteboard.</span>
            </h2>
            <p className="mt-6 text-sm leading-7 text-slate-300 md:text-base">
              Verified assets live on a sci-fi glass board using high-transmission MeshPhysicalMaterial and neon text overlays.
            </p>
            <div className="mt-8 space-y-3">
              {documents.map((document) => (
                <div key={document} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-5 py-4 backdrop-blur-xl">
                  <span className="text-sm font-bold text-white">{document}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Verified</span>
                </div>
              ))}
            </div>
            <div id="contact" className="mt-8 flex gap-4 text-slate-400">
              <FaLinkedin size={23} />
              <FaInstagram size={23} />
              <FaGithub size={23} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
