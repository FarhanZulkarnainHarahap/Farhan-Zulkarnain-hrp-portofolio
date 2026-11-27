"use client";
/**
 * ScrollTrigger entry point (Fase K3). Imported only by code that creates triggers
 * (gsap-utils scrollProgress / parallax, the lab), never by the shared GSAP module, so pages
 * without scroll-driven effects neither download ScrollTrigger nor run its keep-alive rAF.
 */
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, setupGsap } from "@/lib/gsap";

let registered = false;

/** Registers ScrollTrigger once (after the shared plugins and eases). */
export function setupScrollTrigger() {
  setupGsap();
  if (!registered && typeof window !== "undefined") {
    registered = true;
    gsap.registerPlugin(ScrollTrigger);
  }
  return ScrollTrigger;
}

export { ScrollTrigger };
