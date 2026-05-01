"use client";

import { useState, useEffect, useMemo } from "react";
import { LuPlus, LuTrash2, LuShieldCheck, LuSearch, LuLoader } from "react-icons/lu";
import Link from "next/link";

// Import library icon
import * as Lu from "react-icons/lu";
import * as Fa from "react-icons/fa";
import * as Si from "react-icons/si";
import * as Di from "react-icons/di";

interface Skill {
  id: number;
  name: string;
  iconName: string; 
}

const DynamicIcon = ({ name }: { name: string }) => {
  const allIcons: any = { ...Lu, ...Fa, ...Si, ...Di };
  
  // 1. Cek langsung jika namanya sudah pas (misal: "SiNextdotjs")
  if (allIcons[name]) {
    const Icon = allIcons[name];
    return <Icon className="w-full h-full" />;
  }

  // 2. Normalisasi nama untuk pencarian cerdas (untuk menangani "Next.js", "Node.js", dsb)
  const normalizedSearch = name.toLowerCase()
    .replace(/\.js/g, 'dotjs')     // Mengubah .js menjadi dotjs
    .replace(/\s+/g, '')           // Menghapus spasi
    .replace(/[^a-z0-9]/g, '');    // Menghapus simbol lain

  const foundKey = Object.keys(allIcons).find((key) => {
    const k = key.toLowerCase();
    return (
      k === `si${normalizedSearch}` || 
      k === `fa${normalizedSearch}` || 
      k === `lu${normalizedSearch}` || 
      k === `di${normalizedSearch}` || 
      k === normalizedSearch
    );
  });

  if (foundKey) {
    const Icon = allIcons[foundKey];
    return <Icon className="w-full h-full" />;
  }

  // Fallback jika tidak ditemukan
  return <Lu.LuShieldCheck className="w-full h-full opacity-20" />;
};
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export default function SkillPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch(`${API_URL}/api/skills`, {
        cache: 'no-store',
        credentials: "include"
      });;
      const result = await response.json();
      const data = Array.isArray(result) ? result : result.data;
      if (Array.isArray(data)) setSkills(data);
    } catch (error) {
      console.error("Gagal load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus skill ${name}?`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`${API_URL}/api/skills/${id}`, {
        method: "DELETE",
        credentials: "include", 
      });

      if (response.ok) {
        setSkills((prev) => prev.filter((skill) => skill.id !== id));
      } else {
        alert("Gagal menghapus skill.");
      }
    } catch (error) {
      console.error("Error delete:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [skills, searchQuery]);

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Lu.LuShieldCheck className="text-indigo-600" />
            Manage Skills
          </h2>
          <p className="text-slate-500 text-sm mt-1">Daftar keahlian teknis Anda.</p>
        </div>
        
        <Link 
          href="/admin/skill/manage" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <LuPlus size={18} />
          Tambah Skill
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-8 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <LuSearch className="text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Cari skill (contoh: Next.js)..." 
          className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-slate-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-52 bg-white rounded-3xl border border-slate-100 animate-pulse" />
          ))
        ) : (
          <>
            {filteredSkills.map((skill) => (
              <div 
                key={skill.id} 
                className={`group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300 relative overflow-hidden ${deletingId === skill.id ? "opacity-50 grayscale" : ""}`}
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col items-center text-center relative z-10">
                  {/* Container Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4 group-hover:scale-110 group-hover:text-indigo-600 transition-all duration-300 text-slate-600 flex items-center justify-center">
                    <DynamicIcon name={skill.iconName || skill.name} />
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-lg">{skill.name}</h3>
                  <div className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    Verified Skill
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-50 w-full flex justify-center">
                    <button 
                      onClick={() => handleDelete(skill.id, skill.name)}
                      disabled={deletingId === skill.id}
                      className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-xs font-bold uppercase transition-colors disabled:cursor-not-allowed"
                    >
                      {deletingId === skill.id ? (
                        <LuLoader size={14} className="animate-spin" />
                      ) : (
                        <LuTrash2 size={14} />
                      )}
                      {deletingId === skill.id ? "Deleting..." : "Delete Skill"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Button Card */}
            <Link 
              href="/admin/skill/manage"
              className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-indigo-300 transition-all cursor-pointer group min-h-52.5"
            >
              <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center mb-3 group-hover:border-indigo-400 group-hover:text-indigo-500 transition-colors">
                <LuPlus size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">New Skill</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
