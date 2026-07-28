"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaCertificate,
  FaFilePdf,
  FaFileSignature,
  FaSearch,
  FaUserGraduate,
} from "react-icons/fa";
import { fetchCachedJson } from "@/lib/client-cache";
import { getOptimizedImageUrl } from "@/lib/image";
import { getDocumentSlug } from "@/lib/portfolio/documents";

interface DocumentData {
  id: string;
  name: string;
  category: string;
  size: number;
  fileUrl: string;
  previewUrl?: string | null;
  createdAt: string;
}

const DOCUMENT_SKELETON_COUNT = 4;

const getDocumentIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case "certificate":
      return <FaCertificate size={24} />;
    case "education":
      return <FaUserGraduate size={24} />;
    case "resume":
      return <FaFileSignature size={24} />;
    default:
      return <FaFilePdf size={24} />;
  }
};

const DocumentSkeleton = () => (
  <section
    className="relative min-h-screen w-full scroll-mt-4"
    aria-label="Loading documents"
    aria-busy="true"
  >
    <div className="relative w-full overflow-hidden pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(139,92,246,0.12),transparent_36%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl animate-pulse">
        <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_440px] lg:items-end">
          <div>
            <div className="h-10 w-72 rounded-xl bg-white/10 md:h-12 md:w-102" />
            <div className="mt-3 h-3 w-full max-w-150 rounded-full bg-white/7" />
            <div className="mt-2 h-3 w-4/5 max-w-115 rounded-full bg-white/5" />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <div className="h-11 w-full rounded-xl border border-white/8 bg-[#111722]/80">
              <div className="ml-4 mt-4 h-3 w-32 rounded-full bg-white/7" />
            </div>
            <div className="h-11 w-full rounded-xl border border-white/8 bg-[#111722]/80">
              <div className="ml-3 mt-4 h-3 w-24 rounded-full bg-white/7" />
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden pb-4">
          <div className="flex w-max gap-5 pr-6 lg:gap-7 lg:pr-10">
            {Array.from({ length: DOCUMENT_SKELETON_COUNT }, (_, index) => (
              <div
                key={index}
                className="w-[82vw] max-w-100 shrink-0 pt-3"
              >
                <article className="relative overflow-hidden rounded-[26px] border border-cyan-300/10 bg-[linear-gradient(145deg,rgba(16,28,48,0.92),rgba(5,11,22,0.82))] p-2 shadow-[0_22px_70px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <span className="absolute left-6 top-0 z-20 h-5 w-32 rounded-b-xl border-x border-b border-cyan-300/10 bg-cyan-300/5" />
                  <span className="absolute inset-x-5 top-3 z-20 h-px bg-linear-to-r from-transparent via-cyan-300/25 to-transparent" />

                  <div className="relative h-52 overflow-hidden rounded-[20px] bg-linear-to-br from-white/14 via-white/7 to-blue-500/8 sm:h-62 lg:h-48">
                    <div className="absolute left-5 top-5 h-3 w-22 rounded-full bg-white/12" />
                    <div className="absolute left-5 top-10 h-7 w-3/5 rounded-lg bg-white/10" />
                    <div className="absolute bottom-5 left-5 h-2.5 w-4/5 rounded-full bg-white/8" />
                    <div className="absolute right-5 top-5 h-11 w-11 rounded-full border-4 border-white/8 bg-white/7" />
                  </div>

                  <div className="relative p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-4/5 rounded-full bg-white/12" />
                        <div className="mt-2 hidden h-3 w-2/5 rounded-full bg-white/7 sm:block" />
                      </div>
                      <div className="h-7 w-7 shrink-0 rounded-lg border border-white/8 bg-white/5 sm:h-9 sm:w-9 md:h-10 md:w-10" />
                    </div>

                    <div className="mt-2 flex items-center justify-end sm:mt-3 sm:justify-between">
                      <div className="hidden h-3 w-26 rounded-full bg-white/7 sm:block" />
                      <div className="h-5 w-20 rounded-md border border-blue-500/10 bg-blue-500/8" />
                    </div>

                    <div className="mt-4 h-10 w-full rounded-xl border border-blue-400/12 bg-blue-500/6">
                      <div className="mx-auto mt-4 h-2 w-32 rounded-full bg-blue-300/10" />
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 h-2.5 w-32 rounded-full bg-white/7" />
      </div>
    </div>
  </section>
);

const DocumentCover = ({
  doc,
  previewType,
}: {
  doc: DocumentData;
  previewType: "pdf" | "image" | "unsupported";
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = !imageFailed
    ? doc.previewUrl || (previewType === "image" ? doc.fileUrl : null)
    : null;

  if (imageSource) {
    return (
      <>
        <Image
          src={getOptimizedImageUrl(imageSource, 1000)}
          alt={`${doc.name} preview`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="bg-white object-contain"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#02050b]/18 via-transparent to-transparent" />
      </>
    );
  }

  return (
    <div className="relative flex h-full overflow-hidden bg-[#f8fafc] text-slate-900">
      <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-blue-100 to-transparent" />
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-100" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-tr-full bg-slate-100" />

      <div className="relative z-10 flex h-full w-full flex-col p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
              {doc.category || "Document"}
            </p>
            <h4 className="mt-2 max-w-72 text-2xl font-black uppercase leading-none tracking-tight">
              {doc.category?.toLowerCase() === "resume"
                ? "Curriculum Vitae"
                : doc.category || "Portfolio File"}
            </h4>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-4 border-slate-200 bg-white text-blue-600 shadow-sm">
            {getDocumentIcon(doc.category)}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Farhan Zulkarnain Harahap
          </p>
          <p className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-slate-700">
            {doc.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function DocSection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const result = await fetchCachedJson<{ success: boolean; data: DocumentData[] }>(
          "/api/documents",
          "portfolio-documents",
        );
        if (result.success) {
          setDocs(result.data);
        }
      } catch {
        setDocs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      const canScrollForward =
        event.deltaY > 0 && viewport.scrollLeft < maxScroll - 1;
      const canScrollBackward =
        event.deltaY < 0 && viewport.scrollLeft > 1;

      if (!canScrollForward && !canScrollBackward) return;

      event.preventDefault();
      viewport.scrollLeft += event.deltaY;
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [docs.length]);

  const categories = useMemo(
    () => Array.from(new Set(docs.map((doc) => doc.category).filter(Boolean))),
    [docs],
  );

  const filteredDocs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return docs.filter((doc) => {
      const matchesSearch = `${doc.name} ${doc.category}`.toLowerCase().includes(keyword);
      const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, docs, searchTerm]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(value));

  const getPreviewType = (doc: DocumentData) => {
    const value = `${doc.name} ${doc.fileUrl}`.toLowerCase().split("?")[0];
    if (value.includes(".pdf")) return "pdf";
    if (/\.(png|jpe?g|webp|gif|avif)$/.test(value)) return "image";
    return "unsupported";
  };

  const getDownloadUrl = (doc: DocumentData) => {
    return `/api/documents/${getDocumentSlug(doc)}/download`;
  };

  const changeFilter = (nextCategory: string) => {
    setCategoryFilter(nextCategory);
    viewportRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const changeSearch = (value: string) => {
    setSearchTerm(value);
    viewportRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  if (loading) {
    return <DocumentSkeleton />;
  }

  return (
    <section
      id="documents"
      className="relative min-h-screen w-full scroll-mt-4"
    >
      <div className="relative w-full overflow-hidden pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(139,92,246,0.12),transparent_36%)]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-end">
            <div>
              <h2 className="text-[clamp(2.25rem,5vw,4.5rem)] font-black uppercase leading-[0.98] tracking-tight text-white">
                Credential <span className="text-zinc-500">&</span> Assets<span className="text-blue-500">.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-8 text-zinc-400 sm:text-base">
                Verified certificates, résumé files, documentation, and professional assets
                presented as a floating glass archive.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
              <label className="relative">
                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={13} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => changeSearch(event.target.value)}
                  placeholder="Search documents..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#111722]/80 pl-11 pr-4 text-xs text-white outline-none placeholder:text-zinc-500 focus:border-blue-500/55"
                />
              </label>

              <select
                aria-label="Filter documents by category"
                value={categoryFilter}
                onChange={(event) => changeFilter(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-[#111722]/80 px-3 text-xs text-zinc-300 outline-none focus:border-blue-500/55"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredDocs.length > 0 ? (
            <div
              ref={viewportRef}
              role="region"
              aria-label="Scrollable document cards"
              tabIndex={0}
              className="w-full pb-4 outline-none focus-visible:ring-1 focus-visible:ring-blue-400/60"
            >
              <div
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {filteredDocs.map((doc) => {
            const previewType = getPreviewType(doc);
            const downloadUrl = getDownloadUrl(doc);

            return (
              <div
                key={doc.id}
                className="min-w-0 pt-3"
              >
              <article className="premium-static-tilt group relative overflow-hidden rounded-[26px] border border-cyan-300/12 bg-[linear-gradient(145deg,rgba(16,28,48,0.92),rgba(5,11,22,0.82))] p-2 shadow-[0_22px_70px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl hover:border-cyan-300/45 hover:shadow-[0_28px_80px_rgba(37,99,235,0.22),0_0_35px_rgba(34,211,238,0.1)]">
                <span className="pointer-events-none absolute left-6 top-0 z-20 h-5 w-32 rounded-b-xl border-x border-b border-cyan-300/20 bg-cyan-300/8 shadow-[0_6px_24px_rgba(34,211,238,0.12)]" />
                <span className="pointer-events-none absolute inset-x-5 top-3 z-20 h-px bg-linear-to-r from-transparent via-cyan-300/60 to-transparent" />
                <div
                  data-folder-cover
                  className="relative block h-64 origin-bottom overflow-hidden rounded-[20px] bg-white transition-transform duration-500 group-hover:[transform:perspective(900px)_translateY(-3px)_rotateX(-2deg)] sm:h-76 lg:h-72"
                >
                  <DocumentCover doc={doc} previewType={previewType} />
                  <span className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/88 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-900 shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-md">
                    {formatSize(doc.size)}
                  </span>
                </div>

                <div className="relative p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white sm:text-base">
                        {doc.name}
                      </h3>
                      <p className="mt-1 hidden truncate text-sm text-zinc-500 sm:block">{doc.category}</p>
                    </div>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-zinc-400 sm:h-9 sm:w-9 md:h-10 md:w-10">
                      <FaFilePdf size={11} />
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2 sm:mt-3 sm:gap-3">
                    <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex">
                      <FaCalendarAlt size={11} />
                      {formatDate(doc.createdAt)}
                    </div>
                    <span className="rounded-md border border-blue-500/20 bg-blue-500/12 px-1.5 py-0.5 text-[8px] font-bold text-blue-300 sm:px-2.5 sm:py-1 sm:text-[10px]">
                      {doc.category || formatSize(doc.size)}
                    </span>
                  </div>

                  <a
                    href={downloadUrl}
                    download
                    data-cursor-label="DOWNLOAD"
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 text-[9px] font-black uppercase tracking-[0.2em] text-blue-200 transition-all hover:border-blue-300 hover:bg-blue-500 hover:text-white"
                  >
                    <FaFilePdf size={13} />
                    Download Document
                  </a>
                </div>
              </article>
              </div>
            );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 px-6 py-20 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-600">
              No document found
            </div>
          )}

          <div className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 sm:tracking-[0.24em]">
            <span>{filteredDocs.length} / {docs.length} verified files</span>
          </div>
        </div>
      </div>

    </section>
  );
}
