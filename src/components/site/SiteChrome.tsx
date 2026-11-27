import type { ReactNode } from "react";
import { AnimationProvider } from "@/components/animation/AnimationProvider";
import { MotionController } from "@/components/motion/MotionController";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Public page frame and its layer stack (Kinetic, Fase K2; back → front, globals.css "Layer stack"):
 *   1 environment   .layer-environment — CSS grid + vignette (decorative, fixed)
 *   2 WebGL canvas  #webgl-root — persistent R3F canvas mounts here in Fase 4 (empty until then)
 *   3 3D mask       #mask-root — scroll-mask helpers of Fase 7 (empty until then)
 *   4 content       .layer-content — skip link target, pages (<main id="main-content">), footer
 *   5 interactive UI (inside content, z --z-ui) · 6 navigation (sticky header, --z-header)
 *   7 transition    #transition-root — page-transition overlay of Fase 8 (empty until then)
 *   8 modal/dialog  native <dialog> top layer (menu, ⌘K)
 * Background layers never take pointer events. The dashboard has its own frame and does not use this.
 *
 * AnimationProvider (Fase K3) wraps the frame: shared animation state, lifecycle and the single
 * scroll source (native, or Lenis loaded at idle). It renders no markup of its own, so the server
 * HTML (and the LCP) is unchanged; everything it does starts after hydration.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <AnimationProvider>
        {/* .site-frame marks public pages (scrollbar gutter rules in globals.css). */}
        <div id="top" className="site-frame contents">
          <div aria-hidden="true" className="layer-environment" />
          <div id="webgl-root" aria-hidden="true" className="layer-canvas" />
          <div id="mask-root" aria-hidden="true" className="layer-mask" />
          <a
            href="#main-content"
            className="site-scheme fixed top-[max(0.5rem,env(safe-area-inset-top,0px))] left-[max(0.5rem,env(safe-area-inset-left,0px))] z-(--z-toast) inline-flex min-h-(--hit-area-min) -translate-y-[200%] items-center rounded-pill bg-ink px-4 font-body text-small text-canvas focus-visible:translate-y-0"
          >
            Skip to content
          </a>
          <SiteHeader />
          <div className="layer-content flex flex-1 flex-col">
            {children}
            <SiteFooter />
          </div>
          <div id="transition-root" aria-hidden="true" className="layer-transition" />
          <MotionController />
        </div>
      </AnimationProvider>
    </TooltipProvider>
  );
}
