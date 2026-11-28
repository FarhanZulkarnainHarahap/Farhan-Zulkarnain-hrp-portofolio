"use client";
/**
 * Renders a scene's lazily loaded module (Fase K4). The lazy components are declared once at
 * module scope (one per scene) so React keeps their state; each loads with import() on first use.
 * The lab scene exists only in development builds.
 */
import { lazy } from "react";
import type { SceneId } from "@/lib/scene/types";
import { LOADERS, type Loader } from "./registry";

const missing: Loader = () => Promise.resolve({ default: () => null });

const Home = lazy(LOADERS.home ?? missing);
const About = lazy(LOADERS.about ?? missing);
const Skills = lazy(LOADERS.skills ?? missing);
const Journey = lazy(LOADERS.journey ?? missing);
const Projects = lazy(LOADERS.projects ?? missing);
const ProjectDetail = lazy(LOADERS["project-detail"] ?? missing);
const Contact = lazy(LOADERS.contact ?? missing);
const Lab = lazy(LOADERS.lab ?? missing);

export function SceneModule({ id }: { id: SceneId }) {
  switch (id) {
    case "home":
      return <Home id={id} />;
    case "about":
      return <About id={id} />;
    case "skills":
      return <Skills id={id} />;
    case "journey":
      return <Journey id={id} />;
    case "projects":
      return <Projects id={id} />;
    case "project-detail":
      return <ProjectDetail id={id} />;
    case "contact":
      return <Contact id={id} />;
    case "lab":
      return <Lab id={id} />;
  }
}
