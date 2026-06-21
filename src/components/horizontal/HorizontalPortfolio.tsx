"use client";

import dynamic from "next/dynamic";
import { Component, ReactNode, useEffect, useMemo, useRef, useState } from "react";
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

type SkillData = {
  id: string;
  name: string;
  iconName?: string | null;
  category?: "FRONTEND" | "BACKEND" | "TOOLS" | "OTHERS" | string | null;
};

type ProjectData = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  demoUrl?: string | null;
  repoUrl?: string | null;
  category?: string | null;
  caseType?: string | null;
  type?: string | null;
  tags?: string[] | string | null;
  techStack?: string[] | string | null;
};

type DocumentData = {
  id: string;
  name: string;
  category: string;
  size?: number;
  fileUrl?: string;
  previewUrl?: string | null;
  createdAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const about = {
  name: "Farhan Zulkarnain",
  role: "Full-Stack Web Developer & UI/UX Designer",
  bio: "I build clean full-stack products, UI systems, admin dashboards, and portfolio experiences connected to real backend data.",
};

const fallbackSkills: SkillData[] = [
  { id: "nextjs", name: "Next.js", category: "FRONTEND" },
  { id: "typescript", name: "TypeScript", category: "FRONTEND" },
  { id: "nodejs", name: "Node.js", category: "BACKEND" },
  { id: "prisma", name: "Prisma", category: "BACKEND" },
  { id: "postgresql", name: "PostgreSQL", category: "BACKEND" },
  { id: "uiux", name: "UI/UX", category: "OTHERS" },
  { id: "gsap", name: "GSAP", category: "TOOLS" },
  { id: "r3f", name: "R3F", category: "TOOLS" },
];

const splitListValue = (value?: string[] | string | null) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  return value.split(/[,|\n]/).map((item) => item.trim()).filter(Boolean);
};

const unwrapData = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "data" in payload && Array.isArray((payload as { data: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
};

export default function HorizontalPortfolio() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { progressRef, velocityRef } = useHorizontalScroll({ wrapperRef, trackRef });
  const [skills, setSkills] = useState<SkillData[]>(fallbackSkills);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadPortfolioData = async () => {
      try {
        const request = { cache: "no-store" as RequestCache };
        const [skillsResponse, projectsResponse, documentsResponse] = await Promise.all([
          fetch(`${API_URL}/api/skills`, request),
          fetch(`${API_URL}/api/portofolios`, request),
          fetch(`${API_URL}/api/documents`, request),
        ]);

        const [skillsPayload, projectsPayload, documentsPayload] = await Promise.all([
          skillsResponse.json(),
          projectsResponse.json(),
          documentsResponse.json(),
        ]);

        if (!active) return;

        const dbSkills = unwrapData<SkillData>(skillsPayload);
        setSkills(dbSkills.length ? dbSkills : fallbackSkills);
        setProjects(unwrapData<ProjectData>(projectsPayload));
        setDocuments(unwrapData<DocumentData>(documentsPayload));
      } catch (error) {
        console.error("Failed to load horizontal portfolio data:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPortfolioData();

    return () => {
      active = false;
    };
  }, []);

  const groupedSkills = useMemo(() => {
    return skills.reduce<Record<string, SkillData[]>>((acc, skill) => {
      const category = skill.category || "OTHERS";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});
  }, [skills]);

  const sceneProjects = useMemo(
    () =>
      projects.slice(0, 2).map((project, index) => ({
        id: index + 1,
        title: project.title,
        desc: project.description || "Portfolio project connected from database.",
        tech: (
          splitListValue(project.techStack).length
            ? splitListValue(project.techStack)
            : splitListValue(project.tags).length
              ? splitListValue(project.tags)
              : ["Next.js", "API"]
        ).slice(0, 3),
      })),
    [projects],
  );

  const projectCards = projects.slice(0, 6);
  const documentCards = documents.slice(0, 6);

  return (
    <main ref={wrapperRef} className="relative min-h-screen bg-black text-white">
      <SceneErrorBoundary>
        <HorizontalScene
          progressRef={progressRef}
          velocityRef={velocityRef}
          about={about}
          skills={skills.map((skill) => skill.name)}
          projects={sceneProjects}
          documents={documents.map((document) => document.name)}
        />
      </SceneErrorBoundary>

      <div
        ref={trackRef}
        className="relative z-10 flex h-screen w-max will-change-transform"
      >
        <section id="home" className="flex h-screen w-screen items-center px-6 pt-24 md:px-16 lg:px-24">
          <div className="max-w-xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.55em] text-cyan-300">Home / Live Database Portfolio</p>
            <h1 className="text-5xl font-black uppercase leading-none text-white md:text-7xl">
              Farhan <span className="text-blue-500">Zulkarnain.</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300 md:text-base">
              Dark Tech OS portfolio rebuilt as a horizontal 3D system. Skills, projects, and documents are loaded from the same database used by the admin dashboard.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["Skills", skills.length],
                ["Projects", projects.length],
                ["Documents", documents.length],
              ].map(([label, total]) => (
                <div key={label} className="rounded-2xl border border-blue-500/20 bg-blue-500/8 p-4">
                  <p className="text-2xl font-black text-white">{total}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.24em] text-blue-300">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">
              {loading ? "Syncing database nodes..." : "Database nodes synchronized."}
            </div>
          </div>
        </section>

        <section id="about" className="flex h-screen w-screen items-center px-6 pt-24 md:px-16 lg:px-24">
          <div className="max-w-3xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.55em] text-cyan-300">Section 01 / About</p>
            <h2 className="text-4xl font-black uppercase leading-none md:text-6xl">
              Code Is My <span className="text-blue-500">Language.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{about.bio}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Fullstack Dev", "System Architecture", "UI/UX Strategy"].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="flex h-screen w-screen items-center px-6 pt-24 md:px-16 lg:px-24">
          <div className="w-full max-w-5xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.55em] text-cyan-300">Section 02 / Skills Database</p>
            <h2 className="text-4xl font-black uppercase leading-none md:text-6xl">
              My <span className="text-blue-500">Expertise.</span>
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <div key={category} className="rounded-[28px] border border-blue-500/15 bg-[#07101d]/75 p-5 backdrop-blur-xl">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.35em] text-[#00ffcc]">{category}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span key={skill.id} className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="flex h-screen w-screen items-center px-6 pt-24 md:px-16 lg:px-24">
          <div className="w-full max-w-6xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.55em] text-cyan-300">Section 03 / Projects Database</p>
            <h2 className="text-4xl font-black uppercase leading-none md:text-6xl">
              Projects Built With <span className="text-blue-500">Purpose.</span>
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {projectCards.length ? projectCards.map((project) => (
                <article key={project.id} className="rounded-[28px] border border-blue-500/15 bg-[#07101d]/78 p-4 shadow-[0_0_50px_rgba(37,99,235,0.12)] backdrop-blur-xl">
                  <div className="h-28 rounded-2xl border border-white/10 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.8), transparent), url(${project.imageUrl || ""})` }} />
                  <p className="mt-4 text-[9px] font-black uppercase tracking-[0.28em] text-[#00ffcc]">{project.category || project.caseType || project.type || "Web Application"}</p>
                  <h3 className="mt-2 text-lg font-black uppercase text-white">{project.title}</h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{project.description}</p>
                </article>
              )) : (
                <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 md:col-span-3">
                  No database projects found
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="documents" className="flex h-screen w-screen items-center px-6 pt-24 md:px-16 lg:px-24">
          <div className="max-w-xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.55em] text-cyan-300">Section 04 / Documents Database</p>
            <h2 className="text-4xl font-black uppercase leading-none md:text-6xl">
              Glass <span className="text-blue-500">Whiteboard.</span>
            </h2>
            <p className="mt-6 text-sm leading-7 text-slate-300 md:text-base">
              Verified assets loaded from your document endpoint and mirrored into the 3D glass board.
            </p>
            <div className="mt-8 space-y-3">
              {documentCards.length ? documentCards.map((document) => (
                <div key={document.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-5 py-4 backdrop-blur-xl">
                  <span className="text-sm font-bold text-white">{document.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">{document.category}</span>
                </div>
              )) : (
                <div className="rounded-3xl border border-dashed border-white/10 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                  No database documents found
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="contact" className="flex h-screen w-screen items-center justify-center px-6 pt-24 md:px-16 lg:px-24">
          <div className="max-w-xl text-center">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.55em] text-cyan-300">Section 05 / Contact</p>
            <h2 className="text-4xl font-black uppercase leading-none md:text-6xl">
              Get In <span className="text-blue-500">Touch.</span>
            </h2>
            <p className="mt-6 text-sm leading-7 text-slate-300 md:text-base">
              Open for full-stack development, UI systems, and dashboard projects.
            </p>
            <div className="mt-8 flex justify-center gap-4 text-slate-400">
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
