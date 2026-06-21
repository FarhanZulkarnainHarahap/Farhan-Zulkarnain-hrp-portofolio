"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
import GalaxyScene from "@/components/GalaxyScene";

interface DocumentData {
  id: string;
  name: string;
  category: string;
  size: number;
  fileUrl: string;
  previewUrl?: string | null;
  createdAt: string;
}

const DOCS_PER_PAGE = 6;

const DocumentSkeleton = () => (
  <section className="relative mx-auto w-full max-w-7xl px-4 py-20 md:px-6">
    <GalaxyScene className="z-0 opacity-35" count={480} />
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

    <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: DOCS_PER_PAGE }, (_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-xl border border-white/7 bg-[#101720]/92 shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
        >
          <div className="h-44 bg-linear-to-br from-white/14 via-white/8 to-blue-500/8 md:h-50" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-4/5 rounded-full bg-white/12" />
                <div className="h-3 w-2/5 rounded-full bg-white/8" />
              </div>
              <div className="h-10 w-10 rounded-lg border border-white/8 bg-white/6" />
            </div>
            <div className="mt-5 flex items-center justify-between">
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
    <section id="documents" className="relative mx-auto w-full max-w-7xl px-4 py-20 md:px-6">
      <GalaxyScene className="z-0 opacity-35" count={560} />
      <div className="relative z-10 mb-10 border-b border-white/10 pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-blue-400">
              Document Preview
            </p>
            <h2 className="text-4xl font-black uppercase italic leading-none tracking-tight text-white md:text-6xl">
              Credential <span className="text-zinc-500">&</span> Assets<span className="text-blue-500">.</span>
            </h2>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
            {docs.length} Verified Files
          </p>
        </div>
      </div>

      <div className="relative z-10 mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
        <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDocs.map((doc, index) => {
            const previewType = getPreviewType(doc);

            return (
              <motion.article
                key={doc.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group overflow-hidden rounded-xl border border-white/7 bg-[#101720]/92 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35"
              >
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="OPEN"
                  className="relative block h-38 overflow-hidden bg-white md:h-42"
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
                    <div className="relative h-full overflow-hidden bg-[#f8fafc] p-5 text-slate-900">
                      <div className="absolute inset-y-0 right-0 w-23 bg-linear-to-l from-slate-200 to-transparent" />
                      <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-blue-100" />
                      <div className="relative z-10 flex h-full flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight text-blue-700">
                              {doc.category || "certificate"}
                            </p>
                            <h4 className="mt-3 max-w-52 text-2xl font-black uppercase leading-none tracking-tight">
                              Certificate
                            </h4>
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-300 bg-white text-blue-600 shadow-sm">
                            {getIcon(doc.category)}
                          </div>
                        </div>

                        <div className="mt-auto">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Awarded to
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-900">Farhan Zulkarnain</p>
                          <p className="mt-3 line-clamp-2 max-w-80 text-sm font-semibold leading-snug text-slate-600">
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

                <div className="relative p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-white">
                        {doc.name}
                      </h3>
                      <p className="mt-1 truncate text-sm text-zinc-500">{doc.category}</p>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      data-cursor-label="DOWNLOAD"
                      aria-label={`Download ${doc.name}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-zinc-400 transition-colors hover:border-blue-500/50 hover:text-blue-400"
                    >
                      <FaDownload size={13} />
                    </a>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <FaCalendarAlt size={11} />
                      {formatDate(doc.createdAt)}
                    </div>
                    <span className="rounded-md border border-blue-500/20 bg-blue-500/12 px-2.5 py-1 text-[10px] font-bold text-blue-300">
                      {doc.category || formatSize(doc.size)}
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <div className="relative z-10 rounded-3xl border border-dashed border-white/10 px-6 py-20 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-600">
          No certificate found
        </div>
      )}

      <div className="relative z-10 mt-9 flex items-center justify-center gap-3">
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
