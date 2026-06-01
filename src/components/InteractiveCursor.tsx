"use client";

import { useEffect, useRef } from "react";

const interactiveSelector = "a, button, [role='button'], [data-cursor-label]";
const textInputSelector = "input, textarea, select, [contenteditable='true']";
const particleCount = 52;

interface CursorParticle {
  element: HTMLSpanElement;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
}

export default function InteractiveCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelAnchorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const particlePoolRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const labelAnchor = labelAnchorRef.current;
    const label = labelRef.current;
    const particlePool = particlePoolRef.current;
    const canUseCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!cursor || !dot || !labelAnchor || !label || !particlePool || !canUseCustomCursor.matches) {
      return;
    }

    document.body.classList.add("portfolio-custom-cursor");

    let frameId = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let lastTrailX = pointerX;
    let lastTrailY = pointerY;
    let nextParticleIndex = 0;
    let activeElement: HTMLElement | null = null;

    const particles: CursorParticle[] = Array.from(
      particlePool.querySelectorAll<HTMLSpanElement>(".custom-cursor-particle"),
      (element) => ({
        element,
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0,
        life: 0,
        maxLife: 0,
      }),
    );

    const launchParticle = (
      x: number,
      y: number,
      speed = Math.random() * 0.9 + 0.35,
      angle = Math.random() * Math.PI * 2,
      life = Math.random() * 20 + 24,
    ) => {
      if (reduceMotion) {
        return;
      }

      const particle = particles[nextParticleIndex];
      nextParticleIndex = (nextParticleIndex + 1) % particles.length;

      particle.x = x + (Math.random() - 0.5) * 8;
      particle.y = y + (Math.random() - 0.5) * 8;
      particle.velocityX = Math.cos(angle) * speed;
      particle.velocityY = Math.sin(angle) * speed;
      particle.life = life;
      particle.maxLife = life;
      particle.element.style.setProperty("--particle-size", `${Math.random() * 4 + 2}px`);
      particle.element.style.opacity = "1";
    };

    const createTrail = (x: number, y: number) => {
      const distance = Math.hypot(x - lastTrailX, y - lastTrailY);

      if (distance < 5) {
        return;
      }

      const trailAngle = Math.atan2(y - lastTrailY, x - lastTrailX) + Math.PI;
      const particlesToLaunch = Math.min(4, Math.max(2, Math.floor(distance / 10)));

      for (let index = 0; index < particlesToLaunch; index += 1) {
        launchParticle(x, y, Math.random() * 1.15 + 0.3, trailAngle + (Math.random() - 0.5) * 1.2);
      }

      lastTrailX = x;
      lastTrailY = y;
    };

    const createBurst = () => {
      for (let index = 0; index < 16; index += 1) {
        launchParticle(pointerX, pointerY, Math.random() * 2.8 + 1.2, (Math.PI * 2 * index) / 16, Math.random() * 16 + 30);
      }
    };

    const renderCursor = () => {
      particles.forEach((particle) => {
        if (particle.life <= 0) {
          return;
        }

        particle.life -= 1;
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityX *= 0.96;
        particle.velocityY = particle.velocityY * 0.96 + 0.015;

        const progress = Math.max(particle.life / particle.maxLife, 0);
        particle.element.style.opacity = `${progress}`;
        particle.element.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) translate(-50%, -50%) scale(${0.45 + progress})`;
      });

      frameId = window.requestAnimationFrame(renderCursor);
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
      labelAnchor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      cursor.classList.add("is-visible");
      updateCursorState(event.target);
      createTrail(pointerX, pointerY);
    };

    const handlePointerDown = () => {
      createBurst();
    };
    const handlePointerLeave = () => cursor.classList.remove("is-visible");

    frameId = window.requestAnimationFrame(renderCursor);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("blur", handlePointerLeave);
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      document.body.classList.remove("portfolio-custom-cursor");
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("blur", handlePointerLeave);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor-layer" aria-hidden="true">
      <div ref={particlePoolRef} className="custom-cursor-particles">
        {Array.from({ length: particleCount }, (_, index) => (
          <span key={index} className="custom-cursor-particle" />
        ))}
      </div>
      <div ref={labelAnchorRef} className="custom-cursor-label-anchor">
        <span ref={labelRef} className="custom-cursor-label" />
      </div>
      <div ref={dotRef} className="custom-cursor-dot" />
    </div>
  );
}
