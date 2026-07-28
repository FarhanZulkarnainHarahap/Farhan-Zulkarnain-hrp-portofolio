import type { Document } from "@/services/api";
import { slugifyProject } from "./projects";

export function getDocumentSlug(document: Pick<Document, "id" | "name">) {
  return slugifyProject(document.name) || document.id;
}

export function formatDocumentFileName(document: Pick<Document, "name" | "category">) {
  const base = `${document.name || document.category || "document"}`;
  const safe = slugifyProject(base)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");

  return safe || "Farhan-Zulkarnain-Harahap-Document";
}

export function findDocumentBySlug(documents: Document[], slug: string) {
  return documents.find((document) => document.id === slug || getDocumentSlug(document) === slug);
}
