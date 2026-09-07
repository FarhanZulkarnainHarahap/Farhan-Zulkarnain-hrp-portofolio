"use client";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
export interface Skill {
  id: string;
  name: string;
  category: string;
}
export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  technologies: string[];
  sortOrder?: number;
}
export function useCollection<T>(path: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiFetch(path, { signal: controller.signal });
        const body = await response.json();
        if (!response.ok || body.success === false)
          throw new Error("Unable to load this collection. Please try again.");
        const items = Array.isArray(body) ? body : body.data;
        if (!Array.isArray(items))
          throw new Error("The server returned an unexpected response.");
        if (!controller.signal.aborted) setData(items);
      } catch (err) {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error && err.name !== "TimeoutError"
              ? err.message
              : "Connection timed out. Please try again.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void run();
    return () => controller.abort();
  }, [path, revision]);
  return { data, loading, error, retry };
}
export const profile = {
  name: "Farhan Zulkarnain Harahap",
  email: "farhanzulkarnaenhrp@gmail.com",
  github: "https://github.com/FarhanZulkarnainHarahap",
  linkedin: "https://www.linkedin.com/in/farhan-zulkarnain-71801a347",
  image:
    "https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg",
};
export function safeHref(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
