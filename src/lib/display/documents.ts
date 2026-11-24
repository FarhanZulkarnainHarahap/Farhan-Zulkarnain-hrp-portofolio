/** Display-only helpers for API documents. */
import type { Document } from "@/services/api";
import { getDocumentSlug } from "@/lib/portfolio/documents";

/** 153600 → "150 KB", 1258291 → "1.2 MB". Returns null for missing/invalid sizes. */
export function formatBytes(size: number | null | undefined) {
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0)
    return null;
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
}

/** "CERTIFICATE" → "Certificate"; a category already written in mixed case is kept as is
 * ("Résumé — English & Bahasa Indonesia" keeps its proper nouns, Fase 12.3). */
export function documentCategoryLabel(category: string | null | undefined) {
  const value = (category ?? "").trim();
  if (!value) return "Document";
  if (value !== value.toUpperCase()) return value.charAt(0).toUpperCase() + value.slice(1);
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/** Same-origin download route (keeps the existing /api/documents/[slug]/download behaviour). */
export function documentDownloadHref(document: Pick<Document, "id" | "name">) {
  return `/api/documents/${getDocumentSlug(document)}/download`;
}
