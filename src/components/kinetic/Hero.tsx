"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useScene } from "./SceneState";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import SpatialSystem from "./SpatialSystem";
import { profile } from "./data";
export default function Hero() {
  const { setMode, setActive } = useScene();
  return (
    <motion.section
      className="hero"
      onViewportEnter={() => {
        setMode("system");
        setActive("");
      }}
      viewport={{ amount: 0.4 }}
    >
      <div className="hero-topline">
        <span className="eyebrow">
          <span className="status-dot" /> SYSTEM INITIALIZED
        </span>
        <span className="eyebrow">INDEPENDENT ENGINEER / MEDAN, ID</span>
      </div>
      <div className="hero-layout">
        <div className="hero-copy">
          <p className="eyebrow hero-role">
            FULL-STACK ENGINEER & CREATIVE DEVELOPER
          </p>
          <h1>
            FARHAN
            <br />
            <span>ZULKARNAIN</span>
            <small>HARAHAP.</small>
          </h1>
          <p className="hero-statement">
            Thoughtful interfaces.
            <br />
            Connected systems.<span>Built to work together.</span>
          </p>
          <p className="hero-description">
            Software engineer turning complex ideas into clear digital
            experiences — from the first interaction to the architecture
            underneath.
          </p>
          <div className="button-row">
            <Link className="button" href="/projects" data-cursor="VIEW">
              Explore my work <ArrowUpRight size={18} />
            </Link>
            <Link className="text-link" href="/contact">
              Let’s talk <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <SpatialSystem />
      </div>
      <div className="hero-bottom">
        <a className="scroll-cue" href="#identity">
          <span className="scroll-circle">
            <ArrowDown size={17} />
          </span>
          SCROLL TO EXPLORE
        </a>
        <div className="hero-socials">
          <a href={profile.github} target="_blank" rel="noreferrer">
            GITHUB ↗
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LINKEDIN ↗
          </a>
        </div>
        <span className="eyebrow hero-status">
          <span className="status-dot" /> OPEN TO OPPORTUNITIES
        </span>
      </div>
    </motion.section>
  );
}
