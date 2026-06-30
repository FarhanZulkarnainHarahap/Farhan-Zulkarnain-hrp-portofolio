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
      if (track) track.style.transform = "";
      return;
    }

    setScrollDistance(
      Math.max(0, Math.ceil(track.scrollWidth - viewport.clientWidth)),
    );
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

    let frame = 0;

    const updateTrack = () => {
      frame = 0;
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const travelWindow = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - sectionTop) / travelWindow),
      );

      track.style.transform = `translate3d(${-progress * scrollDistance}px, 0, 0)`;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateTrack);
    };

    updateTrack();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [isDesktop, scrollDistance]);

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
