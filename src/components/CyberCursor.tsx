"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type CursorState = "default" | "link" | "project" | "drag" | "view" | "disabled";

const PUBLIC_CURSOR_ROUTES = [
  "/",
  "/about",
  "/about/skills",
  "/about/docs",
  "/projects",
  "/journey",
  "/contact",
  "/dashboard/user",
];

export default function CyberCursor() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const [supportsFinePointer, setSupportsFinePointer] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>("disabled");

  const isPublicRoute = PUBLIC_CURSOR_ROUTES.some((route) =>
    route === "/" ? pathname === route : pathname.startsWith(route),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const update = () => setSupportsFinePointer(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!supportsFinePointer || reducedMotion || !isPublicRoute) {
      document.documentElement.classList.remove("cyber-cursor-active");
      setCursorState("disabled");
      return;
    }

    const animate = () => {
      const cursor = cursorRef.current;
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * 0.22;
      current.y += (target.y - current.y) * 0.22;

      if (cursor) {
        cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    const updateStateFromTarget = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      const interactive = element?.closest<HTMLElement>(
        "a, button, input, textarea, select, [role='button'], [data-cursor-label]",
      );

      if (!interactive) {
        setCursorState("default");
        if (labelRef.current) {
          labelRef.current.textContent = "";
          labelRef.current.dataset.visible = "false";
        }
        return;
      }

      const label = interactive.dataset.cursorLabel || "";
      const nextState = interactive.dataset.cursorState as CursorState | undefined;

      setCursorState(nextState ?? (label.match(/case|open|view/i) ? "view" : "link"));
      if (labelRef.current) {
        labelRef.current.textContent = label;
        labelRef.current.dataset.visible = label ? "true" : "false";
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
      updateStateFromTarget(event.target);
    };

    const handlePointerDown = () => setCursorState("drag");
    const handlePointerUp = (event: PointerEvent) => updateStateFromTarget(event.target);
    const handlePointerLeave = () => setCursorState("disabled");

    currentRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    targetRef.current = { ...currentRef.current };
    document.documentElement.classList.add("cyber-cursor-active");
    setCursorState("default");
    frameRef.current = window.requestAnimationFrame(animate);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      document.documentElement.classList.remove("cyber-cursor-active");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [isPublicRoute, reducedMotion, supportsFinePointer]);

  if (!supportsFinePointer || reducedMotion || !isPublicRoute) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      data-state={cursorState}
      className="pointer-events-none fixed left-0 top-0 z-[10050] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-200/70 mix-blend-screen transition-[width,height,border-color,background-color,opacity] duration-200 data-[state=disabled]:opacity-0 data-[state=drag]:h-12 data-[state=drag]:w-12 data-[state=link]:h-10 data-[state=link]:w-10 data-[state=project]:h-14 data-[state=project]:w-14 data-[state=view]:h-14 data-[state=view]:w-14 data-[state=link]:bg-blue-400/10 data-[state=view]:bg-blue-500/12"
    >
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.95)]" />
      <span
        ref={labelRef}
        className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#050911]/85 px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-blue-100 opacity-0 transition-opacity data-[visible=true]:opacity-100"
      />
    </div>
  );
}
