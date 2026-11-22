import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Public page frame: skip link, header, page content, footer. Pages render their own
 * <main id="main-content">. The dashboard has its own (frozen) frame and does not use this.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <div id="top" className="contents">
        <a
          href="#main-content"
          className="site-scheme fixed top-2 left-2 z-(--z-toast) -translate-y-[200%] rounded-pill bg-ink px-4 py-2 font-body text-small text-canvas focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </TooltipProvider>
  );
}
