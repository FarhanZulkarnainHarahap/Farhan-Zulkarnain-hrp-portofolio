"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";

const PROJECT_PATH = "/api/portofolios";
const REQUEST_TIMEOUT_MS = 8_000;

export const PROJECT_API_ORIGINS = [
  "https://nest-api.farhanzulkarnainhrp.com",
  "https://api.farhanzulkarnainhrp.com",
] as const;

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string | null;
  repoUrl: string | null;
  caseType?: string | null;
  tags?: string[] | null;
  features?: string[] | null;
}

interface ProjectPayload {
  success?: boolean;
  data?: unknown;
}

const isProject = (value: unknown): value is PortfolioProject => {
  if (!value || typeof value !== "object") return false;
  const project = value as Record<string, unknown>;

  return (
    typeof project.id === "string" &&
    typeof project.title === "string" &&
    typeof project.description === "string" &&
    typeof project.imageUrl === "string"
  );
};

async function requestProjects(origin: string, signal: AbortSignal) {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(signal.reason);
  const timeout = window.setTimeout(
    () => controller.abort("Project request timed out"),
    REQUEST_TIMEOUT_MS,
  );

  signal.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const response = await fetch(`${origin}${PROJECT_PATH}`, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`${origin} returned HTTP ${response.status}`);
    }

    const payload = (await response.json()) as ProjectPayload;
    if (!Array.isArray(payload.data)) {
      throw new Error(`${origin} returned an invalid project payload`);
    }

    return payload.data.filter(isProject);
  } finally {
    window.clearTimeout(timeout);
    signal.removeEventListener("abort", abortFromCaller);
  }
}

async function fetchWithFailover(signal: AbortSignal) {
  const errors: string[] = [];

  for (const origin of PROJECT_API_ORIGINS) {
    if (signal.aborted) throw new DOMException("Request aborted", "AbortError");

    try {
      return await requestProjects(origin, signal);
    } catch (error) {
      if (signal.aborted) throw error;
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(`Semua API proyek tidak tersedia. ${errors.join(" | ")}`);
}

export function useFetchProjects() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    void fetchWithFailover(controller.signal)
      .then((data) => {
        setProjects(data);
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Gagal mengambil data proyek.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [requestVersion]);

  return { projects, isLoading, error, refetch };
}
