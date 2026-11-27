import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabLoader } from "./LabLoader";

/**
 * /dev/animation-lab (Fase K3) — DEVELOPMENT ONLY. Proves the animation engines work together
 * (GSAP, ScrollTrigger, Lenis, Motion, Theatre.js, R3F, maath, GLSL, postprocessing). In a
 * production build this route is a 404 and the lab code is not bundled (LabLoader).
 */
export const metadata: Metadata = {
  title: "Animation lab (development)",
  robots: { index: false, follow: false },
};

export default function AnimationLabPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main id="main-content" className="flex-1">
      <LabLoader />
    </main>
  );
}
