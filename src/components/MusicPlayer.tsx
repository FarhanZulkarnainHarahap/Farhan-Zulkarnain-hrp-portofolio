"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  LuMusic2,
  LuPause,
  LuPlay,
  LuVolume2,
  LuVolumeX,
} from "react-icons/lu";

const BAR_COUNT = 12;
const DEFAULT_VOLUME = 0.38;

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const resetThemeEnergy = useCallback(() => {
    document.documentElement.style.setProperty("--music-glow-opacity", "0");

    const bars = visualizerRef.current?.children;
    if (!bars) return;

    for (const bar of bars) {
      (bar as HTMLElement).style.transform = "scaleY(0.18)";
    }
  }, []);

  const stopVisualizer = useCallback(() => {
    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = 0;
    resetThemeEnergy();
  }, [resetThemeEnergy]);

  const startVisualizer = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const frequencies = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(frequencies);

      const bars = visualizerRef.current?.children;
      let total = 0;

      for (let index = 0; index < frequencies.length; index += 1) {
        total += frequencies[index];
      }

      const energy = total / Math.max(frequencies.length * 255, 1);
      const glowOpacity = Math.min(0.22, 0.025 + energy * 0.28);
      document.documentElement.style.setProperty(
        "--music-glow-opacity",
        glowOpacity.toFixed(3),
      );

      if (bars) {
        for (let index = 0; index < bars.length; index += 1) {
          const frequencyIndex = Math.min(
            frequencies.length - 1,
            Math.floor((index / bars.length) * frequencies.length),
          );
          const scale = 0.18 + (frequencies[frequencyIndex] / 255) * 0.82;
          (bars[index] as HTMLElement).style.transform = `scaleY(${scale.toFixed(3)})`;
        }
      }

      animationFrameRef.current = window.requestAnimationFrame(draw);
    };

    window.cancelAnimationFrame(animationFrameRef.current);
    draw();
  }, []);

  const initializeAudioGraph = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ??
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      const analyser = context.createAnalyser();
      const source = context.createMediaElementSource(audio);

      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      analyser.connect(context.destination);

      audioContextRef.current = context;
      analyserRef.current = analyser;
      sourceRef.current = source;
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await initializeAudioGraph();
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = DEFAULT_VOLUME;

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      document.documentElement.removeAttribute("data-music");
      document.documentElement.style.removeProperty("--music-glow-opacity");
      void audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      document.documentElement.dataset.music = "playing";
      startVisualizer();
      return stopVisualizer;
    }

    document.documentElement.removeAttribute("data-music");
    stopVisualizer();
  }, [isPlaying, startVisualizer, stopVisualizer]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      className="music-player-shell fixed bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.75rem)] right-3 z-130 w-[calc(100vw-1.5rem)] max-w-80 sm:bottom-24 sm:right-5 sm:w-80 lg:bottom-7 lg:right-7"
      aria-label="Portfolio music player"
    >
      <div className="relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#030711]/90 px-3 py-2.5 shadow-[0_18px_55px_rgba(0,0,0,0.5),0_0_26px_rgba(34,211,238,0.1)] backdrop-blur-2xl">
        <span
          aria-hidden="true"
          className={`absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-cyan-200 to-transparent transition-opacity duration-500 ${
            isPlaying ? "opacity-100" : "opacity-35"
          }`}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause portfolio music" : "Play portfolio music"}
            aria-pressed={isPlaying}
            data-cursor-label={isPlaying ? "PAUSE" : "PLAY"}
            className="group relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-cyan-300/25 bg-cyan-300/8 text-cyan-100 transition hover:scale-105 hover:border-cyan-200/60 hover:bg-cyan-300/15"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-1 rounded-lg bg-[radial-gradient(circle,rgba(168,85,247,0.3),transparent_68%)] transition-transform duration-700 ${
                isPlaying ? "scale-125 animate-pulse" : "scale-75"
              }`}
            />
            {isPlaying ? (
              <LuPause className="relative h-4.5 w-4.5" />
            ) : (
              <LuPlay className="relative ml-0.5 h-4.5 w-4.5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.25em] text-cyan-300/75">
                  <LuMusic2 className="h-3 w-3" />
                  Neon Pulse
                </p>
                <p className="mt-0.5 truncate text-[10px] font-black uppercase tracking-[0.12em] text-white">
                  Portfolio Soundtrack
                </p>
              </div>

              <div
                ref={visualizerRef}
                className="flex h-6 w-14 shrink-0 items-end justify-end gap-0.5"
                aria-hidden="true"
              >
                {Array.from({ length: BAR_COUNT }, (_, index) => (
                  <span
                    key={index}
                    className="h-full w-0.5 origin-bottom rounded-full bg-linear-to-t from-violet-500 via-blue-400 to-cyan-200 transition-transform duration-75"
                    style={{ transform: "scaleY(0.18)" }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="w-7 font-mono text-[8px] text-white/45">
                {formatTime(currentTime)}
              </span>
              <div className="relative h-3 flex-1">
                <div className="absolute inset-x-0 top-1 h-1 overflow-hidden rounded-full bg-white/8">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-violet-500 via-blue-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.65)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(duration, 0)}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={handleSeek}
                  aria-label="Seek portfolio music"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              <span className="w-7 text-right font-mono text-[8px] text-white/45">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute portfolio music" : "Mute portfolio music"}
            aria-pressed={isMuted}
            data-cursor-label={isMuted ? "UNMUTE" : "MUTE"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/8 bg-white/4 text-white/65 transition hover:border-violet-300/35 hover:bg-violet-400/10 hover:text-white"
          >
            {isMuted ? (
              <LuVolumeX className="h-4 w-4" />
            ) : (
              <LuVolume2 className="h-4 w-4" />
            )}
          </button>
        </div>

        <audio
          ref={audioRef}
          src="/Music.mp3"
          preload="metadata"
          loop
          onLoadedMetadata={(event) => {
            setDuration(event.currentTarget.duration);
          }}
          onDurationChange={(event) => {
            setDuration(event.currentTarget.duration);
          }}
          onTimeUpdate={(event) => {
            setCurrentTime(event.currentTarget.currentTime);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </aside>
  );
}
