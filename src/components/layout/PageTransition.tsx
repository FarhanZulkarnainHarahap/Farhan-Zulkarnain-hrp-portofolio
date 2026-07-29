"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const getRouteLabel = (pathname: string) => {
  if (pathname === "/" || pathname === "/dashboard/user") return "Home";
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
        initial={{ x: "100%" }}
        animate={{ x: "100%" }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-200">
          {getRouteLabel(pathname)}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
