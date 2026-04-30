"use client";

import { useState } from "react";
import { LuUser, LuMail, LuLock, LuRefreshCw, LuCircleCheck, LuArrowRight } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registrasi Berhasil!");
        router.push("/auth/login");
      } else {
        alert(data.error || "Gagal Mendaftar");
      }
    } catch (err) {
      alert("Masalah koneksi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[100px]"></div>

      <div className="w-full max-w-100 z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Register</h1>
          <p className="text-zinc-500 text-[10px] font-bold mt-2 tracking-[0.4em] uppercase">Join Nexxus Project</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-zinc-900/30 p-8 rounded-4xl border border-zinc-800 space-y-6 shadow-inner">
            <div className="relative group">
              <LuUser className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" />
              <input 
                type="text"
                placeholder="Full Name"
                required
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-transparent border-b border-zinc-800 text-white pl-8 py-3 outline-none focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>

            <div className="relative group">
              <LuMail className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" />
              <input 
                type="email"
                placeholder="Email Address"
                required
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-transparent border-b border-zinc-800 text-white pl-8 py-3 outline-none focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>

            <div className="relative group">
              <LuLock className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" />
              <input 
                type="password"
                placeholder="Password"
                required
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-transparent border-b border-zinc-800 text-white pl-8 py-3 outline-none focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-[20px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
          >
            {loading ? <LuRefreshCw className="animate-spin" /> : <>Create Account <LuCircleCheck /></>}
          </button>
        </form>

        <div className="mt-10 text-center">
           <Link href="/auth/login" className="text-zinc-500 hover:text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all group">
             Already have an account? <span className="text-white group-hover:underline">Login</span> <LuArrowRight />
           </Link>
        </div>
      </div>
    </div>
  );
}
