"use client";
/**
 * The Fz card as an interactive object (Fase 12.5): Blender renders, no WebGL.
 *
 *  - Idle: a 3.5 s seamless loop (float ±4 px, sway ≤ 2°, one sheen over the monogram). Plays only
 *    while on screen and the tab is visible; never under reduced motion (the still is shown).
 *  - Hover (precise pointers only): a 7 × 5 tilt grid (±12°); the pointer picks the frame through an
 *    eased follower — rAF only while it moves. Leaving eases back to the rest frame, which is also
 *    frame 0 of the idle loop, so the loop resumes without a jump.
 *  - Click / Enter / Space (and tap on touch screens): the card flips (18 frames, 0.6 s) to its
 *    back. The contact details on the back are real HTML links over the render — clickable, read by
 *    screen readers, selectable. Reduced motion: the flip is an instant swap.
 *  - Assets load lazily: stills are lazy images, the loop starts when visible, tilt frames on the
 *    first hover, flip frames on the first press. Only the active theme's set is fetched.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ThemedPicture } from "@/components/media/ThemedPicture";
import { useTheme } from "@/components/site/ThemeProvider";
import { profile } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BACK_LAYOUT } from "./card-layout";
import { FINE_HOVER, follow, loadFrames, playSequence, REDUCED, whileVisible, type Follower } from "./frames";

type Variant = "about" | "footer";
const COLS = 7;
const ROWS = 5;
const FLIP_FRAMES = 18;
const REST = { r: 2, c: 3 };

const SIZES: Record<Variant, { w: number; h: number }> = {
  about: { w: 720, h: 900 },
  footer: { w: 320, h: 400 },
};

// Handles only: the rendered icons (</>, in) already name the service; the href is the full URL.
const githubLabel = profile.github.replace(/\/$/, "").split("/").pop() ?? "GitHub";
const linkedinLabel = (profile.linkedin.replace(/\/$/, "").split("/").pop() ?? "LinkedIn").replace(/-[0-9a-f]{6,}$/i, "");
const [emailUser, emailDomain] = profile.email.split("@");

export function FzCard({ variant, className }: { variant: Variant; className?: string }) {
  const { theme } = useTheme();
  // The footer band is always dark, so its card is one dark set for both site themes.
  const set = variant === "footer" ? "dark" : theme;
  const base = `/3d/card/${variant}`;
  const dir = set ? `${base}/${set}` : null;
  const size = SIZES[variant];

  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const seq = useRef<HTMLImageElement>(null);
  const tilt = useRef<string[] | null>(null);
  const flipFrames = useRef<string[] | null>(null);
  const follower = useRef<Follower | null>(null);
  const cancelFlip = useRef<(() => void) | null>(null);
  const hovering = useRef(false);
  const [flipped, setFlipped] = useState(false);
  const [layer, setLayer] = useState<"still" | "idle" | "seq" | "back">("still");

  const motionOk = () => typeof window !== "undefined" && !window.matchMedia(REDUCED).matches;

  // A theme switch drops the loaded frames (they carry the other canvas colour).
  useEffect(() => {
    tilt.current = null;
    flipFrames.current = null;
    const v = video.current;
    if (v) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
  }, [dir]);

  // Idle loop: only while visible, tab visible, motion allowed, front side showing.
  useEffect(() => {
    const el = root.current;
    const v = video.current;
    if (!el || !v || !dir || !motionOk()) return;
    return whileVisible(el, (active) => {
      if (active && !flipped && !hovering.current) {
        if (!v.getAttribute("src")) v.src = `${dir}/idle.mp4`;
        v.play().then(() => setLayer((l) => (l === "still" ? "idle" : l))).catch(() => {});
      } else v.pause();
    });
  }, [dir, flipped]);

  const show = (url: string) => {
    if (seq.current && seq.current.getAttribute("src") !== url) seq.current.src = url;
  };
  const tiltUrl = (r: number, c: number) => `${dir}/tilt-r${r}c${c}.avif`;

  const onPointerEnter = () => {
    if (!dir || flipped || !motionOk() || !window.matchMedia(FINE_HOVER).matches) return;
    hovering.current = true;
    if (!tilt.current) {
      const urls: string[] = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) urls.push(tiltUrl(r, c));
      loadFrames(urls).then((ok) => (tilt.current = ok));
    }
    follower.current ??= follow(
      (x, y) => {
        if (!tilt.current) return;
        show(tiltUrl(Math.round(y * (ROWS - 1)), Math.round(x * (COLS - 1))));
      },
      {
        onRest: () => {
          if (hovering.current) return;
          // Back at the rest frame = idle frame 0: resume the loop from its start, no jump.
          const v = video.current;
          if (v && motionOk()) {
            v.currentTime = 0;
            v.play().catch(() => {});
            setLayer("idle");
          } else setLayer("still");
        },
      },
    );
    video.current?.pause();
    show(tiltUrl(REST.r, REST.c));
    setLayer("seq");
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!hovering.current || !follower.current) return;
    const box = e.currentTarget.getBoundingClientRect();
    follower.current.to((e.clientX - box.left) / box.width, (e.clientY - box.top) / box.height);
  };
  const onPointerLeave = () => {
    if (!hovering.current) return;
    hovering.current = false;
    follower.current?.to(0.5, 0.5);
  };

  const flip = async () => {
    const next = !flipped;
    hovering.current = false;
    follower.current?.stop();
    cancelFlip.current?.();
    if (!dir || !motionOk()) {
      setFlipped(next);
      setLayer(next ? "back" : "still");
      return;
    }
    if (!flipFrames.current) {
      const urls = Array.from({ length: FLIP_FRAMES }, (_, i) => `${dir}/flip-${i}.avif`);
      flipFrames.current = await loadFrames(urls);
    }
    const frames = flipFrames.current;
    if (frames.length < FLIP_FRAMES) {
      setFlipped(next);
      setLayer(next ? "back" : "still");
      return;
    }
    video.current?.pause();
    setLayer("seq");
    if (!next) setFlipped(false); // hide the back links as soon as the card turns away
    cancelFlip.current = playSequence(FLIP_FRAMES, (i) => show(frames[i]), {
      from: next ? 0 : FLIP_FRAMES - 1,
      to: next ? FLIP_FRAMES - 1 : 0,
      onDone: () => {
        cancelFlip.current = null;
        if (next) {
          setFlipped(true);
          setLayer("back");
        } else {
          const v = video.current;
          if (v?.getAttribute("src")) {
            v.currentTime = 0;
            v.play().catch(() => {});
            setLayer("idle");
          } else setLayer("still");
        }
      },
    });
  };

  useEffect(
    () => () => {
      follower.current?.stop();
      cancelFlip.current?.();
    },
    [],
  );

  const label = flipped ? "Show the front of the Fz card" : "Flip the Fz card to show contact details";
  const L = BACK_LAYOUT;
  return (
    <div
      ref={root}
      data-fz-card={variant}
      data-layer={layer}
      data-flipped={flipped}
      className={cn("fz-card", `fz-card--${variant}`, className)}
    >
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={label}
        onClick={flip}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="fz-card__button"
      >
        {variant === "about" ? (
          <>
            <ThemedPicture base={base} name="still" widths={[720]} width={720} height={900} sizes="26rem" className="fz-card__still" />
            <ThemedPicture base={base} name="back" widths={[720]} width={720} height={900} sizes="26rem" className="fz-card__back" />
          </>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- one dark set (the footer band is always dark) */}
            <img className="fz-card__still" src={`${base}/dark-still-320.avif`} alt="" width={size.w} height={size.h} loading="lazy" decoding="async" />
            {/* eslint-disable-next-line @next/next/no-img-element -- back of the card */}
            <img className="fz-card__back" src={`${base}/dark-back-320.avif`} alt="" width={size.w} height={size.h} loading="lazy" decoding="async" />
          </>
        )}
        <video ref={video} className="fz-card__idle" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture />
        {/* eslint-disable-next-line @next/next/no-img-element -- sequence frame (tilt / flip) */}
        <img ref={seq} className="fz-card__seq" alt="" width={size.w} height={size.h} decoding="sync" />
      </button>
      <div
        className="fz-card__contact"
        role="group"
        aria-label="Contact details"
        hidden={!flipped}
        style={{ "--fz-left": `${L.left}%`, "--fz-width": `${L.width}%` } as CSSProperties}
      >
        <a href={`mailto:${profile.email}`} className="fz-card__email" style={{ top: `${L.rows[0]}%` }}>
          {variant === "about" ? (
            <>
              {emailUser}
              <wbr />@{emailDomain}
            </>
          ) : (
            "Email"
          )}
        </a>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" style={{ top: `${L.rows[1]}%` }}>
          {variant === "about" ? githubLabel : "GitHub"}
        </a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{ top: `${L.rows[2]}%` }}>
          {variant === "about" ? linkedinLabel : "LinkedIn"}
        </a>
      </div>
    </div>
  );
}
