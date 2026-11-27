"use client";
/**
 * Loads the animation lab on the client, in development only: with NODE_ENV replaced at build
 * time, a production build keeps `() => null` and drops the import (and three, R3F, Theatre,
 * Studio with it) from the bundle.
 */
import dynamic from "next/dynamic";

export const LabLoader =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@/components/dev/animation-lab/AnimationLab"), {
        ssr: false,
        loading: () => <p className="px-gutter py-section-sm font-meta text-label text-muted uppercase">Loading animation lab…</p>,
      })
    : () => null;
