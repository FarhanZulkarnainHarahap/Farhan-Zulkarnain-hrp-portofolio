import Link from "next/link";
import type { ReactNode } from "react";

/** Frame for /auth pages: brand link home, title, subtitle, form, footer link. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh items-center justify-center bg-canvas px-gutter py-section-sm font-body text-body"
    >
      <div className="flex w-full max-w-md flex-col gap-8">
        <Link href="/" className="self-center font-heading text-title text-ink">
          Farhan Zulkarnain
        </Link>
        <div className="flex flex-col gap-6 rounded-(--card-radius) border border-hairline bg-raised p-(--card-padding) shadow-raised md:p-10">
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="font-heading text-headline text-ink">{title}</h1>
            <p className="font-meta text-label text-muted uppercase">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
        <p className="text-center text-small text-body">{footer}</p>
      </div>
    </main>
  );
}
