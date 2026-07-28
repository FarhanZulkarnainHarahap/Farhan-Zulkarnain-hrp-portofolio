"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const publicRoutes = [
  "/",
  "/about",
  "/about/skills",
  "/about/docs",
  "/projects",
  "/journey",
  "/contact",
  "/dashboard/user",
];

export default function EntranceIntro() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const publicRoute = publicRoutes.some((route) =>
      route === "/" ? pathname === route : pathname.startsWith(route),
    );

    if (!publicRoute || reducedMotion || window.sessionStorage.getItem("portfolio:intro-seen")) {
      return;
    }

    setVisible(true);
    window.sessionStorage.setItem("portfolio:intro-seen", "true");
    const timeout = window.setTimeout(() => setVisible(false), 1700);
    return () => window.clearTimeout(timeout);
  }, [pathname, reducedMotion]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[10060] grid place-items-center bg-[#030406]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative grid place-items-center">
        <div className="absolute h-56 w-56 rounded-full border border-blue-300/12" />
        {Array.from({ length: 24 }, (_, index) => {
          const angle = (index / 24) * Math.PI * 2;
          return (
            <motion.span
              key={index}
              className="absolute h-1.5 w-1.5 rounded-full bg-blue-200"
              initial={{
                x: Math.cos(angle) * 112,
                y: Math.sin(angle) * 112,
                opacity: 0,
              }}
              animate={{
                x: Math.cos(angle) * 34,
                y: Math.sin(angle) * 34,
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.1, delay: index * 0.012, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}

        <motion.div
          className="text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: [0.9, 1, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 1.55, times: [0, 0.45, 1], ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-5xl font-black tracking-[0.16em] text-white">FZH</p>
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.34em] text-blue-300">
            Farhan Zulkarnain
          </p>
        </motion.div>

        <motion.span
          className="absolute top-[calc(50%+4.8rem)] h-px w-64 bg-linear-to-r from-transparent via-blue-200 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1, 0] }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute bottom-8 right-8 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300 hover:border-blue-300/45 hover:text-white"
      >
        Skip
      </button>
    </motion.div>
  );
}
