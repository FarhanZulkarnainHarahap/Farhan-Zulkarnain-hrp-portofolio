"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaCertificate,
  FaDownload,
  FaFilePdf,
  FaFileSignature,
  FaSearch,
  FaUserGraduate,
} from "react-icons/fa";
import { fetchCachedJson } from "@/lib/client-cache";
import { getOptimizedImageUrl } from "@/lib/image";

interface DocumentData {
  id: string;
  name: string;
  category: string;
  size: number;
  fileUrl: string;
  previewUrl?: string | null;
  createdAt: string;
}

const DOCS_PER_PAGE = 5;

const DocumentSkeleton = () => (
  <section className="relative mx-auto w-full max-w-7xl px-4 py-20 md:px-6 lg:flex lg:h-screen lg:flex-col lg:justify-start lg:pb-32 lg:pt-18">
    <div className="relative z-10 mb-10 animate-pulse border-b border-white/10 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-4 h-3 w-42 rounded-full bg-blue-500/18" />
          <div className="h-12 w-80 rounded-2xl bg-white/10 md:h-16 md:w-135" />
        </div>
        <div className="h-3 w-36 rounded-full bg-white/8" />
      </div>
    </div>

    <div className="relative z-10 mb-7 flex animate-pulse flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="h-12 w-full rounded-lg border border-white/8 bg-[#111722]/80 md:max-w-sm" />
      <div className="h-12 w-full rounded-lg border border-white/8 bg-[#111722]/80 md:w-56" />
    </div>

    <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4">
      {Array.from({ length: DOCS_PER_PAGE }, (_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-xl border border-white/7 bg-[#101720]/92 shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
        >
          <div className="h-24 bg-linear-to-br from-white/14 via-white/8 to-blue-500/8 sm:h-34 md:h-50" />
          <div className="p-2 sm:p-3 md:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-4/5 rounded-full bg-white/12" />
                <div className="h-3 w-2/5 rounded-full bg-white/8" />
              </div>
              <div className="h-7 w-7 rounded-lg border border-white/8 bg-white/6 sm:h-9 sm:w-9 md:h-10 md:w-10" />
            </div>
            <div className="mt-3 hidden items-center justify-between sm:flex md:mt-5">
              <div className="h-3 w-28 rounded-full bg-white/8" />
              <div className="h-7 w-24 rounded-md border border-blue-500/10 bg-blue-500/12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default function DocSection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const result = await fetchCachedJson<{ success: boolean; data: DocumentData[] }>(
          `${API_URL}/api/documents`,
          `portfolio-documents:${API_URL}`,
        );
        if (result.success) {
          setDocs(result.data);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [API_URL]);

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

  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "certificate":
        return <FaCertificate size={18} />;
      case "education":
        return <FaUserGraduate size={18} />;
      case "resume":
        return <FaFileSignature size={18} />;
      default:
        return <FaFilePdf size={18} />;
    }
  };

  const getPreviewType = (doc: DocumentData) => {
    const value = `${doc.name} ${doc.fileUrl}`.toLowerCase().split("?")[0];
    if (value.includes(".pdf")) return "pdf";
    if (/\.(png|jpe?g|webp|gif|avif)$/.test(value)) return "image";
    return "unsupported";
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
      <div className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden px-5 pb-36 pt-20 sm:px-8 lg:justify-start lg:px-10 lg:pb-40 lg:pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(139,92,246,0.12),transparent_36%)]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_440px] lg:items-end">
            <div>
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tight text-white md:text-5xl">
                Credential <span className="text-zinc-500">&</span> Assets<span className="text-blue-500">.</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                Verified certificates, résumé files, documentation, and professional assets
                presented as a floating glass archive.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
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
              className="scrollbar-none w-full cursor-grab overflow-x-auto overscroll-x-contain pb-4 outline-none focus-visible:ring-1 focus-visible:ring-blue-400/60 active:cursor-grabbing"
            >
              <div
                className="flex w-max snap-x snap-mandatory gap-5 pr-6 lg:gap-7 lg:pr-10"
              >
                {filteredDocs.map((doc) => {
            const previewType = getPreviewType(doc);

            return (
              <div
                key={doc.id}
                className="w-[82vw] max-w-100 shrink-0 snap-center pt-3"
              >
              <article className="premium-static-tilt group relative overflow-hidden rounded-[26px] border border-cyan-300/12 bg-[linear-gradient(145deg,rgba(16,28,48,0.92),rgba(5,11,22,0.82))] p-2 shadow-[0_22px_70px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl hover:border-cyan-300/45 hover:shadow-[0_28px_80px_rgba(37,99,235,0.22),0_0_35px_rgba(34,211,238,0.1)]">
                <span className="pointer-events-none absolute left-6 top-0 z-20 h-5 w-32 rounded-b-xl border-x border-b border-cyan-300/20 bg-cyan-300/8 shadow-[0_6px_24px_rgba(34,211,238,0.12)]" />
                <span className="pointer-events-none absolute inset-x-5 top-3 z-20 h-px bg-linear-to-r from-transparent via-cyan-300/60 to-transparent" />
                <a
                  data-folder-cover
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="OPEN"
                  className="relative block h-52 origin-bottom overflow-hidden rounded-[20px] bg-white transition-transform duration-500 group-hover:[transform:perspective(900px)_translateY(-3px)_rotateX(-2deg)] sm:h-62 lg:h-48"
                  aria-label={`Open ${doc.name}`}
                >
                  {doc.previewUrl && (
                    <Image
                      src={getOptimizedImageUrl(doc.previewUrl, 1000)}
                      alt={`${doc.name} preview`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="bg-white object-contain"
                    />
                  )}

                  {!doc.previewUrl && previewType === "pdf" && (
                    <div className="relative h-full overflow-hidden bg-[#f8fafc] p-2.5 text-slate-900 sm:p-4 md:p-5">
                      <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-slate-200 to-transparent sm:w-20 md:w-23" />
                      <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-blue-100 md:h-28 md:w-28" />
                      <div className="relative z-10 flex h-full flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-tight text-blue-700 sm:text-[10px] md:text-xs">
                              {doc.category || "certificate"}
                            </p>
                            <h4 className="mt-1 max-w-30 text-sm font-black uppercase leading-none tracking-tight sm:mt-2 sm:max-w-42 sm:text-lg md:mt-3 md:max-w-52 md:text-2xl">
                              Certificate
                            </h4>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-blue-600 shadow-sm sm:h-10 sm:w-10 md:h-12 md:w-12 md:border-4">
                            {getIcon(doc.category)}
                          </div>
                        </div>

                        <div className="mt-auto">
                          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:block">
                            Awarded to
                          </p>
                          <p className="hidden mt-1 text-sm font-bold text-slate-900 sm:block">Farhan Zulkarnain</p>
                          <p className="mt-1 line-clamp-2 max-w-80 text-[9px] font-semibold leading-snug text-slate-600 sm:mt-2 sm:text-xs md:mt-3 md:text-sm">
                            {doc.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!doc.previewUrl && previewType === "image" && (
                    <Image
                      src={getOptimizedImageUrl(doc.fileUrl, 1000)}
                      alt={doc.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                  )}

                  {!doc.previewUrl && previewType === "unsupported" && (
                    <div className="flex h-full items-center justify-center bg-[#f8fafc] text-slate-400">
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                          {getIcon(doc.category)}
                        </div>
                        <p className="mt-3 text-xs font-bold uppercase tracking-widest">No Preview</p>
                      </div>
                    </div>
                  )}
                </a>

                <div className="relative p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white sm:text-base">
                        {doc.name}
                      </h3>
                      <p className="mt-1 hidden truncate text-sm text-zinc-500 sm:block">{doc.category}</p>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      data-cursor-label="DOWNLOAD"
                      aria-label={`Download ${doc.name}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-zinc-400 transition-colors hover:border-blue-500/50 hover:text-blue-400 sm:h-9 sm:w-9 md:h-10 md:w-10"
                    >
                      <FaDownload size={11} />
                    </a>
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
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="VIEW"
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 text-[9px] font-black uppercase tracking-[0.2em] text-blue-200 transition-all hover:border-blue-300 hover:bg-blue-500 hover:text-white"
                  >
                    <FaFilePdf size={13} />
                    View Document
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
