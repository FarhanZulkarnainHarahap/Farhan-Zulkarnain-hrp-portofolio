import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section";
import { cn } from "@/lib/utils";

/**
 * Top of a standalone page: eyebrow, the page's single H1, a lead and optional actions.
 * `visual` is a slot on the right (desktop) for an illustration (Fase 9) or 3D accent (Fase 10).
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  visual,
  className,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  visual?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("pt-section-sm pb-section-sm", className)}>
      <Container size="wide" className="grid items-end gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-heading text-display-lg text-ink text-balance">
            {title}
          </h1>
          {lead && (
            <p className="max-w-reading text-copy-lg text-body text-pretty">
              {lead}
            </p>
          )}
          {children}
        </div>
        {visual && (
          <div className="hidden lg:col-span-4 lg:block">{visual}</div>
        )}
      </Container>
    </header>
  );
}

/**
 * Decorative placeholder for a future illustration or 3D accent. Pass the real asset as
 * children later (e.g. <HeroModel/>, an illustration); until then it renders a calm frame.
 */
export function VisualSlot({
  label,
  children,
  className,
}: {
  label: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-visual-slot={label}
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-(--card-radius) border border-hairline bg-surface",
        className,
      )}
    >
      {children ?? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,var(--ui-accent-soft),transparent_60%)]" />
          <div className="absolute inset-x-6 bottom-6 h-(--border-hairline) bg-hairline-strong" />
          <span className="absolute right-6 bottom-9 font-meta text-label text-muted uppercase">
            {label}
          </span>
        </>
      )}
    </div>
  );
}
