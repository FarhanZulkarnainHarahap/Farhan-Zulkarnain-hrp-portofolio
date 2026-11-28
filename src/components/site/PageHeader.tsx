import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section";
import { cn } from "@/lib/utils";

/**
 * Top of a standalone page (Kinetic): technical label, the page's single H1 set large and tight,
 * a full-width rule, then the lead and actions offset to the right of the 12-column grid
 * (asymmetric editorial layout). `visual` is a right-hand slot on desktop for a 3D object or an
 * illustration (the WebGL page scenes of Fase 10 mount into the persistent canvas instead).
 *
 * Entrance (MotionController): the rule under the title draws left → right, then the actions and
 * the visual rise. The eyebrow, the H1 and the lead are never hidden: on phones the lead is the
 * LCP element of these pages (Fase 12.8). Reduced motion / no JS: everything final.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  visual,
  className,
  sceneProps,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  visual?: ReactNode;
  className?: string;
  /** JSON data (API-derived counts) for the page's 3D scene slot (Fase K4). */
  sceneProps?: Record<string, unknown>;
}) {
  return (
    <header className={cn("pt-section-sm pb-section-sm", className)}>
      <Container
        size="wide"
        className="grid gap-x-(--spacing-grid-gap) gap-y-10 lg:grid-cols-12"
      >
        <div
          className={cn(
            "flex flex-col gap-8",
            visual ? "lg:col-span-8" : "lg:col-span-11",
          )}
        >
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-display text-display-xl text-ink text-balance uppercase">
            {title}
          </h1>
        </div>
        {visual && (
          <div
            data-intro="visual"
            className="hidden self-end lg:col-span-4 lg:block"
          >
            {visual}
          </div>
        )}
        <span
          aria-hidden="true"
          data-intro-line
          className="block h-(--border-hairline) origin-left bg-hairline-strong lg:col-span-12"
        />
        {(lead || children) && (
          // The empty columns 1–5 beside the lead: the page's slot in the persistent 3D canvas
          // (Fase K4). No box on small screens, so the 3D never overlaps text there.
          <div
            aria-hidden="true"
            data-scene-anchor="page"
            data-scene-props={sceneProps ? JSON.stringify(sceneProps) : undefined}
            className="hidden lg:col-span-5 lg:block lg:self-stretch"
          />
        )}
        {(lead || children) && (
          <div className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7">
            {lead && (
              <p className="max-w-reading text-copy-lg text-body text-pretty">
                {lead}
              </p>
            )}
            {children && <div data-intro="cta">{children}</div>}
          </div>
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
