"use client";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const menuItems = ["HOME", "ABOUT", "SKILLS", "PROJECTS", "DOCUMENTS", "CONTACT"];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Mencegah scroll body saat menu mobile terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const getIsActive = (item: string) => {
    const itemPath = item.toLowerCase();
    if (itemPath === "home") return pathname === "/" || pathname === "/home";
    return pathname === `/${itemPath}`;
  };

  const handleNavigation = (item: string) => {
    const targetId = item.toLowerCase();
    const urlPath = targetId === "home" ? "/" : `/${targetId}`;

    if (pathname !== urlPath) {
      window.history.pushState(null, "", urlPath);
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setIsOpen(false); // Tutup menu setelah klik (penting untuk mobile)
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Navbar sembunyi saat scroll ke bawah, tapi tetap muncul di mobile jika menu terbuka
    if (latest > previous && latest > 150 && !isOpen && !isHovered) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <>
      {/* Area deteksi hover untuk memunculkan navbar kembali (Desktop) */}
      <div 
        onMouseEnter={() => { setIsHovered(true); setHidden(false); }}
        className="fixed top-0 left-0 w-full h-4 z-100 hidden lg:block"
      />

      <motion.nav 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-110 px-6 py-4 lg:px-12 lg:py-6 flex justify-between items-center backdrop-blur-xl bg-black/40 border-b border-white/5"
      >
        {/* Logo */}
        <div 
          className="font-black tracking-tighter text-xl lg:text-2xl text-blue-500 uppercase italic cursor-pointer z-120" 
          onClick={() => handleNavigation("HOME")}
        >
          Farhan Z.
        </div>
        
        {/* Desktop Menu */}
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

        {/* Hamburger Button (Mobile Only) */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="lg:hidden flex flex-col gap-1.5 z-120 p-2 focus:outline-none"
          aria-label="Toggle Menu"
        >
          <motion.span 
            animate={isOpen ? { rotate: 45, y: 8, backgroundColor: "#3b82f6" } : { rotate: 0, y: 0, backgroundColor: "#3b82f6" }} 
            className="w-7 h-0.5 rounded-full" 
          />
          <motion.span 
            animate={isOpen ? { opacity: 0, x: 10 } : { opacity: 1, x: 0, backgroundColor: "#ffffff" }} 
            className="w-7 h-0.5 rounded-full" 
          />
          <motion.span 
            animate={isOpen ? { rotate: -45, y: -8, width: "1.75rem", backgroundColor: "#3b82f6" } : { rotate: 0, y: 0, width: "1.25rem", backgroundColor: "#3b82f6" }} 
            className="h-0.5 rounded-full self-end" 
          />
        </button>

        {/* Fullscreen Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 h-screen w-full bg-[#030406] flex flex-col items-center justify-center lg:hidden z-115"
            >
              <ul className="flex flex-col items-center gap-8">
                {menuItems.map((item, i) => (
                  <motion.li 
                    key={item} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 * i + 0.2 }}
                  >
                    <button 
                      onClick={() => handleNavigation(item)}
                      className={`text-3xl font-black tracking-[0.2em] uppercase transition-all ${
                        getIsActive(item) ? "text-blue-500 scale-110" : "text-white"
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
