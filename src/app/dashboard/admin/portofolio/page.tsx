"use client";

import { useEffect, useState } from "react";
import { LuPlus, LuPencilLine, LuTrash2, LuExternalLink, LuLayers, LuLoader } from "react-icons/lu";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string | null;
  repoUrl: string | null;
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const fetchPortfolios = async () => {
    try {
      const response = await fetch(`${API_URL}/api/portofolios`, {
        cache: 'no-store'
      });
      const result = await response.json();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI DELETE
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus proyek "${title}"?`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`${API_URL}/api/portofolios/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Hapus data dari state lokal agar tampilan langsung update tanpa refresh
        setProjects((prev) => prev.filter((project) => project.id !== id));
        alert("Proyek berhasil dihapus");
      } else {
        alert("Gagal menghapus proyek: " + (result.message || "Terjadi kesalahan server"));
      }
    } catch (error) {
      console.error("Error delete:", error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LuLoader className="h-10 w-10 animate-spin text-[#6f42c1]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tighter text-slate-800">
            <LuLayers className="text-[#6f42c1]" />
            Portfolio Projects
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Pamerkan karya terbaik Anda kepada dunia.</p>
        </div>
        
        <Link href="/admin/portofolio/upload">
          <button className="flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-100 transition-all hover:bg-green-700 active:scale-95">
            <LuPlus size={20} />
            Upload Proyek Baru
          </button>
        </Link>
      </div>

      {/* Grid Portfolio */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div 
              key={project.id} 
              className={`group flex flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200 ${deletingId === project.id ? "opacity-50 grayscale" : ""}`}
            >
              {/* Image Preview Area */}
              <div className="relative h-56 overflow-hidden bg-slate-100">
                <img 
                  src={project.imageUrl} 
                  className="h-full w-full object-cover transition-all duration-700 group-hover:rotate-2 group-hover:scale-110"
                  alt={project.title}
                />
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                   <a 
                     href={project.demoUrl || "#"} 
                     target="_blank" 
                     className="rounded-full bg-white p-3 text-black shadow-xl transition-transform hover:scale-110"
                   >
                      <LuExternalLink size={20} />
                   </a>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold leading-tight text-slate-800 transition-colors group-hover:text-[#6f42c1]">
                    {project.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {project.description}
                  </p>
                </div>
                
                <div className="mt-auto flex gap-3 border-t border-slate-50 pt-6">
                  <button className="flex flex-2 items-center justify-center gap-2 rounded-2xl bg-slate-50 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition-all hover:bg-[#6f42c1] hover:text-white">
                    <LuPencilLine size={16} />
                    Edit
                  </button>
                  
                  {/* TOMBOL DELETE */}
                  <button 
                    onClick={() => handleDelete(project.id, project.title)}
                    disabled={deletingId === project.id}
                    className="flex flex-1 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm shadow-red-100 transition-all hover:bg-red-500 hover:text-white disabled:cursor-not-allowed"
                  >
                    {deletingId === project.id ? (
                      <LuLoader size={18} className="animate-spin" />
                    ) : (
                      <LuTrash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest">Belum ada proyek yang diunggah.</p>
          </div>
        )}

        <Link href="/admin/portofolio/upload" className="group flex flex-col items-center justify-center rounded-4xl border-4 border-dashed border-slate-100 p-8 text-slate-300 transition-all hover:border-[#6f42c1] hover:bg-indigo-50/30 hover:text-[#6f42c1]">
           <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-100 transition-all group-hover:border-[#6f42c1]">
              <LuPlus size={32} />
           </div>
           <p className="text-lg font-black uppercase tracking-tighter">Add New Case Study</p>
        </Link>
      </div>
    </div>
  );
}
