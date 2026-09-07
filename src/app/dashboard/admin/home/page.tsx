"use client";
import Link from "next/link";
import {
  Folder,
  Layers,
  FileText,
  Route,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import {
  useCollection,
  type Skill,
  type Experience,
} from "@/components/kinetic/data";
import type { Project, Document } from "@/services/api";
export default function Overview() {
  const projects = useCollection<Project>("/api/portofolios");
  const skills = useCollection<Skill>("/api/skills");
  const documents = useCollection<Document>("/api/documents");
  const experiences = useCollection<Experience>("/api/experiences");
  const collections = [
    {
      name: "Projects",
      icon: Folder,
      state: projects,
      href: "/admin/portofolio",
    },
    { name: "Capabilities", icon: Layers, state: skills, href: "/admin/skill" },
    {
      name: "Experience",
      icon: Route,
      state: experiences,
      href: "/dashboard/admin/experience",
    },
    {
      name: "Documents",
      icon: FileText,
      state: documents,
      href: "/admin/document",
    },
  ];
  const loading = collections.some((item) => item.state.loading);
  const failed = collections.filter((item) => item.state.error);
  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">CONTENT OVERVIEW</p>
          <h1>Your work, connected.</h1>
          <p>Manage what visitors see across your portfolio.</p>
        </div>
        <button
          className="button secondary"
          disabled={loading}
          onClick={() => collections.forEach((item) => item.state.retry())}
        >
          <RefreshCw size={15} />
          {loading ? "Refreshing…" : "Refresh data"}
        </button>
      </div>
      {failed.length > 0 && (
        <p className="admin-alert" role="alert">
          Unable to load{" "}
          {failed.map((item) => item.name.toLowerCase()).join(", ")}. Refresh to
          try again.
        </p>
      )}
      <div className="admin-metrics">
        {collections.map(({ name, icon: Icon, state, href }) => (
          <Link href={href} key={name}>
            <div>
              <Icon size={19} />
              <ArrowUpRight size={15} />
            </div>
            <strong>
              {state.loading ? "…" : state.error ? "—" : state.data.length}
            </strong>
            <span>{name}</span>
          </Link>
        ))}
      </div>
      <div className="admin-overview-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Recent projects</h2>
            <Link className="text-link" href="/admin/portofolio">
              View all ↗
            </Link>
          </div>
          {projects.loading ? (
            <p role="status">Loading projects…</p>
          ) : projects.error ? (
            <p>Project data unavailable.</p>
          ) : !projects.data.length ? (
            <p>No projects published yet.</p>
          ) : (
            projects.data.slice(0, 5).map((project, index) => (
              <Link
                className="admin-project-row"
                href="/admin/portofolio"
                key={project.id}
              >
                <span className="eyebrow">0{index + 1}</span>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.caseType || "Web application"}</p>
                </div>
                <ArrowUpRight size={17} />
              </Link>
            ))
          )}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Keep your story current.</h2>
          </div>
          <p>Add a new project, share a milestone, or upload your latest CV.</p>
          <div className="admin-shortcuts">
            {[
              [
                "New project",
                "Screenshots, links & case study",
                "/admin/portofolio/upload",
              ],
              [
                "Add a capability",
                "Technology & category",
                "/admin/skill/manage",
              ],
              [
                "Update your journey",
                "Roles, dates & experience",
                "/dashboard/admin/experience",
              ],
              [
                "Upload a document",
                "CV, certificates & education",
                "/admin/document/upload",
              ],
            ].map(([title, description, href]) => (
              <Link key={href} href={href}>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <span>+</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
