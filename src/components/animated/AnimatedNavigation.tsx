"use client";
/**
 * AnimatedNavigation (Fase K3, Motion): a nav list whose active indicator glides between items
 * (x + width animated from measured offsets — re-measured on route change and resize, never per
 * frame). Hover previews the indicator under the hovered item. Uses aria-current for the active
 * link; works without JS (the indicator is decoration, the active link is also bolded by CSS).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { getMotionTokens } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

export function AnimatedNavigation({ items, label = "Primary", className }: { items: NavItem[]; label?: string; className?: string }) {
  const pathname = usePathname();
  const list = useRef<HTMLUListElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [box, setBox] = useState<{ x: number; width: number } | null>(null);
  const active = items.find((item) => item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))?.href ?? null;
  const focus = hover ?? active;

  useLayoutEffect(() => {
    const measure = () => {
      const el = focus ? list.current?.querySelector<HTMLElement>(`[data-href="${CSS.escape(focus)}"]`) : null;
      setBox(el ? { x: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [focus]);

  const t = getMotionTokens();
  return (
    <nav aria-label={label} className={className}>
      <ul ref={list} className="relative flex items-center gap-6" onPointerLeave={() => setHover(null)}>
        {items.map((item) => (
          <li key={item.href} data-href={item.href}>
            <Link
              href={item.href}
              aria-current={item.href === active ? "page" : undefined}
              onPointerEnter={() => setHover(item.href)}
              onFocus={() => setHover(item.href)}
              onBlur={() => setHover(null)}
              className={cn("inline-flex min-h-(--hit-area-min) items-center font-meta text-label uppercase text-muted transition-colors duration-(--duration-fast) hover:text-ink aria-[current=page]:text-ink")}
            >
              {item.label}
            </Link>
          </li>
        ))}
        <m.span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 left-0 h-px bg-accent"
          initial={false}
          animate={box ? { x: box.x, width: box.width, opacity: 1 } : { opacity: 0 }}
          transition={{ type: "spring", ...t.spring.default }}
        />
      </ul>
    </nav>
  );
}
