"use client";

import { useState } from "react";
import { LuLoader, LuSend } from "react-icons/lu";
import { apiFetch } from "@/lib/api-client";

type Status = { type: "success" | "error" | null; message: string };

export default function PublicContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string; error?: unknown };

      if (!response.ok || !payload.success) {
        setStatus({
          type: "error",
          message: payload.message || "Message could not be sent right now.",
        });
        return;
      }

      setForm({ name: "", email: "", message: "" });
      setStatus({ type: "success", message: payload.message || "Message sent successfully." });
    } catch {
      setStatus({ type: "error", message: "Message could not be sent. Please retry in a moment." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" aria-describedby="contact-status">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
          Name
          <input
            name="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
            minLength={2}
            autoComplete="name"
            className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium normal-case tracking-normal text-white outline-none transition focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"
          />
        </label>
        <label className="grid gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
          Email
          <input
            name="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
            type="email"
            autoComplete="email"
            className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium normal-case tracking-normal text-white outline-none transition focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"
          />
        </label>
      </div>
      <label className="grid gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
        Message
        <textarea
          name="message"
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          required
          minLength={8}
          rows={5}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium normal-case leading-6 tracking-normal text-white outline-none transition focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"
        />
      </label>
      <div id="contact-status" role="status" aria-live="polite" className="min-h-6">
        {status.message ? (
          <p
            className={`rounded-2xl border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
                : "border-rose-300/25 bg-rose-400/10 text-rose-100"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-13 items-center justify-center gap-3 rounded-2xl bg-cyan-200 px-6 text-[11px] font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-65"
      >
        {loading ? <LuLoader className="h-4 w-4 animate-spin" /> : <LuSend className="h-4 w-4" />}
        Send Message
      </button>
    </form>
  );
}
