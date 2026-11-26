import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { LazyFzCard } from "@/components/interactive/LazyFzCard";
import { FzMark } from "@/components/brand/FzMark";
import { ExternalMark } from "@/components/ui/button";
import { profile } from "@/lib/site";
import { cn } from "@/lib/utils";
import { primaryLinks } from "./nav";

const footerLink =
  "inline-flex min-h-(--hit-area-min) items-center gap-1 text-small text-body transition-colors duration-(--duration-fast) ease-standard hover:text-ink [&_svg]:size-(--icon-sm)";
const columnLabel = "pb-3 font-meta text-label text-muted uppercase";

/**
 * Footer (Kinetic): always dark. A large editorial call to action on the 12-column grid, then the
 * brand, the index, elsewhere links and the interactive Fz card (legacy Blender render, Fase 12.5,
 * framed in its render colour until the WebGL card of Fase 10), then a mono colophon. No clock.
 */
export function SiteFooter() {
  return (
    <footer className="scheme-dark border-t border-hairline bg-canvas font-body text-body">
      <div className="mx-auto flex w-full max-w-wide flex-col gap-16 px-gutter pt-section-sm pb-[calc(var(--spacing-section-sm)+env(safe-area-inset-bottom,0px))]">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-(--spacing-grid-gap)">
          <p className="flex items-center gap-3 font-meta text-label text-muted uppercase lg:col-span-3 lg:items-start lg:pt-4">
            <span
              aria-hidden="true"
              className="h-(--border-hairline) w-(--label-rule-width) shrink-0 bg-current opacity-60 lg:mt-[0.5em]"
            />
            Have a project in mind?
          </p>
          <div className="lg:col-span-9">
            <Link
              href="/contact"
              data-magnetic
              className="group/cta inline-flex items-end gap-4 font-display text-display-xl text-ink uppercase transition-colors duration-(--duration-base) ease-standard hover:text-accent"
            >
              <span className="text-balance">Get in touch</span>
              <ArrowUpRight
                aria-hidden="true"
                strokeWidth={1.25}
                className="mb-[0.12em] size-[0.7em] shrink-0 transition-transform duration-(--duration-base) ease-enter group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1 motion-reduce:group-hover/cta:translate-x-0 motion-reduce:group-hover/cta:translate-y-0"
              />
            </Link>
          </div>
        </div>

        <div className="grid gap-12 border-t border-hairline pt-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-(--spacing-grid-gap)">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex min-h-(--hit-area-min) w-fit items-center gap-3 text-ink"
            >
              <FzMark className="size-8 shrink-0" />
              <span className="font-display text-title font-semibold tracking-[-0.02em] uppercase">
                Farhan Zulkarnain Harahap
              </span>
            </Link>
            <p className="max-w-xs text-small text-body">
              Full-stack engineer based in Medan, Indonesia.
            </p>
          </div>
          <nav aria-label="Footer" className="lg:col-span-2">
            <p aria-hidden="true" className={columnLabel}>
              Index
            </p>
            <ul>
              {primaryLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-span-2">
            <p aria-hidden="true" className={columnLabel}>
              Elsewhere
            </p>
            <ul aria-label="Elsewhere">
              <li>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="external"
                  className={footerLink}
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
                  data-cursor="external"
                  className={footerLink}
                >
                  LinkedIn
                  <ExternalMark />
                </a>
              </li>
              <li>
                <a href={`mailto:${profile.email}`} className={footerLink}>
                  Email
                </a>
              </li>
            </ul>
          </div>
          {/* Fz card (Fase 12.5): loads as the footer comes near; click / Enter / tap flips it. */}
          <div className="sm:col-span-2 lg:col-span-4 lg:justify-self-end">
            <LazyFzCard variant="footer" />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-4 border-t border-hairline pt-6 font-meta text-label uppercase sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted">
            © {new Date().getFullYear()} Farhan Zulkarnain Harahap · Built with
            Next.js
          </p>
          <p aria-hidden="true" className="hidden text-muted md:block">
            Kinetic Systems — Medan, ID
          </p>
          <a href="#top" className={cn(footerLink, "font-meta text-label uppercase")}>
            Back to top
            <ArrowUp aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
