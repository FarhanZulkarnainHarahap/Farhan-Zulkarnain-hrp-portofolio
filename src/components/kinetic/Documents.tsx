"use client";
import type { Document } from "@/services/api";
import { getDocumentSlug } from "@/lib/portfolio/documents";
import { Media, SectionHeading } from "./Primitives";
import { CollectionState } from "@/components/admin/CollectionState";
import { useCollection } from "@/hooks/useCollection";
export default function Documents() {
  const state = useCollection<Document>("/api/documents");
  return (
    <section className="section">
      <SectionHeading
        number="01.C"
        label="CREDENTIAL ARCHIVE"
        title="The work behind the work."
        description="CV, education, and professional certificates."
      />
      <CollectionState {...state} empty={!state.data.length} />
      <div className="document-grid">
        {!state.loading &&
          !state.error &&
          state.data.map((doc) => (
            <article className="document-item" key={doc.id}>
              <Media src={doc.previewUrl || ""} alt={`${doc.name} preview`} />
              <p className="eyebrow">
                {doc.category} / {Math.round(doc.size / 1024)} KB
              </p>
              <h2>{doc.name}</h2>
              <a
                className="text-link"
                href={`/api/documents/${getDocumentSlug(doc)}/download`}
              >
                Download document ↓
              </a>
            </article>
          ))}
      </div>
    </section>
  );
}
