"use client";
/**
 * Hero visual slot (desktop only, decorative). A static CSS dot pattern sits behind the Blender
 * poster (theme-aware, only the active variant is fetched). On capable desktops HeroModelSlot
 * loads the three.js model once the slot is visible and cross-fades it over the poster.
 */
import { useState } from "react";
import { ThemedPicture } from "@/components/media/ThemedPicture";
import { POSTER } from "./hero-frame";
import { HeroModelSlot } from "./HeroModelSlot";

export function HeroVisual() {
  const [ready, setReady] = useState(false);
  return (
    <div data-intro aria-hidden="true" className="relative hidden lg:col-span-5 lg:block">
      <div
        data-hero-visual
        data-model-ready={ready}
        className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-(--card-radius) border border-hairline bg-surface"
      >
        <div className="dot-pattern absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,var(--ui-accent-soft),transparent_60%)]" />
        <ThemedPicture
          base="/3d/hero"
          widths={POSTER.widths}
          width={POSTER.width}
          height={POSTER.height}
          sizes="(min-width: 64rem) 14rem, 1px"
          className="hero-model-poster absolute"
          style={POSTER.rect}
        />
        <HeroModelSlot onReady={setReady} />
        <div className="pointer-events-none absolute inset-x-8 top-8 flex items-center justify-between font-meta text-label text-muted uppercase">
          <span>Medan, Indonesia</span>
          <span>UTC+7</span>
        </div>
      </div>
    </div>
  );
}
