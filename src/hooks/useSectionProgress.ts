"use client";

import { useEffect, useRef } from "react";

export function useSectionProgress(sectionId: string) {
  const progressRef = useRef(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = document.getElementById(sectionId);
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const travel = Math.max(rect.height + window.innerHeight, 1);
      progressRef.current = Math.min(
        1,
        Math.max(0, (window.innerHeight - rect.top) / travel),
      );
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [sectionId]);

  return progressRef;
}
