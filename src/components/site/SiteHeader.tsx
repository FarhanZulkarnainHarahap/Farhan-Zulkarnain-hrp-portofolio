"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { ExternalMark } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Document } from "@/services/api";
import { MobileMenu } from "./MobileMenu";
import { CV_FALLBACK, cvHref, isActive, primaryLinks } from "./nav";

// The ⌘K palette (±10 KB) is loaded on first use (Fase 12.1): ⌘K / Ctrl+K or the search button.
// Hovering or focusing the button warms the chunk so the first open feels instant.
const loadPalette = () => import("./CommandPalette");
const CommandPalette = dynamic(() => loadPalette().then((m) => m.CommandPalette), { ssr: false });
const navLink =
  "relative inline-flex min-h-(--hit-area-min) items-center px-3 text-small text-body transition-colors duration-(--duration-fast) ease-standard hover:text-ink " +
  "aria-[current=page]:text-ink after:absolute after:inset-x-3 after:bottom-2.5 after:h-(--border-hairline) after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-(--duration-base) after:ease-standard aria-[current=page]:after:scale-x-100 hover:after:scale-x-100";

export function SiteHeader() {
  const pathname = usePathname();
  const documents = useCollection<Document>("/api/documents");
  const cv = cvHref(documents.data);
  const [scrolled, setScrolled] = useState(false);
  const [paletteKey, setPaletteKey] = useState(0);
  const [paletteWanted, setPaletteWanted] = useState(false);
  const openWhenReady = useRef(false);
  const palette = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (palette.current?.open) palette.current.close();
        else openPalette();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function openPalette() {
    if (!palette.current) {
      // First use: load the palette, open it as soon as its <dialog> is mounted.
      openWhenReady.current = true;
      setPaletteWanted(true);
      return;
    }
    if (palette.current.open) return;
    setPaletteKey((key) => key + 1);
    palette.current.showModal();
  }
  const onPaletteReady = useCallback(() => {
    if (!openWhenReady.current || !palette.current || palette.current.open) return;
    openWhenReady.current = false;
    setPaletteKey((key) => key + 1);
    palette.current.showModal();
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "site-scheme sticky top-0 z-(--z-header) border-b border-transparent bg-(--nav-bg) font-body text-body backdrop-blur-(--nav-blur)",
        "transition-[border-color] duration-(--duration-base) ease-standard data-[scrolled=true]:border-(color:--nav-border)",
      )}
    >
      <div className="mx-auto flex h-(--nav-height) w-full max-w-wide items-center justify-between gap-4 px-gutter">
        <Link
          href="/"
          className="inline-flex min-h-(--hit-area-min) items-center font-heading text-title text-ink"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          Farhan Zulkarnain
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center">
            {primaryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={navLink}
                  aria-current={
                    isActive(pathname, link.href) ? "page" : undefined
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              {cv === CV_FALLBACK ? (
                <Link href={cv} className={navLink}>
                  CV
                </Link>
              ) : (
                <a
                  href={cv}
                  target="_blank"
                  rel="noopener"
                  className={cn(navLink, "gap-1 [&_svg]:size-(--icon-sm)")}
                >
                  CV
                  <ExternalMark />
                </a>
              )}
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <Tooltip content="Search · ⌘K">
            <button
              type="button"
              onClick={openPalette}
              onPointerEnter={loadPalette}
              onFocus={loadPalette}
              aria-label="Search and navigate"
              aria-keyshortcuts="Meta+K Control+K"
              className="inline-flex min-h-(--hit-area-min) min-w-(--hit-area-min) items-center justify-center gap-2 rounded-pill text-ink transition-colors duration-(--duration-fast) ease-standard hover:bg-(--button-ghost-bg-hover) md:border md:border-hairline md:px-3 [&_svg]:size-(--icon-sm)"
            >
              <Search aria-hidden="true" strokeWidth={1.5} />
              <kbd className="hidden font-meta text-meta text-muted md:inline">
                ⌘K
              </kbd>
            </button>
          </Tooltip>
          <ThemeToggle />
          <MobileMenu cv={cv} />
        </div>
      </div>
      {paletteWanted && (
        <CommandPalette dialog={palette} cv={cv} mountKey={paletteKey} onReady={onPaletteReady} />
      )}
    </header>
  );
}
