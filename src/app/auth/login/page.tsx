"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuRefreshCw,
  LuArrowRight,
} from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        router.push(
          data.user?.role === "USER" ? "/dashboard/user" : "/admin/home",
        );
        router.refresh();
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--primary)]/10 blur-[120px]"></div>

      <div className="w-full max-w-100 z-10">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 h-14 w-14 overflow-hidden rounded-lg border border-blue-400/30 bg-transparent shadow-2xl shadow-blue-500/20">
            <Image
              src="/fz-logo.png"
              alt="FZ Dev"
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Access System
          </h1>
          <p className="text-[var(--muted)] text-[10px] mt-2 uppercase tracking-[0.3em] font-bold">
            Kinetic Systems / Admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="form-message error">
              {error}
            </p>
          )}
          <div className="relative group">
            <LuMail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--secondary)] transition-colors"
              size={18}
            />
            <input
              type="email"
              aria-label="Email address"
              autoComplete="email"
              placeholder="Email Address"
              required
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-lg outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
          </div>

          <div className="relative group">
            <LuLock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--secondary)] transition-colors"
              size={18}
            />
            <input
              type={showPassword ? "text" : "password"}
              aria-label="Password"
              autoComplete="current-password"
              placeholder="Password"
              required
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white pl-12 pr-12 py-4 rounded-lg outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white transition-colors"
            >
              {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[var(--primary)] hover:bg-blue-500 text-[var(--text)] py-4 rounded-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <LuRefreshCw className="animate-spin" />
            ) : (
              <>
                Login <LuArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-[var(--muted)] text-xs font-bold uppercase tracking-widest">
          New here?
          <Link
            href="/auth/register"
            className="text-[var(--secondary)] ml-2 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
