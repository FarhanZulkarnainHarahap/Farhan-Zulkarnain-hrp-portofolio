import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";

/** Mono uppercase label above headings. */
export function Eyebrow({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn("font-meta text-label text-muted uppercase", className)}
      {...props}
    />
  );
}

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
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="flex max-w-reading flex-col gap-3">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
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
          <p className="text-copy-lg text-body text-pretty">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
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
