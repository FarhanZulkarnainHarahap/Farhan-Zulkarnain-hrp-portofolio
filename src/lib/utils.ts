import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the custom design tokens (globals.css @theme) so e.g. `text-small`
// is treated as a font size and does not override `text-ink` (a color).
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display-xl",
        "display-lg",
        "headline",
        "title",
        "copy-lg",
        "copy",
        "small",
        "meta",
        "label",
      ],
      color: [
        "canvas",
        "surface",
        "raised",
        "scrim",
        "ink",
        "body",
        "muted",
        "hairline",
        "hairline-strong",
        "field",
        "accent",
        "accent-hover",
        "on-accent",
        "accent-soft",
        "focus",
        "selection",
        "success",
        "danger",
        "warning",
      ],
      font: ["heading", "body", "meta"],
      radius: ["control", "card", "pill"],
      shadow: ["raised", "overlay"],
      ease: ["standard", "enter", "exit"],
      container: ["page", "wide", "reading"],
      spacing: ["gutter", "section", "section-sm"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
