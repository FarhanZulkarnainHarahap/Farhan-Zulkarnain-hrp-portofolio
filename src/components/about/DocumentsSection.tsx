"use client";
import { Download } from "lucide-react";
import { ProjectImage } from "@/components/projects/ProjectImage";
import {
  ServerCollection,
  type CollectionState,
} from "@/components/site/ServerCollection";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import {
  documentCategoryLabel,
  documentDownloadHref,
  formatBytes,
} from "@/lib/display/documents";
import type { Loaded } from "@/lib/server/content";
import type { Document } from "@/services/api";

function DocumentsView({ state }: { state: CollectionState<Document> }) {
  return (
    <Section
      id="documents"
      eyebrow="Documents"
      title="CV and certificates."
      description="Download my CV or view education and professional certificates."
      size="wide"
      className="border-t border-hairline"
    >
      {state.loading ? (
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          aria-busy="true"
          aria-label="Loading documents"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : state.error ? (
        <ErrorState
          title="Documents couldn't be loaded."
          description={state.error}
          onRetry={state.retry}
        />
      ) : state.data.length === 0 ? (
        <EmptyState title="Documents will be listed here soon." />
      ) : (
        <ul
          data-reveal="group"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {state.data.map((doc) => {
            const size = formatBytes(doc.size);
            return (
              <li
                key={doc.id}
                className="flex flex-col gap-4 rounded-(--card-radius) border border-(color:--card-border) p-3 pb-5"
              >
                <ProjectImage
                  src={doc.previewUrl}
                  alt=""
                  sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 92vw"
                  className="aspect-[4/3]"
                />
                <div className="flex flex-1 flex-col gap-2 px-2">
                  <p className="font-meta text-meta text-muted">
                    {[documentCategoryLabel(doc.category), size]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h3 className="font-heading text-title text-ink [overflow-wrap:anywhere]">
                    {doc.name}
                  </h3>
                  <a
                    href={documentDownloadHref(doc)}
                    className={buttonClasses({
                      variant: "link",
                      className: "mt-auto self-start",
                    })}
                    aria-label={`Download ${doc.name}${size ? ` (${size})` : ""}`}
                  >
                    <Download aria-hidden="true" />
                    {size ? `Download (${size})` : "Download"}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

export function DocumentsSection({ initial }: { initial: Loaded<Document> }) {
  return (
    <ServerCollection initial={initial} path="/api/documents">
      {(state) => <DocumentsView state={state} />}
    </ServerCollection>
  );
}
