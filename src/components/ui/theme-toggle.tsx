"use client";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "@/components/site/ThemeProvider";
import { cn } from "@/lib/utils";
import { Tooltip } from "./tooltip";

export function ThemeToggle({
  className,
  tooltip = true,
}: {
  className?: string;
  tooltip?: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const label =
    theme === "dark"
      ? "Switch to light theme"
      : theme === "light"
        ? "Switch to dark theme"
        : "Switch theme";
  const Icon = theme === "dark" ? Sun : theme === "light" ? Moon : SunMoon;
  const button = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className={cn(
        "inline-flex size-(--hit-area-min) items-center justify-center rounded-pill text-ink",
        "transition-colors duration-(--duration-fast) ease-standard hover:bg-(--button-ghost-bg-hover)",
        "[&_svg]:size-(--icon-md)",
        className,
      )}
    >
      <Icon aria-hidden="true" strokeWidth={1.5} />
    </button>
  );
  // Tooltips portal to <body>, which sits under a modal <dialog>'s top layer.
  return tooltip ? <Tooltip content={label}>{button}</Tooltip> : button;
}
