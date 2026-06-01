"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  LuArrowLeft, 
  LuSave, 
  LuType, 
  LuLayers, 
  LuLoader, 
  LuShieldCheck,
  LuCircleCheck,
  LuArrowRight,
  LuX
} from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";

// IMPORT SEMUA LIBRARY ICON
import * as LuIcons from "react-icons/lu";
import * as FaIcons from "react-icons/fa6";
import * as SiIcons from "react-icons/si";
import * as DiIcons from "react-icons/di";
import type { IconType } from "react-icons";

export default function ManageSkillPage() {
  const router = useRouter();
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState("FRONTEND");
  const [loading, setLoading] = useState(false);
  const [createdSkill, setCreatedSkill] = useState<{ name: string; category: string } | null>(null);

  // Gabungkan semua library icons dalam satu objek (Memoized agar enteng)
  const allIcons: Record<string, IconType> = useMemo(() => ({ ...LuIcons, ...FaIcons, ...SiIcons, ...DiIcons }), []);

  // --- LOGIKA AUTO DETECT ICON ---
  const detectedIcon = useMemo(() => {
    if (!skillName) return "";

    // 1. Normalisasi nama (Next.js -> nextdotjs, Node.js -> nodedotjs)
    const normalized = skillName.toLowerCase()
      .replace(/\.js/g, 'dotjs')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');

    // 2. Cari di library dengan prefix Si, Fa, atau Lu
    const foundKey = Object.keys(allIcons).find((key) => {
      const k = key.toLowerCase();
      return k === `si${normalized}` || k === `fa${normalized}` || k === `lu${normalized}` || k === normalized || k === `di${normalized}`;
    });

    return foundKey || "";
  }, [skillName, allIcons]);

  useEffect(() => {
    if (!createdSkill) return;

    const closeModal = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCreatedSkill(null);
    };

    window.addEventListener("keydown", closeModal);
    return () => window.removeEventListener("keydown", closeModal);
  }, [createdSkill]);

  const goToSkillList = () => {
    router.push("/admin/skill");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName) return alert("Isi nama skill!");

    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const response = await fetch(`${API_URL}/api/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          name: skillName, 
          iconName: detectedIcon || skillName, // Kirim hasil deteksi atau nama aslinya
          category: category 
        }),
      });

      const result = await response.json();
      if (result.success) {
        setCreatedSkill({ name: skillName, category });
      } else {
        alert("Gagal: " + result.error);
      }
    } catch {
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-slate-50/30">
      {createdSkill && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skill-success-title"
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-4xl border border-emerald-100 bg-white p-8 text-center shadow-2xl shadow-emerald-950/20 md:p-10">
            <button
              type="button"
              onClick={() => setCreatedSkill(null)}
              aria-label="Tutup modal"
              className="absolute right-5 top-5 rounded-full p-2 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <LuX size={18} />
            </button>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-500 shadow-inner">
              <LuCircleCheck size={42} />
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500">
              Publish Successful
            </p>
            <h2 id="skill-success-title" className="mt-3 text-2xl font-black uppercase tracking-tight text-slate-800">
              Skill Berhasil Dibuat
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              <span className="font-bold text-slate-700">{createdSkill.name}</span> berhasil ditambahkan ke kategori{" "}
              <span className="font-bold text-indigo-600">{createdSkill.category}</span>.
            </p>

            <button
              type="button"
              onClick={goToSkillList}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              Lihat Daftar Skill
              <LuArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mb-10 flex items-center justify-between">
        <Link href="/admin/skill" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-bold text-xs uppercase tracking-tighter group">
          <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Add Skill</h1>
          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.2em] mt-1">Auto Icon Detection</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-2xl shadow-indigo-100/50">
        
        {/* Preview Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-32 h-32 bg-slate-50 rounded-[40px] shadow-inner flex items-center justify-center border border-white transition-all duration-500 transform hover:scale-110">
            {detectedIcon && allIcons[detectedIcon] ? (
              // Ambil komponen dari library berdasarkan nama yang terdeteksi
              (() => {
                const Icon = allIcons[detectedIcon];
                return <Icon className="text-indigo-600" size={54} />;
              })()
            ) : (
              <LuShieldCheck className="text-slate-200" size={54} />
            )}
          </div>
          <div className="mt-5 px-5 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-600">
               {detectedIcon ? `Detected: ${detectedIcon}` : "Waiting for Input..."}
             </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Input Tunggal */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
              <LuType size={14} className="text-indigo-500" /> Nama Skill
            </label>
            <input 
              type="text" 
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="Contoh: Next.js, Laravel, Docker..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 text-lg shadow-sm" 
            />
          </div>

          {/* Kategori Enum */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
              <LuLayers size={14} className="text-indigo-500" /> Pilih Kategori
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["FRONTEND", "BACKEND", "TOOLS", "OTHERS"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all border ${
                    category === cat 
                    ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                    : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Button */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-indigo-100 transition-all active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <LuLoader className="animate-spin" size={20} /> : <LuSave size={20} />}
              {loading ? "MENYIMPAN..." : "PUBLISH SKILL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
