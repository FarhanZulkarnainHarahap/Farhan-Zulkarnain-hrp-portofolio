"use client";

import { useEffect, useRef } from "react";

const interactiveSelector = "a, button, [role='button'], [data-cursor-label]";
const textInputSelector = "input, textarea, select, [contenteditable='true']";

export default function InteractiveCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const orbit = orbitRef.current;
    const label = labelRef.current;
    const canUseCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (!cursor || !dot || !orbit || !label || !canUseCustomCursor.matches) {
      return;
    }

    document.body.classList.add("portfolio-custom-cursor");

    let frameId = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let orbitX = pointerX;
    let orbitY = pointerY;
    let activeElement: HTMLElement | null = null;

    const renderOrbit = () => {
      orbitX += (pointerX - orbitX) * 0.16;
      orbitY += (pointerY - orbitY) * 0.16;
      orbit.style.transform = `translate3d(${orbitX}px, ${orbitY}px, 0) translate(-50%, -50%)`;
      frameId = window.requestAnimationFrame(renderOrbit);
    };

    const updateCursorState = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      const nextActiveElement = element?.closest<HTMLElement>(interactiveSelector) ?? null;
      const isOverTextInput = Boolean(element?.closest(textInputSelector));

      cursor.classList.toggle("is-over-text", isOverTextInput);

      if (nextActiveElement === activeElement) {
        return;
      }

      activeElement = nextActiveElement;
      const cursorLabel = activeElement?.dataset.cursorLabel ?? "";

      cursor.classList.toggle("is-interactive", Boolean(activeElement));
      cursor.classList.toggle("has-label", Boolean(cursorLabel));
      label.textContent = cursorLabel;
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
      cursor.classList.add("is-visible");
      updateCursorState(event.target);
    };

    const handlePointerDown = () => cursor.classList.add("is-pressed");
    const handlePointerUp = () => cursor.classList.remove("is-pressed");
    const handlePointerLeave = () => cursor.classList.remove("is-visible");

    frameId = window.requestAnimationFrame(renderOrbit);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("blur", handlePointerLeave);
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      document.body.classList.remove("portfolio-custom-cursor");
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("blur", handlePointerLeave);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor-layer" aria-hidden="true">
      <div ref={orbitRef} className="custom-cursor-orbit">
        <span ref={labelRef} className="custom-cursor-label" />
      </div>
      <div ref={dotRef} className="custom-cursor-dot" />
    </div>
  );
}
