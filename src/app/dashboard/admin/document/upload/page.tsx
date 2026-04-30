"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { LuArrowLeft, LuFileUp, LuShieldCheck, LuRefreshCw, LuFileText, LuX } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UploadDocPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Resume"); // Default category

  // Handle Pilih File
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Hanya file PDF yang diperbolehkan!");
        return;
      }
      setFile(selectedFile);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // Submit ke Backend
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !name) return alert("Nama dan File wajib diisi!");

    setLoading(true);
    const data = new FormData();
    data.append("name", name);
    data.append("category", category);
    data.append("file", file); // Nama field 'file' sesuai dengan uploadDoc.single('file') di backend
    try {
      const response = await fetch(`${API_URL}/api/documents`, {
        method: "POST",
        body: data,
        credentials: "include", // PENTING: Untuk mengirim cookie accessToken
      });

      const result = await response.json();

      if (result.success) {
        alert("Dokumen berhasil diunggah!");
        router.push("/admin/document");
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
    <div className="max-w-xl mx-auto p-4">
      <Link 
        href="/admin/document" 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-6 text-sm font-bold uppercase tracking-tighter group"
      >
        <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
      </Link>
      
      <div className="bg-white border-2 border-slate-100 rounded-4xl p-8 md:p-10 shadow-sm">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <LuFileUp size={40} />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Upload Document</h2>
          <p className="text-slate-400 text-sm italic">Unggah CV, Ijazah, atau Sertifikat (Format PDF).</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Input Nama Dokumen */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nama Dokumen</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: CV_Felix_2024" 
              className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm focus:ring-2  focus:ring-indigo-100 outline-none font-medium text-slate-700" 
            />
          </div>

          {/* Pilih Kategori */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Kategori</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-700 appearance-none"
            >
              <option value="Resume">CV / Resume</option>
              <option value="Certificate">Sertifikat</option>
              <option value="Education">Ijazah / Dokumen Pendidikan</option>
              <option value="Other">Lainnya</option>
            </select>
          </div>
          
          {/* Area Dropzone/File Picker */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">File Dokumen (PDF)</label>
            {file ? (
              <div className="flex items-center justify-between bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                    <LuFileText size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-indigo-900 truncate max-w-50">{file.name}</p>
                    <p className="text-[10px] text-indigo-400 uppercase font-black">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                >
                  <LuX size={18} />
                </button>
              </div>
            ) : (
              <label className="block w-full py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-200 transition-all text-center group">
                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500 uppercase tracking-widest">Klik untuk pilih file PDF</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black hover:bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <LuRefreshCw className="animate-spin" />
            ) : (
              <LuShieldCheck size={20} />
            )}
            {loading ? "Uploading..." : "Simpan Dokumen"}
          </button>
        </form>
      </div>
    </div>
  );
}
