"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const bootLines = [
  "Initializing Fullstack Portfolio...",
  "Loading Projects...",
  "Connecting Backend Skills...",
  "Rendering UI Experience...",
];

export default function EntranceScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      const skipTimer = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(skipTimer);
    }

    const autoEnterTimer = window.setTimeout(() => setVisible(false), 2200);

    return () => window.clearTimeout(autoEnterTimer);
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [visible]);

  const enterPortfolio = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="portfolio-bg fixed inset-0 z-[9998] grid h-[100dvh] min-h-[100svh] place-items-center overflow-hidden overscroll-none px-4 py-4"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.16),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(245,158,11,0.12),transparent_38%)]" />

          <motion.div
            initial={{ opacity: 0, x: -20, rotate: -10 }}
            animate={{ opacity: 0.75, x: 0, rotate: -7 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-[8%] top-[18%] hidden w-46 rounded-3xl border border-cyan-400/25 bg-[#071323]/80 p-3 shadow-[0_20px_80px_rgba(34,211,238,0.12)] backdrop-blur-md md:block"
          />
          <motion.div
            initial={{ opacity: 0, x: 20, rotate: 11 }}
            animate={{ opacity: 0.75, x: 0, rotate: 8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[17%] right-[8%] hidden w-52 rounded-3xl border border-amber-400/25 bg-[#071323]/80 p-3 shadow-[0_20px_80px_rgba(245,158,11,0.1)] backdrop-blur-md md:block"
          />

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-h-[calc(100dvh-2rem)] w-[min(92vw,760px)] overflow-hidden rounded-[24px] border border-cyan-400/25 bg-[#050b16]/92 shadow-[0_30px_120px_rgba(34,211,238,0.14)] backdrop-blur-xl sm:rounded-[28px]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-cyan-300/80" />
              </div>
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300">
                Dark Tech OS
              </span>
            </div>

            <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_220px] md:p-8">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.36em] text-amber-300">
                  Welcome to
                </p>
                <h1 className="mt-3 text-4xl font-black uppercase italic leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
                  Farhan<span className="text-cyan-300">.dev</span>
                </h1>

                <div className="mt-6 space-y-3 font-mono text-[11px] text-zinc-400 sm:text-xs md:mt-7 md:text-sm">
                  {bootLines.map((line, index) => (
                    <motion.p
                      key={line}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.22, delay: 0.08 + index * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-cyan-300">$</span>
                      <span>{line}</span>
                    </motion.p>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={enterPortfolio}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.42 }}
                  className="mt-7 w-full rounded-full border border-cyan-300/35 bg-cyan-300/10 px-5 py-3 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.16)] transition-all hover:bg-cyan-300 hover:text-[#030813] sm:mt-8 sm:w-auto sm:px-6"
                >
                  [ Enter Portfolio ]
                </motion.button>
              </div>

              <div className="hidden space-y-3 md:block">
                {["Projects", "Backend", "UI System"].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 18, rotate: index === 1 ? 2 : -2 }}
                    animate={{ opacity: 1, y: 0, rotate: index === 1 ? 2 : -2 }}
                    transition={{ duration: 0.28, delay: 0.16 + index * 0.06 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.28em] text-zinc-500">
                      Module 0{index + 1}
                    </p>
                    <h2 className={`mt-2 text-lg font-black uppercase ${index === 1 ? "text-amber-300" : "text-cyan-300"}`}>
                      {item}
                    </h2>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
