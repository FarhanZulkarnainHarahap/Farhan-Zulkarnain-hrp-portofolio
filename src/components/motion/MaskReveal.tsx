"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { maskRevealContainer, maskRevealItem } from "@/lib/motion/variants";

export function MaskReveal({
  children,
  className = "",
  lines,
}: {
  children?: ReactNode;
  className?: string;
  lines?: string[];
}) {
  const content = lines ?? (typeof children === "string" ? [children] : []);

  if (!content.length) {
    return (
      <span className={`block overflow-hidden ${className}`}>
        <motion.span
          className="block"
          variants={maskRevealItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
        >
          {children}
        </motion.span>
      </span>
    );
  }

  return (
    <motion.span
      className={`block ${className}`}
      variants={maskRevealContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {content.map((line) => (
        <span key={line} className="block overflow-hidden">
          <motion.span className="block" variants={maskRevealItem}>
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
