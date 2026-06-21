"use client";

import { RefObject, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type HorizontalScrollRefs = {
  wrapperRef: RefObject<HTMLDivElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

export const useHorizontalScroll = ({ wrapperRef, trackRef }: HorizontalScrollRefs) => {
  const progressRef = useRef(0);
  const velocityRef = useRef(0);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !trackRef.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const wrapper = wrapperRef.current;
    const track = trackRef.current;

    const context = gsap.context(() => {
      const getDistance = () => Math.max(1, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            velocityRef.current = Math.min(Math.abs(self.getVelocity()) / 2400, 1.6);
          },
          onRefresh: (self) => {
            progressRef.current = self.progress;
          },
        },
      });
    }, wrapper);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      context.revert();
    };
  }, [trackRef, wrapperRef]);

  return { progressRef, velocityRef };
};
