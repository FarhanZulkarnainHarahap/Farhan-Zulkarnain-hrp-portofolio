"use client";

import { useEffect, useState } from "react";
import { 
  LuFileText, 
  LuDownload, 
  LuTrash2, 
  LuPlus, 
  LuCalendar, 
  LuLoader, 
  LuSignature,
  LuHardDrive
} from "react-icons/lu";
import Link from "next/link";

// Interface sesuai dengan database Prisma kamu
interface Document {
  id: string;
  name: string;
  fileUrl: string;
  category: string;
  size: number; // Dalam satuan Bytes
  createdAt: string;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  // 1. Fungsi Helper Format Size (Bytes ke KB/MB)
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 2. Fetch Data dari API
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/documents`, {
        cache: 'no-store'
      });
      const result = await response.json();
      if (result.success) {
        setDocs(result.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 3. Fungsi Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus dokumen ini secara permanen?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/documents${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setDocs(docs.filter(doc => doc.id !== id));
      }
    } catch (error) {
      alert("Gagal menghapus file");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LuLoader className="h-10 w-10 animate-spin text-[#6f42c1]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tighter text-slate-800 uppercase italic">
            <LuSignature className="text-[#6f42c1]" />
            Documents
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">
            Cloud storage management system
          </p>
        </div>
        
        <Link href="/admin/document/upload">
          <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-gray-800 shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95">
            <LuPlus size={20} />
            Upload New File
          </button>
        </Link>
      </div>

      {/* Modern Table Card */}
      <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">File Info</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Size</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {docs.length > 0 ? (
                docs.map((doc) => (
                  <tr key={doc.id} className="group transition-colors hover:bg-indigo-50/20">
                    {/* Column: Nama & Date */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 transition-all duration-300 group-hover:bg-red-500 group-hover:text-white group-hover:rotate-6">
                          <LuFileText size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 transition-colors group-hover:text-indigo-600">{doc.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <LuCalendar size={12} className="text-slate-300" />
                            <span>{new Date(doc.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column: Category */}
                    <td className="px-6 py-5 text-center md:text-left">
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        {doc.category}
                      </span>
                    </td>

                    {/* Column: SIZE (Sudah Diformat) */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <LuHardDrive size={14} className="text-slate-300" />
                        <span className="text-xs font-bold font-mono">{formatFileSize(doc.size)}</span>
                      </div>
                    </td>

                    {/* Column: Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          className="rounded-xl border border-slate-100 p-2.5 text-slate-400 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-md" 
                          title="Download"
                        >
                          <LuDownload size={18} />
                        </a>
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          className="rounded-xl border border-slate-100 p-2.5 text-slate-400 transition-all hover:bg-white hover:text-red-500 hover:shadow-md" 
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
                      <p className="text-xs font-bold uppercase tracking-widest">No vault items found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-6">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <p>Total Items: {docs.length}</p>
            <p className="hidden md:block border-l border-slate-200 pl-4 uppercase tracking-tighter italic">Status: Secured by Nexxus</p>
          </div>
        </div>
      </div>
    </div>
  );
}
