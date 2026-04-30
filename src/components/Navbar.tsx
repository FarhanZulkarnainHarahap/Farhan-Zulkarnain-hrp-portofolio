"use client";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = ["HOME", "ABOUT", "SKILLS", "PORTFOLIO", "DOCUMENTS", "CONTACT"];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Cek apakah item aktif berdasarkan pathname
  const getIsActive = (item: string) => {
    const itemPath = item.toLowerCase();
    if (itemPath === "home") {
      return pathname === "/" || pathname === "/home";
    }
    return pathname === `/${itemPath}`;
  };

  const handleNavigation = (item: string) => {
    const targetId = item.toLowerCase();
    const urlPath = targetId === "home" ? "/" : `/${targetId}`;

    // 1. Update URL secara "silent" tanpa memicu scroll default Next.js
    if (pathname !== urlPath) {
      window.history.pushState(null, "", urlPath);
    }

    // 2. Scroll halus ke element ID
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else if (targetId === "home") {
      // Jika element home tidak ada, scroll ke paling atas
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setIsOpen(false);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150 && !isOpen && !isHovered) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <>
      <div 
        onMouseEnter={() => { setIsHovered(true); setHidden(false); }}
        className="fixed top-0 left-0 w-full h-4 z-110 pointer-events-auto"
      />

      <motion.nav 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={hidden && !isOpen ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-110 p-6 flex justify-between items-center backdrop-blur-xl bg-black/40 border-b border-white/5"
      >
        <div 
          className="font-black tracking-tighter text-xl text-blue-500 uppercase italic cursor-pointer" 
          onClick={() => handleNavigation("HOME")}
        >
          Farhan Z.
        </div>
        
        <ul className="hidden lg:flex gap-10">
          {menuItems.map((item) => (
            <li key={item}>
              <button
                onClick={() => handleNavigation(item)}
                className={`text-[10px] font-bold tracking-[0.4em] transition-colors duration-500 uppercase ${
                  getIsActive(item) ? "text-blue-500" : "text-white/60 hover:text-white"
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>

        {/* HAMBURGER & MOBILE MENU TETAP SAMA */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden flex flex-col gap-1.5 z-110 p-2">
          <motion.span animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="w-7 h-0.5 bg-blue-500 rounded-full" />
          <motion.span animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }} className="w-7 h-0.5 bg-white rounded-full" />
          <motion.span animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-blue-500 rounded-full self-end" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="fixed inset-0 h-screen bg-[#030406]/95 backdrop-blur-2xl flex flex-col items-center justify-center lg:hidden"
            >
              <ul className="flex flex-col items-center gap-8">
                {menuItems.map((item, i) => (
                  <motion.li key={item} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                    <button 
                      onClick={() => handleNavigation(item)}
                      className={`text-2xl font-black tracking-[0.2em] uppercase ${
                        getIsActive(item) ? "text-blue-500" : "text-white"
                      }`}
                    >
                      {item}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
