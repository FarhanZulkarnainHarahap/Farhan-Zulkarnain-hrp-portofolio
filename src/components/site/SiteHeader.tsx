"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { FzMark } from "@/components/brand/FzMark";
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
// Mono uppercase nav with a coordinate index (aria-hidden, so link names stay "Projects", …) and an
// underline that grows from the left on hover / focus / current page.
const navLink =
  "group/nav relative inline-flex min-h-(--hit-area-min) items-center gap-1.5 px-3 font-meta text-label text-body uppercase transition-colors duration-(--duration-fast) ease-standard hover:text-ink " +
  "aria-[current=page]:text-ink after:absolute after:inset-x-3 after:bottom-3 after:h-(--border-hairline) after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-(--duration-base) after:ease-enter aria-[current=page]:after:scale-x-100 hover:after:scale-x-100 focus-visible:after:scale-x-100";
const navIndex =
  "text-muted tabular-nums transition-colors duration-(--duration-fast) group-hover/nav:text-accent group-aria-[current=page]/nav:text-accent";

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
        "site-scheme sticky top-0 z-(--z-header) border-b border-transparent font-body text-body",
        "transition-[border-color,background-color] duration-(--duration-base) ease-standard",
        "data-[scrolled=true]:border-(color:--nav-border) data-[scrolled=true]:bg-(--nav-bg) data-[scrolled=true]:backdrop-blur-(--nav-blur)",
      )}
    >
      <div className="mx-auto grid h-(--nav-height) w-full max-w-wide grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-gutter lg:grid-cols-[auto_1fr_auto] lg:gap-x-6">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            data-cursor="explore"
            className="group/brand inline-flex min-h-(--hit-area-min) min-w-0 items-center gap-3 text-ink"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <FzMark className="size-7 shrink-0 transition-transform duration-(--duration-base) ease-enter group-hover/brand:-rotate-6 motion-reduce:group-hover/brand:rotate-0" />
            <span className="truncate font-display text-meta font-semibold tracking-[-0.01em] uppercase sm:text-small">
              Farhan Zulkarnain
            </span>
          </Link>
          {/* Paired technical labels (desktop): role and place. */}
          <div
            aria-hidden="true"
            className="hidden gap-8 font-meta text-label text-muted uppercase xl:flex"
          >
            <p>
              Full-stack
              <br />
              Engineer
            </p>
            <p>
              Medan
              <br />
              Indonesia
            </p>
          </div>
        </div>
        <nav aria-label="Main" className="hidden justify-self-end lg:block">
          <ul className="flex items-center">
            {primaryLinks.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={navLink}
                  aria-current={
                    isActive(pathname, link.href) ? "page" : undefined
                  }
                >
                  <span aria-hidden="true" className={navIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
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
                  data-cursor="external"
                  className={cn(navLink, "items-center gap-1 [&_svg]:size-(--icon-sm)")}
                >
                  CV
                  <ExternalMark />
                </a>
              )}
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-1 lg:col-start-3">
          <Tooltip content="Search · ⌘K">
            <button
              type="button"
              onClick={openPalette}
              onPointerEnter={loadPalette}
              onFocus={loadPalette}
              aria-label="Search and navigate"
              aria-keyshortcuts="Meta+K Control+K"
              className="inline-flex min-h-(--hit-area-min) min-w-(--hit-area-min) items-center justify-center gap-2 rounded-(--radius-control) text-ink transition-colors duration-(--duration-fast) ease-standard hover:bg-(--button-ghost-bg-hover) md:border md:border-hairline md:px-3 md:hover:border-hairline-strong [&_svg]:size-(--icon-sm)"
            >
              <Search aria-hidden="true" strokeWidth={1.5} />
              <kbd className="hidden font-meta text-label text-muted md:inline">
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
