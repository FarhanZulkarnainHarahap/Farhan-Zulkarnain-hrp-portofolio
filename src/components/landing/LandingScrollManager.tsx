"use client";

import { useEffect } from "react";

type LandingSection = "home" | "about" | "projects" | "journey" | "contact";

export default function LandingScrollManager({
  initialSection,
}: {
  initialSection: LandingSection;
}) {
  useEffect(() => {
    if (initialSection === "home") {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(initialSection)?.scrollIntoView({
        block: "start",
        behavior: "auto",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialSection]);

  return null;
}
