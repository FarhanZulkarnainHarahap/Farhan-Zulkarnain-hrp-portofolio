"use client";
/**
 * AnimationProvider (Fase K3): the global animation infrastructure for public pages, mounted once
 * by SiteChrome. It loads no animation library itself (first paint is unaffected); it only wires
 * the shared state and the lifecycle:
 *
 *   ReducedMotionProvider  → snapshot.reducedMotion (live)
 *   quality estimate       → snapshot.quality (cheap signals; WebGL is probed by 3D scenes only)
 *   lifecycle              → visibility pause/resume, resize/fonts, pointer + interaction mode
 *   route                  → previous/current route, disposes the "route" animation scope
 *   sections               → snapshot.activeSection
 *   SmoothScrollProvider   → the single scroll source (native, or Lenis loaded at idle)
 *
 * MotionController (GSAP page intros/reveals, Fase 8) and later the persistent canvas (Fase 4)
 * sit beside it and read the same state. MotionProvider (Motion UI) and TheatreProvider are
 * mounted only where they are used, to keep their code off pages that do not need it.
 */
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { exposeDebug } from "@/lib/animation/controller";
import { enterRoute, notifyLayoutChange, observeSections, startPointer, startResize, startVisibility } from "@/lib/animation/lifecycle";
import { estimateTier } from "@/lib/animation/quality";
import { animationStore } from "@/lib/animation/state";
import { ReducedMotionProvider } from "./ReducedMotionProvider";
import { SmoothScrollProvider } from "./SmoothScrollProvider";

export function AnimationProvider({ children }: { children?: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    exposeDebug();
    animationStore.set({ quality: estimateTier().tier });
    const stops = [startVisibility(), startResize(), startPointer()];
    return () => stops.forEach((stop) => stop());
  }, []);

  useEffect(() => {
    enterRoute(pathname);
    let stopSections = () => {};
    // After the new page has committed and Next has scrolled it.
    const frame = requestAnimationFrame(() => {
      const main = document.getElementById("main-content");
      if (main) stopSections = observeSections(main);
      notifyLayoutChange();
    });
    return () => {
      cancelAnimationFrame(frame);
      stopSections();
    };
  }, [pathname]);

  return (
    <ReducedMotionProvider>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </ReducedMotionProvider>
  );
}
