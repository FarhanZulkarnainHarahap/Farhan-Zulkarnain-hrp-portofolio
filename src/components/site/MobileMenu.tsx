"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FzMark } from "@/components/brand/FzMark";
import { ExternalMark } from "@/components/ui/button";
import { profile } from "@/lib/site";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { CV_FALLBACK, isActive, primaryLinks } from "./nav";

const iconButton =
  "inline-flex size-(--hit-area-min) items-center justify-center rounded-(--radius-control) text-ink transition-colors duration-(--duration-fast) ease-standard hover:bg-(--button-ghost-bg-hover) [&_svg]:size-(--icon-md)";

/**
 * Full-height sheet built on a modal <dialog>: the rest of the page is inert (focus stays
 * inside), Esc closes it, focus returns to the menu button, and page scroll is locked.
 */
export function MobileMenu({ cv }: { cv: string }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  // Close when the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const media = matchMedia("(min-width: 64rem)");
    const onChange = () => media.matches && dialog.current?.close();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        className={cn(iconButton, "lg:hidden")}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        <Menu aria-hidden="true" strokeWidth={1.5} />
      </button>
      <dialog
        ref={dialog}
        id="mobile-menu"
        aria-label="Menu"
        onClose={() => setOpen(false)}
        className={cn(
          "site-scheme m-0 h-dvh max-h-none w-full max-w-none bg-(--menu-bg) p-0 text-body",
          // Sheet enters from the top (base, ease-enter) and leaves faster (fast, ease-exit).
          "transition-[opacity,translate,display,overlay] transition-discrete duration-(--duration-fast) ease-exit",
          "-translate-y-2 opacity-0 open:translate-y-0 open:opacity-100 open:duration-(--duration-base) open:ease-enter",
          "starting:open:-translate-y-2 starting:open:opacity-0 motion-reduce:translate-y-0",
          "backdrop:bg-scrim",
        )}
      >
        {/* Safe areas (viewport-fit=cover) and its own scroll in a short landscape viewport. */}
        <div className="flex h-full flex-col overflow-y-auto overscroll-contain px-[max(var(--spacing-gutter),env(safe-area-inset-left,0px))] pt-[env(safe-area-inset-top,0px)] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
          <div className="flex h-(--nav-height) items-center justify-between">
            <Link
              href="/"
              onClick={close}
              className="inline-flex min-h-(--hit-area-min) items-center gap-3 text-ink"
            >
              <FzMark className="size-7 shrink-0" />
              <span className="font-display text-meta font-semibold whitespace-nowrap uppercase sm:text-small">
                Farhan Zulkarnain
              </span>
            </Link>
            <button
              type="button"
              className={iconButton}
              aria-label="Close menu"
              onClick={close}
            >
              <X aria-hidden="true" strokeWidth={1.5} />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-1 flex-col pt-6">
            <p
              aria-hidden="true"
              className="flex items-center gap-3 pb-4 font-meta text-label text-muted uppercase"
            >
              <span className="h-(--border-hairline) w-(--label-rule-width) bg-current opacity-60" />
              Index
            </p>
            <ul className="flex flex-col border-t border-hairline">
              {primaryLinks.map((link, index) => (
                <li key={link.href} className="border-b border-hairline">
                  <Link
                    href={link.href}
                    autoFocus={index === 0}
                    onClick={close}
                    aria-current={
                      isActive(pathname, link.href) ? "page" : undefined
                    }
                    className={cn(
                      "group/item flex min-h-16 items-baseline gap-4 py-3 font-display text-display-lg text-ink uppercase",
                      "aria-[current=page]:text-accent",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="w-7 shrink-0 font-meta text-label text-muted tabular-nums"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-6 pt-10">
              <ul
                aria-label="Elsewhere"
                className="flex flex-wrap gap-x-6 gap-y-1 font-meta text-label uppercase"
              >
                <li>
                  {cv === CV_FALLBACK ? (
                    <Link
                      href={cv}
                      onClick={close}
                      className="inline-flex min-h-(--hit-area-min) items-center gap-1 text-ink"
                    >
                      CV
                    </Link>
                  ) : (
                    <a
                      href={cv}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex min-h-(--hit-area-min) items-center gap-1 text-ink [&_svg]:size-(--icon-sm)"
                    >
                      CV
                      <ExternalMark />
                    </a>
                  )}
                </li>
                <li>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-(--hit-area-min) items-center gap-1 text-body [&_svg]:size-(--icon-sm)"
                  >
                    GitHub
                    <ExternalMark />
                  </a>
                </li>
                <li>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-(--hit-area-min) items-center gap-1 text-body [&_svg]:size-(--icon-sm)"
                  >
                    LinkedIn
                    <ExternalMark />
                  </a>
                </li>
              </ul>
              <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4">
                <p className="font-meta text-label text-muted uppercase">
                  Medan, Indonesia
                </p>
                <ThemeToggle tooltip={false} />
              </div>
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
}
