"use client";

import dynamic from "next/dynamic";
import type { SceneProject } from "./scene-types";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.1),transparent_34%),#020409]"
    />
  ),
});

export default function SceneCanvasLoader({ projects }: { projects: SceneProject[] }) {
  return <SceneCanvas projects={projects} />;
}
