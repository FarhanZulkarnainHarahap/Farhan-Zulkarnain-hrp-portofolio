"use client";

import { useState, useEffect } from "react";
import { LuZap, LuFolder, LuFileText, LuHistory, LuLoader, LuRefreshCw } from "react-icons/lu";

// 1. Definisikan Interface untuk Type Safety
interface DashboardStats {
  skills: number;
  portfolios: number;
  documents: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({ 
    skills: 0, 
    portfolios: 0, 
    documents: 0 
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 2. Fungsi Fetch Data dengan Credentials
  const fetchDashboardData = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    // Konfigurasi fetch agar menyertakan cookie (AccessToken)
    const requestOptions: RequestInit = {
      method: "GET",
      credentials: "include", // CRITICAL: Agar cookie terkirim ke backend
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      setRefreshing(true);
      
      const [resSkills, resPorto, resDocs] = await Promise.all([
        fetch(`${API_URL}/api/skills`, requestOptions),
        fetch(`${API_URL}/api/portofolios`, requestOptions),
        fetch(`${API_URL}/api/documents/all`, requestOptions)
      ]);

      // Helper untuk handle response dan menghitung jumlah data
      const parseData = async (res: Response) => {
        if (!res.ok) throw new Error("Server Error");
        const json = await res.json();
        // Cek apakah data berbentuk array langsung atau didalam object .data
        return Array.isArray(json) ? json.length : (json.data?.length || 0);
      };

      setStats({
        skills: await parseData(resSkills),
        portfolios: await parseData(resPorto),
        documents: await parseData(resDocs),
      });

    } catch (error) {
      console.error("Gagal sinkronisasi database:", error);
      // Opsional: Redirect ke login jika error 401 (Unauthorized) terdeteksi di sini
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 3. Konfigurasi Tampilan Card
  const statsCards = [
    { 
      name: "Total Skills", 
      count: stats.skills, 
      icon: <LuZap size={24} />, 
      color: "bg-amber-50 text-amber-600 border-amber-100" 
    },
    { 
      name: "Portfolios", 
      count: stats.portfolios, 
      icon: <LuFolder size={24} />, 
      color: "bg-blue-50 text-blue-600 border-blue-100" 
    },
    { 
      name: "Documents", 
      count: stats.documents, 
      icon: <LuFileText size={24} />, 
      color: "bg-emerald-50 text-emerald-600 border-emerald-100" 
    },
  ];

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
            Admin <span className="text-indigo-600">Console.</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Real-time Cloud Database Synchronized
          </p>
        </div>
        {refreshing && <LuLoader className="animate-spin text-indigo-600" size={20} />}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statsCards.map((item) => (
          <div 
            key={item.name} 
            className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all duration-300"
          >
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
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <LuHistory className="text-indigo-500" /> Database Integrity
          </h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${stats.documents > 0 ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`} />
              <p className="text-xs text-slate-500 font-bold tracking-tight">
                Successfully indexed <span className="text-slate-800">{stats.documents} certified documents</span> from server.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${stats.portfolios > 0 ? 'bg-indigo-500' : 'bg-slate-300'} animate-pulse`} />
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
              <p className="text-indigo-100 text-sm opacity-70 leading-relaxed font-medium">
                Data yang Anda kelola akan langsung dipublikasikan secara aman ke portfolio utama melalui koneksi SSL terenkripsi.
              </p>
           </div>
           
           <button 
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="relative z-10 w-fit bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-8 hover:bg-indigo-50 transition-colors flex items-center gap-2 disabled:opacity-50"
           >
              {refreshing ? <LuLoader className="animate-spin" /> : <LuRefreshCw />}
              Refresh System
           </button>

           {/* Decorative Background Circle */}
           <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
