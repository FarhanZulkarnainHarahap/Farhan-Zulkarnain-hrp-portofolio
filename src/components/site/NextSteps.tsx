import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/** Closing band that points to the next page in the visitor's path (docs/PAGE_MAP.md). */
export function NextSteps({
  title,
  primary,
  secondary,
}: {
  title: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section aria-label="Next steps" className="py-section">
      <Container size="wide">
        <div className="flex flex-col gap-6 border-t border-hairline pt-10 md:flex-row md:items-center md:justify-between">
          <p className="font-heading text-headline text-ink text-balance">
            {title}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={primary.href}
              className={buttonClasses({ variant: "primary", size: "lg" })}
            >
              {primary.label}
              <ArrowRight aria-hidden="true" />
            </Link>
            {secondary && (
              <Link
                href={secondary.href}
                className={buttonClasses({ variant: "secondary", size: "lg" })}
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
