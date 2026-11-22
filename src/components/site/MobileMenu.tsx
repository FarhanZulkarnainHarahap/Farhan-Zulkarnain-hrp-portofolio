"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ExternalMark } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { CV_FALLBACK, isActive, primaryLinks } from "./nav";

const iconButton =
  "inline-flex size-(--hit-area-min) items-center justify-center rounded-pill text-ink transition-colors duration-(--duration-fast) ease-standard hover:bg-(--button-ghost-bg-hover) [&_svg]:size-(--icon-md)";

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
    const media = matchMedia("(min-width: 48rem)");
    const onChange = () => media.matches && dialog.current?.close();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        className={cn(iconButton, "md:hidden")}
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
          "backdrop:bg-scrim",
        )}
      >
        <div className="flex h-full flex-col px-gutter">
          <div className="flex h-(--nav-height) items-center justify-between">
            <Link
              href="/"
              onClick={close}
              className="font-heading text-title text-ink"
            >
              Farhan Zulkarnain
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
          <nav aria-label="Mobile" className="flex flex-1 flex-col pt-8">
            <ul className="flex flex-col">
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
                      "flex min-h-14 items-center font-heading text-headline text-ink",
                      "aria-[current=page]:text-accent",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center justify-between gap-4">
              {cv === CV_FALLBACK ? (
                <Link
                  href={cv}
                  onClick={close}
                  className="inline-flex min-h-(--hit-area-min) items-center gap-1 text-copy text-ink underline decoration-accent underline-offset-(--link-underline-offset)"
                >
                  CV
                </Link>
              ) : (
                <a
                  href={cv}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-(--hit-area-min) items-center gap-1 text-copy text-ink underline decoration-accent underline-offset-(--link-underline-offset) [&_svg]:size-(--icon-sm)"
                >
                  CV
                  <ExternalMark />
                </a>
              )}
              <ThemeToggle tooltip={false} />
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
}
