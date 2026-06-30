"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export function useHorizontalShowcase(dependencyKey: string | number) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  const measure = useCallback(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    setIsDesktop(desktop);

    if (!desktop || !viewport || !track) {
      setScrollDistance(0);
      if (track) {
        track.style.transform = "";
        track.querySelectorAll<HTMLElement>("[data-showcase-item]").forEach((item) => {
          item.style.opacity = "";
          item.style.transform = "";
          item.style.filter = "";
        });
      }
      return;
    }

    const nextDistance = Math.max(
      0,
      Math.ceil(track.scrollWidth - viewport.clientWidth),
    );

    if (nextDistance === 0) {
      track.style.transform = "";
      track.querySelectorAll<HTMLElement>("[data-showcase-item]").forEach((item) => {
        item.style.opacity = "";
        item.style.transform = "";
        item.style.filter = "";
      });
      sectionRef.current?.style.removeProperty("--showcase-progress");
    }

    setScrollDistance(nextDistance);
  }, []);

  useEffect(() => {
    const initialFrame = window.requestAnimationFrame(measure);

    const resizeObserver = new ResizeObserver(measure);
    if (viewportRef.current) resizeObserver.observe(viewportRef.current);
    if (trackRef.current) resizeObserver.observe(trackRef.current);
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      window.cancelAnimationFrame(initialFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [dependencyKey, measure]);

  useEffect(() => {
    if (!isDesktop || scrollDistance <= 0) return;

    const sectionNode = sectionRef.current;
    let frame = 0;
    let initialized = false;
    let currentX = 0;
    let targetX = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const paintTrack = () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!section || !viewport || !track) return;

      track.style.transform = `translate3d(${currentX}px, 0, 0)`;

      const viewportRect = viewport.getBoundingClientRect();
      const viewportCenter = viewportRect.left + viewportRect.width / 2;

      track.querySelectorAll<HTMLElement>("[data-showcase-item]").forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const distance = Math.abs(
          itemRect.left + itemRect.width / 2 - viewportCenter,
        );
        const focus = 1 - Math.min(1, distance / (viewportRect.width * 0.72));

        item.style.opacity = `${0.48 + focus * 0.52}`;
        item.style.transform = `translate3d(0, ${(1 - focus) * 18}px, 0) scale(${0.94 + focus * 0.06})`;
        item.style.filter = `saturate(${0.72 + focus * 0.28})`;
      });
    };

    const animateTrack = () => {
      frame = 0;
      const difference = targetX - currentX;

      currentX = reduceMotion
        ? targetX
        : currentX + difference * 0.14;
      paintTrack();

      if (Math.abs(targetX - currentX) > 0.12) {
        frame = window.requestAnimationFrame(animateTrack);
      } else {
        currentX = targetX;
        paintTrack();
      }
    };

    const updateTarget = () => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const travelWindow = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - sectionTop) / travelWindow),
      );

      targetX = -progress * scrollDistance;
      section.style.setProperty("--showcase-progress", `${progress}`);

      if (!initialized) {
        currentX = targetX;
        initialized = true;
        paintTrack();
        return;
      }

      if (!frame) frame = window.requestAnimationFrame(animateTrack);
    };

    const requestUpdate = () => {
      updateTarget();
    };

    updateTarget();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      sectionNode?.style.removeProperty("--showcase-progress");
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [dependencyKey, isDesktop, scrollDistance]);

  const sectionStyle = {
    "--showcase-travel": `${scrollDistance}px`,
    height:
      isDesktop && scrollDistance > 0
        ? `calc(100svh + ${scrollDistance}px)`
        : undefined,
  } as CSSProperties;

  return {
    isDesktop,
    sectionRef,
    viewportRef,
    trackRef,
    sectionStyle,
  };
}
