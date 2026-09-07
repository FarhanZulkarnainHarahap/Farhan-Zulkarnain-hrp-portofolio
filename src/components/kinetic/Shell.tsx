"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Navbar from "@/components/Navbar";
import { SceneProvider } from "./SceneState";
import { profile } from "./data";
function Footer() {
  const [time, setTime] = useState("Asia/Jakarta");
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()) + " WIB",
      );
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link href="/" className="footer-name">
          FARHAN<span> ZULKARNAIN HARAHAP</span>
          <small>Full-Stack Engineer · Software Engineer</small>
        </Link>
        <div className="footer-links">
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          <a href={`mailto:${profile.email}`}>Email ↗</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} FARHAN / KINETIC SYSTEMS</span>
        <span>MEDAN, INDONESIA · {time}</span>
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
            })
          }
        >
          BACK TO TOP ↑
        </button>
      </div>
    </footer>
  );
}
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
export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30 });
  return (
    <SceneProvider>
      <Navbar />
      <motion.div
        className="scroll-progress"
        style={{ scaleX: reduced ? scrollYProgress : scaleX }}
      />
      <main id="main-content" className="kinetic-main">
        <motion.div
          key={pathname}
          initial={reduced ? false : { clipPath: "inset(0 0 4% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.28 }}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
      <Cursor />
    </SceneProvider>
  );
}
