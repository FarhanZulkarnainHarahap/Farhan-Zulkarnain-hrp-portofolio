"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const getRouteLabel = (pathname: string) => {
  if (pathname === "/" || pathname === "/home" || pathname === "/dashboard/user") return "Home";
  return pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ?? "Portfolio";
};

export default function PageTransition() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[10040] grid place-items-center bg-[#030406]"
        initial={{ clipPath: "inset(0 0 0 100%)" }}
        animate={{ clipPath: "inset(0 0 0 100%)" }}
        exit={{ clipPath: "inset(0 100% 0 0)" }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-200">
          {getRouteLabel(pathname)}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
