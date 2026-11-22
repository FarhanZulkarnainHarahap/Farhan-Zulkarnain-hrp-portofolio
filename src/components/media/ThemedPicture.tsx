"use client";
/**
 * A decorative raster that follows the SITE theme (toggle + data-theme, OS as default), e.g. the
 * Blender posters and the device mockup. Only the active theme's variant is downloaded:
 *  - before JS: CSS picks the variant from data-theme / prefers-color-scheme; the other one is
 *    display:none with loading="lazy", so the browser never fetches it;
 *  - after hydration: the theme state picks it. On a theme change the incoming variant is loaded
 *    and decoded first, then swapped in, so there is no blank frame.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTheme, type Theme } from "@/components/site/ThemeProvider";
import { cn } from "@/lib/utils";

type Props = {
  /** Public folder with `${theme}-${width}.{avif,webp}` files, e.g. "/3d/hero". */
  base: string;
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
  widths,
  width,
  height,
  sizes,
  imgRef,
  imgClassName,
}: Omit<Props, "className" | "style"> & { theme: Theme; imgRef: (el: HTMLImageElement | null) => void }) {
  const set = (ext: string) => widths.map((w) => `${base}/${theme}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture className={`themed-picture__${theme}`}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        ref={imgRef}
        src={`${base}/${theme}-${widths[widths.length - 1]}.webp`}
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
