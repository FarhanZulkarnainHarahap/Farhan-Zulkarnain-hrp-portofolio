"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  FaDownload, 
  FaEye,
  FaExternalLinkAlt,
  FaFilePdf, 
  FaCertificate, 
  FaUserGraduate, 
  FaFileSignature,
  FaTimes,
} from "react-icons/fa";
import { LuLoader } from "react-icons/lu";
// Interface disesuaikan dengan skema backend Prisma/Cloudinary kamu
interface DocumentData {
  id: string;
  name: string;
  category: string;
  size: number;
  fileUrl: string;
  createdAt: string;
}

export default function DocSection() {
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    document.body.style.overflow = selectedDoc ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedDoc]);

  // Format Size (Bytes ke KB/MB)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Pilih Ikon berdasarkan kategori dari DB
  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'certificate': return <FaCertificate size={16} />;
      case 'education': return <FaUserGraduate size={16} />;
      case 'resume': return <FaFileSignature size={16} />;
      default: return <FaFilePdf size={16} />;
    }
  };

  const getPreviewType = (doc: DocumentData) => {
    const value = `${doc.name} ${doc.fileUrl}`.toLowerCase().split("?")[0];
    if (value.includes(".pdf")) return "pdf";
    if (/\.(png|jpe?g|webp|gif|avif)$/.test(value)) return "image";
    return "unsupported";
  };

  if (loading) return (
    <div className="flex min-h-100 w-full items-center justify-center bg-[#030406]">
          <div className="flex flex-col items-center gap-4">
            <LuLoader className="animate-spin text-blue-500" size={32} />
            <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em]">Loading</p>
          </div>
        </div>
  );

  return (
    <section id="documents" className="relative w-full max-w-5xl mx-auto py-24 px-6">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="relative space-y-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-sm">Public</span>
              <div className="w-12 h-px bg-zinc-800" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
              Credential <span className="text-zinc-700 not-italic">&</span> Assets<span className="text-blue-600">.</span>
            </h2>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              {docs.length} verified files
            </span>
          </div>
        </div>

        {/* GRID DOKUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative flex items-center justify-between p-5 bg-[#0d0d0d] border border-white/5 rounded-2xl hover:border-blue-500/50 hover:bg-[#111111] transition-all duration-300 overflow-hidden"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-linear-to-r from-blue-600/0 via-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <button
                type="button"
                onClick={() => setSelectedDoc(doc)}
                data-cursor-label="PREVIEW"
                className="relative z-10 flex min-w-0 flex-1 items-center gap-5 text-left"
              >
                {/* ICON BOX */}
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all duration-500">
                  {getIcon(doc.category)}
                </div>
                
                <div className="min-w-0 space-y-1">
                  <h3 className="truncate text-white text-sm font-bold uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                    {doc.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                      {doc.category}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">
                      {formatSize(doc.size)}
                    </span>
                  </div>
                </div>
              </button>

              {/* DOWNLOAD ACTION */}
              <div className="relative z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  data-cursor-label="VIEW"
                  aria-label={`Preview ${doc.name}`}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-600 transition-all duration-300 hover:border-blue-500 hover:text-blue-500"
                >
                  <FaEye size={12} />
                </button>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  data-cursor-label="DOWNLOAD"
                  aria-label={`Download ${doc.name}`}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-600 transition-all duration-300 hover:border-blue-500 hover:text-blue-500"
                >
                  <FaDownload size={12} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedDoc && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Preview ${selectedDoc.name}`}
            className="fixed inset-0 z-150 flex items-center justify-center bg-black/80 px-3 py-4 sm:px-4 sm:py-6"
          >
            <div className="relative flex h-[86dvh] max-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[26px] border border-blue-500/25 bg-[#070a12] shadow-[0_24px_80px_rgba(0,0,0,0.55)] md:rounded-3xl">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3 md:items-center md:px-5">
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.28em] text-blue-500">Document Preview</p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-black uppercase tracking-tight text-white md:truncate md:text-base">
                    {selectedDoc.name}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={selectedDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="OPEN"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-colors hover:border-blue-500 hover:text-blue-500"
                    aria-label="Buka document di tab baru"
                  >
                    <FaExternalLinkAlt size={12} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(null)}
                    data-cursor-label="CLOSE"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-colors hover:border-blue-500 hover:text-blue-500"
                    aria-label="Tutup preview"
                  >
                    <FaTimes size={13} />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 bg-[#030406]">
                {getPreviewType(selectedDoc) === "pdf" && (
                  <>
                    <iframe
                      src={`${selectedDoc.fileUrl}#toolbar=0&navpanes=0`}
                      title={`Preview ${selectedDoc.name}`}
                      className="hidden h-full w-full md:block"
                      loading="lazy"
                    />
                    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center md:hidden">
                      <div className="flex h-18 w-18 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
                        <FaFilePdf size={34} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase tracking-tight text-white">PDF siap dibuka</h4>
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
                          Preview PDF langsung sering tidak stabil di browser mobile. Gunakan tombol di bawah untuk melihat dokumen dengan viewer bawaan HP.
                        </p>
                      </div>
                      <div className="flex w-full max-w-xs flex-col gap-3">
                        <a
                          href={selectedDoc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-blue-600 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-blue-700"
                        >
                          Buka PDF
                        </a>
                        <a
                          href={selectedDoc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="rounded-full border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-blue-500 hover:text-blue-500"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {getPreviewType(selectedDoc) === "image" && (
                  <div className="relative h-full w-full">
                    <Image
                      src={selectedDoc.fileUrl}
                      alt={selectedDoc.name}
                      fill
                      sizes="100vw"
                      loading="lazy"
                      className="object-contain p-4"
                    />
                  </div>
                )}

                {getPreviewType(selectedDoc) === "unsupported" && (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                    <FaFilePdf className="text-blue-500" size={42} />
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tight text-white">Preview belum tersedia</h4>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                        Format file ini tidak bisa ditampilkan langsung di browser. Buka di tab baru atau download untuk melihat detailnya.
                      </p>
                    </div>
                    <a
                      href={selectedDoc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-blue-600 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-blue-700"
                    >
                      Buka Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER FOOTNOTE */}
        <div className="flex flex-col items-center gap-4 pt-12">
          <div className="w-full h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.4em] text-center leading-loose">
            Digitally Signed • Encrypted Transport • Nexxus Verified Assets
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
}
