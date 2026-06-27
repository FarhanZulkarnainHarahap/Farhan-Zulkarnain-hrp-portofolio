"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  delay?: number;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = "left",
  delay = 0,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !disabled && !prefersReducedMotion && !isPaused;
  const startPosition = direction === "left" ? "150% center" : "-50% center";
  const endPosition = direction === "left" ? "-50% center" : "150% center";

  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{ ...gradientStyle, backgroundPosition: startPosition }}
      animate={shouldAnimate ? { backgroundPosition: endPosition } : undefined}
      transition={{
        duration: Math.max(speed, 0.1),
        ease: "linear",
        repeat: Infinity,
        repeatDelay: Math.max(delay, 0),
        repeatType: yoyo ? "reverse" : "loop",
      }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {text}
    </motion.span>
  );
};

export default ShinyText;
