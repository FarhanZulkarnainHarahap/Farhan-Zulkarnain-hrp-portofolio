"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export type RenderQuality = "low" | "medium" | "high";

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number;
};

export function useDeviceCapability() {
  const reducedMotion = useReducedMotion();
  const [quality, setQuality] = useState<RenderQuality>("medium");
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    const update = () => {
      const navigatorWithMemory = navigator as NavigatorWithMemory;
      const memory = navigatorWithMemory.deviceMemory ?? 4;
      const cores = navigator.hardwareConcurrency ?? 4;
      const finePointer = window.matchMedia("(pointer: fine)").matches;
      const compactViewport = window.innerWidth < 768;

      setHasFinePointer(finePointer);

      if (reducedMotion || compactViewport || memory <= 3 || cores <= 4) {
        setQuality("low");
        return;
      }

      if (memory >= 8 && cores >= 8 && finePointer && window.innerWidth >= 1200) {
        setQuality("high");
        return;
      }

      setQuality("medium");
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [reducedMotion]);

  return {
    quality,
    hasFinePointer,
    reducedMotion,
    maxDpr: quality === "high" ? 2 : quality === "medium" ? 1.5 : 1,
    particleCount: quality === "high" ? 1800 : quality === "medium" ? 1200 : 720,
  };
}
