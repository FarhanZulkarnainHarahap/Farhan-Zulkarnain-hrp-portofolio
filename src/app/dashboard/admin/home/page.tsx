"use client";

import { useState, useEffect } from "react";
import { LuZap, LuFolder, LuFileText, LuHistory, LuLoader } from "react-icons/lu";

interface DashboardStats {
  skills: number;
  portfolios: number;
  documents: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({ skills: 0, portfolios: 0, documents: 0 });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      try {
        // Fetch ke tiga API Database kamu secara paralel
       const [resSkills, resPorto, resDocs] = await Promise.all([
      fetch(`${API_URL}/api/skills`),
      fetch(`${API_URL}/api/portofolios`),
      fetch(`${API_URL}/api/documents/all`)
    ]);
        const dataSkills = await resSkills.json();
        const dataPorto = await resPorto.json();
        const dataDocs = await resDocs.json();

        // Fungsi pembantu untuk menghitung data baik dalam format array atau object
        const getCount = (res: any) => Array.isArray(res) ? res.length : (res.data?.length || 0);

        setStats({
          skills: getCount(dataSkills),
          portfolios: getCount(dataPorto),
          documents: getCount(dataDocs),
        });
      } catch (error) {
        console.error("Gagal sinkronisasi database:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    { name: "Total Skills", count: stats.skills, icon: <LuZap size={24} />, color: "bg-amber-50 text-amber-600 border-amber-100" },
    { name: "Portfolios", count: stats.portfolios, icon: <LuFolder size={24} />, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { name: "Documents", count: stats.documents, icon: <LuFileText size={24} />, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  ];

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-slate-50/50">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
          Admin <span className="text-indigo-600">Console.</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Real-time Cloud Database Synchronized</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statsCards.map((item) => (
          <div key={item.name} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110 ${item.color}`}>
              {loading ? <LuLoader className="animate-spin" size={20} /> : item.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">{item.name}</p>
              <p className="text-3xl font-black text-slate-800 tracking-tighter">
                {loading ? "---" : item.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dynamic Log Area */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <LuHistory className="text-indigo-500" /> Database Integrity
          </h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-xs text-slate-500 font-bold tracking-tight">
                Successfully indexed <span className="text-slate-800">{stats.documents} certified documents</span> from server.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-xs text-slate-500 font-bold tracking-tight">
                Live monitoring: <span className="text-slate-800">{stats.portfolios} project assets</span> are online.
              </p>
            </div>
          </div>
        </div>

        {/* Purple Accent Card */}
        <div className="bg-indigo-600 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200 flex flex-col justify-between">
           <div className="relative z-10">
              <h3 className="text-2xl font-black italic tracking-tighter mb-4 leading-none">Security Verified.</h3>
              <p className="text-indigo-100 text-sm opacity-70 leading-relaxed font-medium">Data yang Anda kelola akan langsung dipublikasikan secara aman ke portfolio utama melalui koneksi SSL terenkripsi.</p>
           </div>
           <button className="relative z-10 w-fit bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-8 hover:bg-indigo-50 transition-colors">
              Refresh System
           </button>
           <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
