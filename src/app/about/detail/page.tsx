import type { Metadata } from "next";
import Link from "next/link";
import {
  LuBadgeCheck,
  LuBriefcaseBusiness,
  LuCodeXml,
  LuDatabase,
  LuDownload,
  LuGithub,
  LuLayers,
  LuLinkedin,
  LuMapPin,
  LuRocket,
  LuServer,
  LuSparkles,
} from "react-icons/lu";
import AboutNestedShell from "@/components/navigation/AboutNestedShell";
import AboutSection from "@/components/sections/about/AboutSection";
import { getDocumentSlug } from "@/lib/portfolio/documents";
import { getDocuments, getProjects } from "@/services/api";

export const metadata: Metadata = {
  title: "About Detail",
  description:
    "Detailed profile for Farhan Zulkarnain Harahap, including professional summary, focus, services, links, documents, and availability.",
  alternates: { canonical: "/about/detail" },
};

async function getAboutData() {
  const [projects, documents] = await Promise.allSettled([getProjects(), getDocuments()]);

  const projectCount = projects.status === "fulfilled" ? projects.value.length : 0;
  const documentList = documents.status === "fulfilled" ? documents.value : [];
  const cv = documentList.find((document) =>
    `${document.name} ${document.category}`.toLowerCase().match(/cv|resume|curriculum/),
  );

  return {
    projectCount,
    documentCount: documentList.length,
    cvHref: cv ? `/api/documents/${getDocumentSlug(cv)}/download` : "/about/docs",
  };
}

export default async function AboutDetailPage() {
  const data = await getAboutData();

  return (
    <AboutNestedShell>
      <AboutSection showExplore={false} />

      <section className="relative mx-auto w-[min(calc(100%-2rem),72rem)] pb-28">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Completed Projects", value: data.projectCount || "Live", icon: LuBriefcaseBusiness },
            { label: "Main Technologies", value: "Full Stack", icon: LuCodeXml },
            { label: "Documents", value: data.documentCount || "Docs", icon: LuBadgeCheck },
            { label: "Availability", value: "Open", icon: LuSparkles },
          ].map(({ label, value, icon: Icon }) => (
            <article
              key={label}
              className="min-w-0 rounded-2xl border border-white/9 bg-[#07101d]/82 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
            >
              <Icon className="text-blue-300" size={22} />
              <p className="mt-5 text-2xl font-black text-white">{value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                {label}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[28px] border border-white/9 bg-[#050911]/86 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
              About Me
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">
              Builder From Medan.
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
              I build modern web products from interface to deployment. My focus is
              full-stack web development with Next.js, React, TypeScript, Node.js,
              REST API architecture, databases, dashboards, and responsive UI.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={data.cvHref}
                download
                className="flex min-h-12 items-center gap-3 rounded-full bg-blue-600 px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-blue-500"
              >
                Download CV
                <LuDownload size={16} />
              </a>
              <Link
                href="/contact"
                className="flex min-h-12 items-center gap-3 rounded-full border border-white/12 bg-white/5 px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:border-blue-300/60 hover:bg-blue-500/12"
              >
                Contact Me
                <LuMapPin size={16} />
              </Link>
              <a
                href="https://github.com/FarhanZulkarnainHarahap"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-white/5 text-white hover:border-blue-300/60"
              >
                <LuGithub size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/farhan-zulkarnain-71801a347"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-white/5 text-white hover:border-blue-300/60"
              >
                <LuLinkedin size={18} />
              </a>
            </div>
          </article>

          <article className="rounded-[28px] border border-blue-300/14 bg-[#07101d]/86 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
              What I Do
            </p>
            <div className="mt-5 grid gap-3">
              {[
                { title: "Frontend Development", icon: LuLayers },
                { title: "Backend and REST API", icon: LuServer },
                { title: "Database Management", icon: LuDatabase },
                { title: "Dashboard and E-Commerce", icon: LuBriefcaseBusiness },
                { title: "Deployment and Integration", icon: LuRocket },
              ].map(({ title, icon: Icon }) => (
                <div
                  key={title}
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.045] px-4 text-sm font-bold text-slate-200"
                >
                  <Icon className="shrink-0 text-blue-300" size={18} />
                  {title}
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[28px] border border-white/9 bg-[#050911]/82 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-300">
              Current Focus
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Strengthening Next.js product delivery, API architecture, dashboard
              workflows, production deployment, and recruiter-ready project case studies.
            </p>
          </article>
          <article className="rounded-[28px] border border-white/9 bg-[#050911]/82 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
              Personal Principles
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Clean code, responsive-first interfaces, user-oriented product flow,
              maintainable architecture, and continuous learning.
            </p>
          </article>
        </div>
      </section>
    </AboutNestedShell>
  );
}
