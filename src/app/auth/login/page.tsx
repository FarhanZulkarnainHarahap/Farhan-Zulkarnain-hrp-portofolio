"use client";

import { useState } from "react";
import { LuMail, LuLock, LuEye, LuEyeOff, LuRefreshCw, LuArrowRight } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include", // WAJIB: Agar cookie accessToken tersimpan di browser
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/home");
        router.refresh();
      } else {
        alert(data.message || "Login gagal");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
      
      <div className="w-full max-w-100 z-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 rotate-3">
             <span className="text-white text-2xl font-black italic">N</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Access System</h1>
          <p className="text-zinc-500 text-[10px] mt-2 uppercase tracking-[0.3em] font-bold">Nexxus Portfolio Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="email"
              placeholder="Email Address"
              required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
          </div>

          <div className="relative group">
            <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-12 py-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
            >
              {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
            </button>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white hover:bg-zinc-200 text-black py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <LuRefreshCw className="animate-spin" /> : <>Login <LuArrowRight size={20} /></>}
          </button>
        </form>

        <p className="text-center mt-8 text-zinc-500 text-xs font-bold uppercase tracking-widest">
          New here? 
          <Link href="/auth/register" className="text-indigo-500 ml-2 hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
