import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { cls: "size-(--avatar-sm)", px: 32 },
  md: { cls: "size-(--avatar-md)", px: 48 },
  lg: { cls: "size-(--avatar-lg)", px: 80 },
} as const;

/** Round portrait with an initials fallback when no image is given. */
export function Avatar({
  src,
  name,
  size = "md",
  priority = false,
  className,
}: {
  src?: string;
  name: string;
  size?: keyof typeof sizes;
  priority?: boolean;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill bg-(--avatar-bg) font-meta text-small text-ink",
        sizes[size].cls,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${sizes[size].px}px`}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <span aria-label={name} role="img">
          {initials}
        </span>
      )}
    </span>
  );
}
