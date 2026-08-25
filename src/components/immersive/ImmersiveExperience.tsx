"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { fetchCachedJson } from "@/lib/client-cache";
import type { ProjectLike } from "@/lib/portfolio/projects";
import ImmersiveContent from "./ImmersiveContent";
import ImmersiveNavigation from "./ImmersiveNavigation";
import SceneCanvasLoader from "./SceneCanvasLoader";

type ProjectResponse = {
  success: boolean;
  data: ProjectLike[];
};

export default function ImmersiveExperience() {
  const [projects, setProjects] = useState<ProjectLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    void fetchCachedJson<ProjectResponse>(
      "/api/portofolios",
      "portfolio-projects",
    )
      .then((response) => {
        if (!active) return;
        if (!response.success || !Array.isArray(response.data)) {
          throw new Error("The portfolio API returned an invalid project archive.");
        }
        setProjects(response.data);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Project data is temporarily unavailable.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requestVersion]);

  return (
    <>
      <ImmersiveNavigation />
      <main
        id="main-content"
        data-immersive-root
        className="relative isolate min-h-screen overflow-x-clip bg-[#020409] text-white"
      >
        <SceneCanvasLoader projects={projects} />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[2] opacity-[0.055] mix-blend-soft-light [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%270_0_180_180%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter_id=%27n%27%3E%3CfeTurbulence_type=%27fractalNoise%27_baseFrequency=%27.9%27_numOctaves=%273%27_stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect_width=%27100%25%27_height=%27100%25%27_filter=%27url(%23n)%27_opacity=%27.8%27/%3E%3C/svg%3E')]"
        />
        <ImmersiveContent
          projects={projects}
          loading={loading}
          error={error}
          onRetry={retry}
        />
      </main>
    </>
  );
}
