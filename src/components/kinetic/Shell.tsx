"use client";
import { MotionPreference } from "../three/motionPreference";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import SceneHost from "../three/controllers/SceneHost";
import { SceneProvider } from "./SceneState";
function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const move = (event: PointerEvent) => {
      if (!ref.current) return;
      const target = event.target as HTMLElement;
      const label =
        target.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
      ref.current.style.transform = `translate3d(${event.clientX + 16}px,${event.clientY + 16}px,0)`;
      ref.current.textContent = label || "";
      ref.current.hidden =
        !query.matches ||
        !label ||
        Boolean(target.closest("input,textarea,select"));
    };
    document.addEventListener("pointermove", move);
    return () => document.removeEventListener("pointermove", move);
  }, []);
  return <div className="kinetic-cursor" hidden ref={ref} aria-hidden="true" />;
}
// LEGACY content frame (Fase 4: the site header/footer now come from the (site) layout).
// Removed in Fase 11 once every page is rebuilt.
export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <SceneProvider>
        {/* display: contents; scopes legacy-kinetic.css to the old page bodies */}
        <div className="legacy-root legacy-page">
          <main id="main-content" className="kinetic-main">
            <motion.div key={pathname} initial={false}>
              {children}
            </motion.div>
          </main>
          <SceneHost />
          <MotionPreference />
          <Cursor />
        </div>
      </SceneProvider>
    </MotionConfig>
  );
}
