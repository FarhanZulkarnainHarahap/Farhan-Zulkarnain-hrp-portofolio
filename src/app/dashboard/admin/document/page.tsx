"use client";
import { useConfirm } from "@/components/kinetic/Confirmation";

import { useCallback, useEffect, useState } from "react";
import {
  LuFileText,
  LuDownload,
  LuTrash2,
  LuPlus,
  LuCalendar,
  LuLoader,
  LuSignature,
  LuHardDrive,
} from "react-icons/lu";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

// Interface aligned with the Prisma database.
interface Document {
  id: string;
  name: string;
  fileUrl: string;
  category: string;
  size: number; // Dalam satuan Bytes
  createdAt: string;
}
export default function DocumentsPage() {
  const confirm = useConfirm();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  // Format bytes to KB/MB.
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Fetch data from API.
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await apiFetch("/api/documents", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Unable to load collection");
      const result = await response.json();
      if (result.success === false)
        throw new Error("Unable to load collection");
      if (response.ok && result.success) {
        setDocs(result.data);
      }
    } catch (error) {
      setLoadError("Unable to load this collection. Please retry.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchDocuments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchDocuments]);

  // Delete document.
  const handleDelete = async (id: string) => {
    if (!(await confirm("Delete this document permanently?"))) return;

    try {
      const res = await apiFetch(`/api/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        alert(result?.error || result?.message || "Failed to delete document");
        return;
      }

      if (res.ok) {
        setDocs((currentDocs) => currentDocs.filter((doc) => doc.id !== id));
      }
    } catch (error) {
      console.error("Delete document error:", error);
      alert("Failed to delete file");
    }
  };

  if (loadError)
    return (
      <div className="collection-state" role="alert">
        <p>{loadError}</p>
        <button className="button" onClick={fetchDocuments}>
          Retry connection
        </button>
      </div>
    );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LuLoader className="h-10 w-10 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tighter text-[var(--text)] uppercase italic">
            <LuSignature className="text-[var(--primary)]" />
            Documents
          </h1>
          <p className="text-sm font-medium text-[var(--muted)] mt-1 uppercase tracking-widest">
            Cloud storage management system
          </p>
        </div>

        <Link href="/admin/document/upload">
          <button className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-bold text-[var(--text)] shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95">
            <LuPlus size={20} />
            Upload New File
          </button>
        </Link>
      </div>

      {/* Modern Table Card */}
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--section)]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
                  File Info
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
                  Category
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
                  Size
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {docs.length > 0 ? (
                docs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="group transition-colors hover:bg-[var(--section)]"
                  >
                    {/* Column: Name & Date */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-all duration-300 group-hover:bg-red-500 group-hover:text-white group-hover:rotate-6">
                          <LuFileText size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text)] transition-colors group-hover:text-[var(--secondary)]">
                            {doc.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                            <LuCalendar size={12} className="text-slate-300" />
                            <span>
                              {new Date(doc.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column: Category */}
                    <td className="px-6 py-5 text-center md:text-left">
                      <span className="rounded-full border border-[var(--border)] bg-[var(--section)] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">
                        {doc.category}
                      </span>
                    </td>

                    {/* Column: SIZE (Sudah Diformat) */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[var(--muted)]">
                        <LuHardDrive size={14} className="text-slate-300" />
                        <span className="text-xs font-bold font-mono">
                          {formatFileSize(doc.size)}
                        </span>
                      </div>
                    </td>

                    {/* Column: Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] transition-all hover:bg-[var(--card)] hover:text-[var(--secondary)] hover:shadow-md"
                          title="Download"
                        >
                          <LuDownload size={18} />
                        </a>
                        <button
                          aria-label={`Delete ${doc.name}`}
                          onClick={() => handleDelete(doc.id)}
                          className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] transition-all hover:bg-[var(--card)] hover:text-red-500 hover:shadow-md"
                          title="Delete"
                        >
                          <LuTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-20 italic">
                      <LuFileText size={48} className="mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        No vault items found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--section)] px-8 py-6">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
            <p>Total Items: {docs.length}</p>
            <p className="hidden md:block border-l border-[var(--border)] pl-4 uppercase tracking-tighter italic">
              Status: Secured by Nexxus
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
