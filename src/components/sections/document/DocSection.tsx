"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaCertificate,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaFilePdf,
  FaFileSignature,
  FaSearch,
  FaUserGraduate,
} from "react-icons/fa";

interface DocumentData {
  id: string;
  name: string;
  category: string;
  size: number;
  fileUrl: string;
  previewUrl?: string | null;
  createdAt: string;
}

const DOCS_PER_PAGE = 3;

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

    <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-5">
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
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/documents`);
        const result = await response.json();
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

  const pageCount = Math.max(1, Math.ceil(filteredDocs.length / DOCS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const visibleDocs = filteredDocs.slice((safePage - 1) * DOCS_PER_PAGE, safePage * DOCS_PER_PAGE);

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
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  if (loading) {
    return <DocumentSkeleton />;
  }

  return (
  <section id="documents" className="relative mx-auto w-full max-w-7xl px-4 py-20 md:px-6 lg:flex lg:h-screen lg:flex-col lg:justify-start lg:pb-32 lg:pt-18">
      <div className="relative z-10 mb-8 border-b border-white/10 pb-6 lg:mb-4 lg:pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-blue-400 lg:mb-1">
              Document Preview
            </p>
            <h2 className="text-4xl font-black uppercase italic leading-none tracking-tight text-white md:text-5xl lg:text-4xl xl:text-5xl">
              Credential <span className="text-zinc-500">&</span> Assets<span className="text-blue-500">.</span>
            </h2>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
            {docs.length} Verified Files
          </p>
        </div>
      </div>

      <div className="relative z-10 mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between lg:mb-4">
        <label className="relative w-full md:max-w-sm">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={13} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => changeSearch(event.target.value)}
            placeholder="Search certificate..."
            className="h-12 w-full rounded-lg border border-white/10 bg-[#111722]/80 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-blue-500/55"
          />
        </label>

        <select
          aria-label="Filter documents by category"
          value={categoryFilter}
          onChange={(event) => changeFilter(event.target.value)}
          className="h-12 w-full rounded-lg border border-white/10 bg-[#111722]/80 px-4 text-sm text-zinc-300 outline-none transition-colors focus:border-blue-500/55 md:w-56"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {visibleDocs.length > 0 ? (
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-5">
          {visibleDocs.map((doc) => {
            const previewType = getPreviewType(doc);

            return (
              <article
                key={doc.id}
                className="group overflow-hidden rounded-xl border border-white/7 bg-[#101720]/92 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35"
              >
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="OPEN"
                  className="relative block h-24 overflow-hidden bg-white sm:h-34 md:h-42 lg:h-38 xl:h-44"
                  aria-label={`Open ${doc.name}`}
                >
                  {doc.previewUrl && (
                    <Image
                      src={doc.previewUrl}
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
                      src={doc.fileUrl}
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

                <div className="relative p-2 sm:p-3 md:p-3.5">
                  <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-[10px] font-bold leading-tight text-white sm:text-xs md:truncate md:text-base">
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
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="relative z-10 rounded-3xl border border-dashed border-white/10 px-6 py-20 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-600">
          No certificate found
        </div>
      )}

      <div className="relative z-10 mt-9 flex items-center justify-center gap-3 lg:mt-5">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={safePage === 1}
          aria-label="Previous document page"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-zinc-400 transition-colors hover:border-blue-500/45 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <FaChevronLeft size={12} />
        </button>

        {Array.from({ length: pageCount }, (_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold transition-colors ${
                pageNumber === safePage
                  ? "border-blue-400 bg-blue-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.35)]"
                  : "border-white/10 bg-white/3 text-zinc-400 hover:border-blue-500/45 hover:text-blue-400"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          disabled={safePage === pageCount}
          aria-label="Next document page"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-zinc-400 transition-colors hover:border-blue-500/45 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <FaChevronRight size={12} />
        </button>
      </div>
    </section>
  );
}
