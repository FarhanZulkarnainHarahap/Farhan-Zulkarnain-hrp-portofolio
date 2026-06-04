"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const palette = ["#030406", "#080b13", "#2563eb", "#3b82f6", "#93c5fd"];

export default function EntranceScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasPlayed = window.sessionStorage.getItem("farhan-portfolio-entrance");

    if (reduceMotion || hasPlayed) {
      const skipTimer = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(skipTimer);
    }

    window.sessionStorage.setItem("farhan-portfolio-entrance", "true");
    const timer = window.setTimeout(() => setVisible(false), 2300);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9998] grid place-items-center overflow-hidden bg-[#030406]"
          aria-hidden="true"
        >
          <motion.div
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-88 w-88 rounded-full border border-blue-500/25 shadow-[0_0_80px_rgba(37,99,235,0.24)] md:h-120 md:w-120"
          />
          <motion.div
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-56 w-120 rounded-[50%] border border-blue-400/20 md:h-72 md:w-160"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.22),transparent_52%)]" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="text-[9px] font-black uppercase tracking-[0.45em] text-blue-300"
            >
              Initializing Portfolio
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-5xl font-black uppercase italic leading-none tracking-tighter text-white md:text-8xl"
            >
              Farhan <span className="text-blue-500">Z.</span>
            </motion.h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "min(72vw, 360px)" }}
              transition={{ duration: 0.75, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent"
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.95 }}
              className="mt-5 flex gap-2"
            >
              {palette.map((color) => (
                <span
                  key={color}
                  className="h-3 w-8 rounded-full border border-white/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 1.18 }}
              className="mt-5 text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500"
            >
              Creative Web Developer
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
