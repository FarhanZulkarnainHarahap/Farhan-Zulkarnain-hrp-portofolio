"use client";

import { useEffect, useRef } from "react";

interface HoverSoundOptions {
  selector?: string;
  src?: string;
  volume?: number;
}

export function useHoverSound({
  selector = ".interactive-card",
  src = "/audio/hover-tick.mp3",
  volume = 0.16,
}: HoverSoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const initializeAudio = () => {
      if (audioRef.current) return;

      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = THREE_CLAMP(volume, 0, 1);
      audio.load();
      audioRef.current = audio;
    };

    document.addEventListener("click", initializeAudio, {
      capture: true,
      once: true,
    });

    return () => {
      document.removeEventListener("click", initializeAudio, true);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [src, volume]);

  useEffect(() => {
    const playHoverSound = (event: PointerEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(selector)
          : null;
      if (!target) return;

      const previousTarget =
        event.relatedTarget instanceof Node ? event.relatedTarget : null;
      if (previousTarget && target.contains(previousTarget)) return;

      const audio = audioRef.current;
      if (!audio) return;

      audio.currentTime = 0;
      void audio.play().catch(() => {
        // The first click listener is the intentional autoplay-policy gate.
      });
    };

    document.addEventListener("pointerover", playHoverSound, {
      passive: true,
    });

    return () => document.removeEventListener("pointerover", playHoverSound);
  }, [selector]);
}

const THREE_CLAMP = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function HoverSoundController() {
  useHoverSound();
  return null;
}
