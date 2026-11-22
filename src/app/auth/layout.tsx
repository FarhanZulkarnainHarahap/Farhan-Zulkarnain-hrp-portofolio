import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Auth pages: new tokens, no site header; theme toggle in the corner. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="site-frame contents">
        <div className="fixed top-3 right-3 z-(--z-header)">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </TooltipProvider>
  );
}
