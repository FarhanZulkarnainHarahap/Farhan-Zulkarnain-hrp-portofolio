"use client";

import { useEffect, useRef, useState } from "react";
import { LuPause, LuPlay } from "react-icons/lu";

const DEFAULT_VOLUME = 0.12;

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = DEFAULT_VOLUME;

    const attemptPlayback = () => {
      void audio.play().catch(() => {
        // Audible autoplay is commonly blocked until the first user gesture.
      });
    };

    const playAfterFirstGesture = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }

      void audio.play().then(
        () => document.removeEventListener("pointerdown", playAfterFirstGesture),
        () => undefined,
      );
    };

    attemptPlayback();
    document.addEventListener("pointerdown", playAfterFirstGesture, {
      passive: true,
    });

    return () => {
      document.removeEventListener("pointerdown", playAfterFirstGesture);
      document.documentElement.removeAttribute("data-music");
      document.documentElement.style.removeProperty("--music-glow-opacity");
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      document.documentElement.dataset.music = "playing";
      document.documentElement.style.setProperty(
        "--music-glow-opacity",
        "0.065",
      );
      return;
    }

    document.documentElement.removeAttribute("data-music");
    document.documentElement.style.setProperty("--music-glow-opacity", "0");
  }, [isPlaying]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play().catch(() => undefined);
      return;
    }

    audio.pause();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause portfolio music" : "Play portfolio music"}
        aria-pressed={isPlaying}
        data-cursor-label={isPlaying ? "PAUSE" : "PLAY"}
        className="fixed bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.75rem)] right-3 z-130 grid h-11 w-11 place-items-center rounded-full border border-cyan-300/30 bg-[#030711]/88 text-cyan-100 shadow-[0_12px_38px_rgba(0,0,0,0.55),0_0_20px_rgba(34,211,238,0.16)] backdrop-blur-xl transition hover:scale-105 hover:border-cyan-200/70 hover:bg-cyan-300/12 sm:bottom-24 sm:right-5 lg:bottom-7 lg:right-7"
      >
        <span
          aria-hidden="true"
          className={`absolute inset-1.5 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.3),transparent_70%)] ${
            isPlaying ? "animate-pulse" : "opacity-40"
          }`}
        />
        {isPlaying ? (
          <LuPause className="relative h-4.5 w-4.5" />
        ) : (
          <LuPlay className="relative ml-0.5 h-4.5 w-4.5" />
        )}
      </button>

      <audio
        ref={audioRef}
        src="/Music.mp3"
        preload="auto"
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </>
  );
}
