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
    const hasPlayed = window.sessionStorage.getItem("farhan-portfolio-entrance");

    if (reduceMotion || hasPlayed) {
      const skipTimer = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(skipTimer);
    }
  }, []);

  const enterPortfolio = () => {
    window.sessionStorage.setItem("farhan-portfolio-entrance", "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="portfolio-bg fixed inset-0 z-[9998] grid place-items-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.16),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(245,158,11,0.12),transparent_38%)]" />

          <motion.div
            initial={{ opacity: 0, x: -45, rotate: -10 }}
            animate={{ opacity: 0.75, x: 0, rotate: -7 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-[8%] top-[18%] hidden w-46 rounded-3xl border border-cyan-400/25 bg-[#071323]/80 p-3 shadow-[0_20px_80px_rgba(34,211,238,0.12)] backdrop-blur-md md:block"
          />
          <motion.div
            initial={{ opacity: 0, x: 45, rotate: 11 }}
            animate={{ opacity: 0.75, x: 0, rotate: 8 }}
            transition={{ duration: 0.85, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[17%] right-[8%] hidden w-52 rounded-3xl border border-amber-400/25 bg-[#071323]/80 p-3 shadow-[0_20px_80px_rgba(245,158,11,0.1)] backdrop-blur-md md:block"
          />

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-h-[86vh] w-[min(92vw,760px)] overflow-y-auto rounded-[28px] border border-cyan-400/25 bg-[#050b16]/92 shadow-[0_30px_120px_rgba(34,211,238,0.14)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-cyan-300/80" />
              </div>
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300">
                Dark Tech OS
              </span>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-[1fr_220px] md:p-8">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.36em] text-amber-300">
                  Welcome to
                </p>
                <h1 className="mt-3 text-4xl font-black uppercase italic leading-none tracking-tighter text-white md:text-6xl">
                  Farhan<span className="text-cyan-300">.dev</span>
                </h1>

                <div className="mt-7 space-y-3 font-mono text-xs text-zinc-400 md:text-sm">
                  {bootLines.map((line, index) => (
                    <motion.p
                      key={line}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.38, delay: 0.35 + index * 0.28 }}
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
                  transition={{ duration: 0.42, delay: 1.75 }}
                  className="mt-8 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-6 py-3 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.16)] transition-all hover:bg-cyan-300 hover:text-[#030813]"
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
                    transition={{ duration: 0.48, delay: 0.65 + index * 0.18 }}
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
