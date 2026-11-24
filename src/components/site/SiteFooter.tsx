import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { LazyFzCard } from "@/components/interactive/LazyFzCard";
import { ExternalMark } from "@/components/ui/button";
import { profile } from "@/lib/site";
import { primaryLinks } from "./nav";

const footerLink =
  "inline-flex min-h-(--hit-area-min) items-center gap-1 text-small text-body transition-colors duration-(--duration-fast) ease-standard hover:text-ink [&_svg]:size-(--icon-sm)";

/** Dark editorial band (DESIGN.md → Components → Footer). No live clock. */
export function SiteFooter() {
  return (
    <footer className="scheme-dark bg-canvas font-body text-body">
      <div className="mx-auto flex w-full max-w-wide flex-col gap-12 px-gutter pt-section-sm pb-[calc(var(--spacing-section-sm)+env(safe-area-inset-bottom,0px))]">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex max-w-sm flex-col gap-2">
            <Link
              href="/"
              className="inline-flex min-h-(--hit-area-min) w-fit items-center font-heading text-headline text-ink"
            >
              Farhan Zulkarnain Harahap
            </Link>
            <p className="text-copy text-body">
              Full-stack engineer based in Medan, Indonesia.
            </p>
          </div>
          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 sm:gap-x-16">
              <nav aria-label="Footer">
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
              <ul aria-label="Elsewhere">
                <li>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
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
            <LazyFzCard variant="footer" />
          </div>
        </div>
        <div className="flex flex-col-reverse gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-meta text-meta text-muted">
            © {new Date().getFullYear()} Farhan Zulkarnain Harahap. Built with
            Next.js.
          </p>
          <a href="#top" className={footerLink}>
            Back to top
            <ArrowUp aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
