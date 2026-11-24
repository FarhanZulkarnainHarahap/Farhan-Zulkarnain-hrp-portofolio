"use client";
/**
 * Keeps the interactive Fz card out of every page's first load (Fase 12.5): until the card is about a
 * screen away, only a box of the same size is rendered (no layout shift); then the card's code is
 * imported. The footer card sits on every page, so this matters for each page's Lighthouse score.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const FzCard = dynamic(() => import("./FzCard").then((m) => m.FzCard), {
  ssr: false,
  loading: () => null,
});

export function LazyFzCard({ variant, className }: { variant: "about" | "footer"; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setNear(true);
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className={cn("fz-card", `fz-card--${variant}`, className)} data-fz-card-slot={variant}>
      {near && <FzCard variant={variant} className="fz-card--fill" />}
    </div>
  );
}
