"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { LuArrowLeft, LuCloudUpload, LuCircleCheck, LuLink, LuCode, LuLoader } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UploadPortoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // State untuk form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    demoUrl: "",
    repoUrl: "",
  });

  // Handle input teks
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle input file & preview
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // Submit ke Backend Express
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Pilih gambar proyek terlebih dahulu!");

    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("demoUrl", formData.demoUrl);
    data.append("repoUrl", formData.repoUrl);
    data.append("image", file); // Pastikan field name 'image' sama dengan di Multer backend

    try {
      const response = await fetch(`${API_URL}/api/portofolios`, {
        method: "POST",
        body: data,
        credentials: "include", 
        // Header Content-Type tidak perlu diisi manual jika menggunakan FormData
        // Jika ada token, tambahkan di sini:
        // headers: { "Authorization": `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        alert("Proyek berhasil dipublikasikan!");
        router.push("/admin/portofolio");
        router.refresh();
      } else {
        alert("Gagal: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header Section */}
      <div className="mb-10 flex items-center justify-between">
        <Link 
          href="/admin/portofolio" 
          className="flex items-center gap-2 text-slate-500 hover:text-[#6f42c1] transition-colors text-sm font-bold group"
        >
          <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke List
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">
            New Project
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Portfolio Management
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Kolom Kiri: Form Data */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-50/50 p-8 rounded-4xl border border-slate-100 space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Judul Proyek</label>
              <input 
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Masukkan nama proyek..." 
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-[#6f42c1] transition-all font-bold text-slate-700" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Deskripsi</label>
              <textarea 
                rows={5}
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Ceritakan singkat tentang proyek ini..." 
                className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-purple-500/10 font-bold text-slate-700 focus:border-[#6f42c1] transition-all"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px]  uppercase tracking-widest font-black text-slate-400 mb-2">Demo URL</label>
                <div className="relative">
                  <input 
                    type="url"
                    name="demoUrl"
                    value={formData.demoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com" 
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-4 font-bold text-slate-700 focus:ring-purple-500/10 focus:border-[#6f42c1] transition-all text-sm" 
                  />
                  <LuLink className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Repository URL</label>
                <div className="relative">
                  <input 
                    type="url"
                    name="repoUrl"
                    value={formData.repoUrl}
                    onChange={handleChange}
                    placeholder="https://github.com..." 
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-4 outline-none  font-bold text-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-[#6f42c1] transition-all text-sm" 
                  />
                  <LuCode className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Upload & Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-2 hover:border-[#6f42c1] transition-colors group relative overflow-hidden">
            {preview ? (
              <div className="relative w-full aspect-video rounded-[36px] overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full text-xs"
                > Hapus </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-16 cursor-pointer bg-slate-50/50 rounded-[36px] group-hover:bg-purple-50/50 transition-all">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-[#6f42c1] transition-all group-hover:scale-110">
                  <LuCloudUpload size={32} />
                </div>
                <p className="mt-5 text-sm font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Pilih Screenshot</p>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Format: JPG, PNG (16:9)</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#6f42c1] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-purple-200 hover:bg-[#5a32a3] transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <LuLoader className="animate-spin" /> : <LuCircleCheck size={20} />}
              {loading ? "Publishing..." : "Publish Project"}
            </button>
            <button 
              type="button"
              onClick={() => router.back()}
              className="w-full bg-white text-slate-400 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:text-red-500 transition-colors"
            >
              Batalkan & Kembali
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
