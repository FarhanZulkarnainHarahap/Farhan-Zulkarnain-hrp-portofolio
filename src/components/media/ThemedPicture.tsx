"use client";
/**
 * A decorative raster that follows the SITE theme (toggle + data-theme, OS as default), e.g. the
 * Blender posters of the hero entrance. Only the active theme's variant is downloaded:
 *  - before JS: CSS picks the variant from data-theme / prefers-color-scheme; the other one is
 *    display:none with loading="lazy", so the browser never fetches it;
 *  - after hydration: the theme state picks it. On a theme change the incoming variant is loaded
 *    and decoded first, then swapped in, so there is no blank frame.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTheme, type Theme } from "@/components/site/ThemeProvider";
import { cn } from "@/lib/utils";

type Mobile = {
  /** Media query for the art-directed mobile render, e.g. "(max-width: 63.98rem)". */
  media: string;
  /** File stem after the theme, e.g. "start-m" → `${theme}-start-m-${width}`. */
  name: string;
  widths: readonly number[];
  sizes: string;
};

type Props = {
  /** Public folder with `${theme}[-${name}]-${width}.{avif,webp}` files, e.g. "/3d/entrance". */
  base: string;
  /** Optional file stem after the theme, e.g. "start" → `${theme}-start-${width}`. */
  name?: string;
  /** Optional art-directed render for small screens (its own framing). */
  mobile?: Mobile;
  widths: readonly number[];
  width: number;
  height: number;
  sizes: string;
  className?: string;
  style?: CSSProperties;
  imgClassName?: string;
};

function Variant({
  theme,
  base,
  name,
  mobile,
  widths,
  width,
  height,
  sizes,
  imgRef,
  imgClassName,
}: Omit<Props, "className" | "style"> & { theme: Theme; imgRef: (el: HTMLImageElement | null) => void }) {
  const stem = name ? `${theme}-${name}` : theme;
  const set = (ext: string, s = stem, ws = widths) => ws.map((w) => `${base}/${s}-${w}.${ext} ${w}w`).join(", ");
  const mStem = mobile ? `${theme}-${mobile.name}` : "";
  return (
    <picture className={`themed-picture__${theme}`}>
      {mobile && (
        <>
          <source media={mobile.media} type="image/avif" srcSet={set("avif", mStem, mobile.widths)} sizes={mobile.sizes} />
          <source media={mobile.media} type="image/webp" srcSet={set("webp", mStem, mobile.widths)} sizes={mobile.sizes} />
        </>
      )}
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        ref={imgRef}
        src={`${base}/${stem}-${widths[widths.length - 1]}.webp`}
        alt=""
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn("block h-full w-full", imgClassName)}
      />
    </picture>
  );
}

export function ThemedPicture({ className, style, ...props }: Props) {
  const { theme } = useTheme();
  const [shown, setShown] = useState<Theme | null>(null);
  const imgs = useRef<Partial<Record<Theme, HTMLImageElement | null>>>({});

  useEffect(() => {
    if (!theme || theme === shown) return;
    if (shown === null) {
      // First sync after hydration: CSS already shows this variant.
      queueMicrotask(() => setShown(theme));
      return;
    }
    const img = imgs.current[theme];
    let cancelled = false;
    const swap = () => queueMicrotask(() => !cancelled && setShown(theme));
    if (!img || img.complete) swap();
    else {
      img.loading = "eager";
      img.decode().then(swap, swap);
    }
    return () => {
      cancelled = true;
    };
  }, [theme, shown]);

  return (
    <div aria-hidden="true" data-shown={shown ?? undefined} className={cn("themed-picture", className)} style={style}>
      {(["light", "dark"] as const).map((t) => (
        <Variant key={t} theme={t} imgRef={(el) => (imgs.current[t] = el)} {...props} />
      ))}
    </div>
  );
}
