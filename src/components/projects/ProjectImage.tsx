"use client";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import {
  cloudinaryImageLoader,
  isCloudinaryImage,
  validImageSource,
} from "@/lib/image-loader";
import { cn } from "@/lib/utils";

/** Project screenshot in a fixed-ratio frame; a broken or missing image shows a calm fallback. */
export function ProjectImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const usable = Boolean(src && validImageSource(src) && !failed);
  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden rounded-(--media-radius) bg-(--media-bg)",
        className,
      )}
    >
      {usable ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loader={isCloudinaryImage(src!) ? cloudinaryImageLoader : undefined}
          unoptimized={!isCloudinaryImage(src!)}
          onError={() => setFailed(true)}
          className="object-cover object-top transition-transform duration-(--duration-slow) ease-standard group-hover:scale-[1.02] motion-reduce:transition-none"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
          <ImageOff
            aria-hidden="true"
            className="size-(--icon-md)"
            strokeWidth={1.5}
          />
          <span className="font-meta text-meta">Image unavailable</span>
        </div>
      )}
    </div>
  );
}
