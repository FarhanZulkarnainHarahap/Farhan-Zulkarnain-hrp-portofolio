"use client";
import { useState, type ReactNode } from "react";
import { useCollection } from "@/hooks/useCollection";
import type { Loaded } from "@/lib/server/content";

export type CollectionState<T> = {
  data: T[];
  loading: boolean;
  error: string;
  retry: () => void;
};

function LiveCollection<T>({
  path,
  children,
}: {
  path: string;
  children: (state: CollectionState<T>) => ReactNode;
}) {
  return children(useCollection<T>(path));
}

/**
 * Renders server-fetched data (in the initial HTML, good for SEO). When the server read failed,
 * the section shows its error state; "Try again" then switches to a browser read through
 * useCollection, which keeps its own loading / error / retry cycle.
 */
export function ServerCollection<T>({
  initial,
  path,
  children,
}: {
  initial: Loaded<T>;
  path: string;
  children: (state: CollectionState<T>) => ReactNode;
}) {
  const [live, setLive] = useState(false);
  if (live) return <LiveCollection<T> path={path}>{children}</LiveCollection>;
  return children({
    data: initial.data,
    loading: false,
    error: initial.error ?? "",
    retry: () => setLive(true),
  });
}
