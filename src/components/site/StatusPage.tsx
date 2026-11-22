import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section";

/** Shared look for 404 and error pages (docs/COPY.md → Global). */
export function StatusPage({
  eyebrow,
  title,
  body,
  actions,
}: {
  eyebrow: string;
  title: string;
  body: string;
  actions: ReactNode;
}) {
  return (
    <main id="main-content" className="flex flex-1 items-center">
      <Container size="wide" className="flex flex-col gap-6 py-section">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-3xl font-heading text-display-lg text-ink text-balance">
          {title}
        </h1>
        <p className="max-w-reading text-copy-lg text-body">{body}</p>
        <div className="flex flex-wrap gap-3 pt-2">{actions}</div>
      </Container>
    </main>
  );
}
