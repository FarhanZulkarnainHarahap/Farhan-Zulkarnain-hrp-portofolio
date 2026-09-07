"use client";
import Link from "next/link";
import { useState } from "react";
import SpatialSystem from "./SpatialSystem";
import type { Project } from "@/services/api";
import { getProjectSlug } from "@/lib/portfolio/projects";
import { safeHref, useCollection } from "./data";
import { CollectionState, Media, SectionHeading } from "./Primitives";
import { useScene } from "./SceneState";
export default function Projects({
  selectedOnly = false,
}: {
  selectedOnly?: boolean;
}) {
  const state = useCollection<Project>("/api/portofolios");
  const [selected, setSelected] = useState(0);
  const { setMode, setActive } = useScene();
  const projects = selectedOnly ? state.data.slice(0, 4) : state.data;
  const current = projects[Math.min(selected, projects.length - 1)];
  return (
    <section className="section project-section" id="work">
      <SectionHeading
        number="04"
        label={selectedOnly ? "SELECTED WORK" : "PROJECT EXPLORER"}
        title="Ideas, engineered into reality."
        description="A closer look at the interfaces, systems, and decisions behind my work."
      />
      <CollectionState {...state} empty={!projects.length} />
      {current && !state.error && (
        <div className="project-explorer">
          <div className="project-list" aria-label="Select a project">
            {projects.map((project, i) => (
              <button
                key={project.id}
                className={current.id === project.id ? "selected" : ""}
                aria-pressed={current.id === project.id}
                onClick={() => setSelected(i)}
                onFocus={() => {
                  setSelected(i);
                  setMode("project");
                  setActive(project.title);
                }}
                onPointerEnter={() => {
                  setSelected(i);
                  setMode("project");
                  setActive(project.title);
                }}
              >
                <span className="eyebrow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{project.title}</span>
                <span>↗</span>
              </button>
            ))}
          </div>
          <div className="project-stage">
            <Link
              className="browser-window"
              href={`/projects/${getProjectSlug(current)}`}
              data-cursor="VIEW"
            >
              <div className="browser-bar">
                <span className="browser-dots">● ● ●</span>
                <span>
                  {safeHref(current.demoUrl)
                    ? new URL(current.demoUrl!).hostname
                    : current.title}
                </span>
                <span>↗</span>
              </div>
              <Media
                key={current.imageUrl}
                src={current.imageUrl}
                alt={`${current.title} project screenshot`}
              />
            </Link>
            <div className="project-summary">
              <div>
                <p className="eyebrow">
                  {current.caseType || "WEB APPLICATION"}
                </p>
                <h3>{current.title}</h3>
              </div>
              <Link
                className="text-link"
                href={`/projects/${getProjectSlug(current)}`}
              >
                Explore project ↗
              </Link>
            </div>
            <p className="project-description">{current.description}</p>
          </div>
          <aside className="project-meta">
            <p className="eyebrow">BUILT WITH</p>
            <div className="tags">
              {current.tags.slice(0, 10).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            {current.tags.length > 10 && (
              <Link
                className="text-link"
                href={`/projects/${getProjectSlug(current)}`}
              >
                +{current.tags.length - 10} more ↗
              </Link>
            )}
            {!current.tags.length && (
              <p>See the project for implementation details.</p>
            )}
            <div className="project-links">
              {safeHref(current.demoUrl) && (
                <a
                  href={safeHref(current.demoUrl)}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="OPEN"
                >
                  Live website ↗
                </a>
              )}
              {safeHref(current.repoUrl) && (
                <a
                  href={safeHref(current.repoUrl)}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="LINK"
                >
                  Source code ↗
                </a>
              )}
            </div>
            <div className="project-spatial">
              <SpatialSystem />
            </div>
          </aside>
        </div>
      )}
      {selectedOnly && (
        <Link className="text-link all-projects" href="/projects">
          View all projects <span>↗</span>
        </Link>
      )}
    </section>
  );
}
