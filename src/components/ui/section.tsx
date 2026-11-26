import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";

/**
 * Technical label: mono, uppercase, led by a short rule. Optional `index` ("01") prints as a
 * coordinate before the text. Used above headings and as interface metadata.
 */
export function Eyebrow({
  className,
  index,
  children,
  ...props
}: ComponentPropsWithoutRef<"p"> & { index?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-meta text-label text-muted uppercase",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="h-(--border-hairline) w-(--label-rule-width) shrink-0 bg-current opacity-60"
      />
      {index && (
        <span className="text-ink tabular-nums">{index}</span>
      )}
      <span>{children}</span>
    </p>
  );
}

/**
 * Editorial section header on the 12-column grid: the label sits in its own narrow column, the
 * heading and description take the wide one (asymmetric on purpose), an optional action aligns
 * to the baseline on the right. Stacks on small screens.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  as: Heading = "h2",
  id,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
}) {
  return (
    <div
      data-reveal
      className={cn(
        "grid gap-6 border-t border-hairline pt-6 lg:grid-cols-12 lg:gap-x-(--spacing-grid-gap)",
        className,
      )}
    >
      {eyebrow ? (
        <Eyebrow className="lg:col-span-3">{eyebrow}</Eyebrow>
      ) : (
        <span aria-hidden="true" className="hidden lg:col-span-3 lg:block" />
      )}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:col-span-9">
        <div className="flex max-w-[52rem] flex-col gap-4">
          <Heading
            id={id}
            className={cn(
              "font-heading text-ink text-balance",
              Heading === "h1" ? "text-display-lg" : "text-headline",
            )}
          >
            {title}
          </Heading>
          {description && (
            <p className="max-w-reading text-copy-lg text-body text-pretty">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/** Page section: vertical rhythm + container + optional header. */
export function Section({
  eyebrow,
  title,
  description,
  action,
  headingLevel = "h2",
  size = "page",
  spacing = "default",
  className,
  children,
  id,
  ...props
}: Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  headingLevel?: "h1" | "h2" | "h3";
  size?: "page" | "wide" | "reading";
  spacing?: "default" | "compact";
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        "scroll-mt-(--nav-height)",
        spacing === "compact" ? "py-section-sm" : "py-section",
        className,
      )}
      {...props}
    >
      <Container size={size} className="flex flex-col gap-10">
        {title && (
          <SectionHeader
            id={headingId}
            eyebrow={eyebrow}
            title={title}
            description={description}
            action={action}
            as={headingLevel}
          />
        )}
        {children}
      </Container>
    </section>
  );
}
