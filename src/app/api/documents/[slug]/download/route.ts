import { NextResponse } from "next/server";
import {
  findDocumentBySlug,
  formatDocumentFileName,
} from "@/lib/portfolio/documents";
import { getDocuments } from "@/services/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLOUDINARY_HOST = "res.cloudinary.com";
const CLOUDINARY_CLOUD_NAME = "dpanr1qqp";

const extensionByContentType: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const sanitizeFileName = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[a-zA-Z0-9]{1,8}$/, "")
    .replace(/[^a-zA-Z0-9._ -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 100) || "document";

const getSourceExtension = (sourceUrl: URL, contentType: string) => {
  const sourceFile = decodeURIComponent(sourceUrl.pathname.split("/").pop() || "");
  const match = sourceFile.match(/(\.[a-zA-Z0-9]{1,8})$/);

  if (match) return match[1].toLowerCase();
  return extensionByContentType[contentType.split(";")[0].trim().toLowerCase()] || ".pdf";
};

type DownloadProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: DownloadProps) {
  const { slug } = await params;
  const documents = await getDocuments().catch(() => []);
  const document = findDocumentBySlug(documents, slug);

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  let sourceUrl: URL;

  try {
    sourceUrl = new URL(document.fileUrl);
  } catch {
    return NextResponse.json({ error: "Invalid document URL." }, { status: 400 });
  }

  const isTrustedCloudinaryFile =
    sourceUrl.protocol === "https:" &&
    sourceUrl.hostname === CLOUDINARY_HOST &&
    sourceUrl.pathname.startsWith(`/${CLOUDINARY_CLOUD_NAME}/`);

  if (!isTrustedCloudinaryFile) {
    return NextResponse.json({ error: "Document source is not allowed." }, { status: 403 });
  }

  try {
    const upstream = await fetch(sourceUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/pdf,image/*,application/octet-stream",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "The document could not be downloaded." },
        { status: upstream.status || 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") || "application/pdf";
    const extension = getSourceExtension(sourceUrl, contentType);
    const fileName = `${sanitizeFileName(formatDocumentFileName(document))}${extension}`;
    const headers = new Headers({
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    });
    const contentLength = upstream.headers.get("content-length");

    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(upstream.body, { headers });
  } catch {
    return NextResponse.json(
      { error: "The document service is temporarily unavailable." },
      { status: 502 },
    );
  }
}
