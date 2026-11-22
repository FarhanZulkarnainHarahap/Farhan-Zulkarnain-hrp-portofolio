import type { Document } from "@/services/api";
import { getDocumentSlug } from "@/lib/portfolio/documents";

/** Primary navigation (docs/COPY.md → Global). The name links home. */
export const primaryLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/journey", label: "Journey" },
  { href: "/contact", label: "Contact" },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export const CV_FALLBACK = "/about#documents";

/** The CV is whichever API document looks like a CV/resume; same rule as before the redesign. */
export function findCv(documents: Document[]) {
  return documents.find((doc) =>
    /cv|resume|curriculum|curiculum/i.test(`${doc.name} ${doc.category}`),
  );
}

export function cvHref(documents: Document[]) {
  const cv = findCv(documents);
  return cv ? `/api/documents/${getDocumentSlug(cv)}/download` : CV_FALLBACK;
}
