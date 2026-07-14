"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CinematicScrollController({
  children,
}: {
  children: ReactNode;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.set("[data-cinematic]", {
        opacity: 0,
        y: reduceMotion ? 0 : 28,
      });

      gsap.to("[data-hero-reveal]", {
        opacity: 1,
        y: 0,
        duration: reduceMotion ? 0.01 : 0.9,
        ease: "power3.out",
        stagger: reduceMotion ? 0 : 0.08,
      });

      gsap.utils.toArray<HTMLElement>("[data-cinematic]").forEach((element) => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: reduceMotion ? 0.01 : 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 82%",
            once: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-story-progress]").forEach((element) => {
        if (reduceMotion) return;

        gsap.fromTo(
          element,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: element.closest("section") || element,
              start: "top 70%",
              end: "bottom 55%",
              scrub: 0.4,
            },
          },
        );
      });

      const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);
      return () => window.clearTimeout(refresh);
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
