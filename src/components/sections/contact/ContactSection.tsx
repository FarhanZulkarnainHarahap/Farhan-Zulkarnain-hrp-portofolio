"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import { IoSendSharp } from "react-icons/io5";
import { LuLoader } from "react-icons/lu";
import { apiFetch } from "@/lib/api-client";
import { MaskReveal } from "@/components/motion/MaskReveal";

const contactLinks = [
  { name: "Email", href: "mailto:farhanzulkarnaenhrp@gmail.com", icon: FaEnvelope },
  { name: "WhatsApp", href: "https://wa.me/6281958169283", icon: FaWhatsapp },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/farhan-zulkarnain-71801a347", icon: FaLinkedin },
  { name: "GitHub", href: "https://github.com/FarhanZulkarnainHarahap", icon: FaGithub },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; msg: string }>({
    type: null,
    msg: "",
  });

  const activity = useMemo(() => {
    const filled = Object.values(formData).filter((value) => value.trim()).length;
    return Math.min(1, filled / 4);
  }, [formData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setStatus({ type: null, msg: "" });

    const messageWithSubject = formData.subject.trim()
      ? `Subject: ${formData.subject.trim()}\n\n${formData.message.trim()}`
      : formData.message.trim();

    try {
      const response = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: messageWithSubject,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus({ type: "success", msg: "Message sent. I will get back to you soon." });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({ type: "error", msg: result.message || "Failed to send message." });
      }
    } catch {
      setStatus({ type: "error", msg: "Server connection error. Please try email or WhatsApp." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">
            Contact
          </p>
          <h2 className="mt-6 text-[clamp(2.8rem,7vw,6.4rem)] font-black uppercase leading-[0.9] tracking-normal text-white">
            <MaskReveal lines={["Send a", "signal."]} />
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Have a role, freelance project, or collaboration in mind? Send the essentials
            and I&apos;ll respond with a clear next step.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {contactLinks.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={name}
                data-cursor-label={name.toUpperCase()}
                className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-2xl border border-white/9 bg-white/[0.035] text-slate-300 transition-colors hover:border-blue-300/50 hover:bg-blue-500/10 hover:text-white"
              >
                <Icon size={22} />
                <span className="text-[10px] font-black uppercase tracking-[0.16em]">{name}</span>
              </a>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-white/9 bg-white/[0.035] p-5">
            <svg viewBox="0 0 520 120" className="h-24 w-full" aria-hidden="true">
              <motion.path
                d={
                  status.type === "success"
                    ? "M20 68 C110 22, 190 92, 270 60 L322 88 L420 28"
                    : "M20 68 C110 22, 190 92, 270 60 C350 28, 420 68, 500 42"
                }
                fill="none"
                stroke={status.type === "error" ? "#f87171" : "#60a5fa"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{
                  pathLength: status.type === "success" ? 1 : 0.35 + activity * 0.65,
                  opacity: 0.45 + activity * 0.45,
                }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
              <circle cx="500" cy="42" r="5" fill="#93c5fd" opacity={0.78} />
            </svg>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {status.type === "success"
                ? "Signal received"
                : status.type === "error"
                  ? "Signal interrupted"
                  : "Signal strength follows your message"}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-blue-300/14 bg-[#050911]/76 p-4 shadow-[0_28px_95px_rgba(0,0,0,0.32)] sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Name
              </span>
              <input
                type="text"
                name="name"
                required
                minLength={2}
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-300/60"
                placeholder="Your name"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Email
              </span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-300/60"
                placeholder="email@example.com"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Subject
            </span>
            <input
              type="text"
              name="subject"
              required
              minLength={3}
              value={formData.subject}
              onChange={handleChange}
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-300/60"
              placeholder="Project, role, or collaboration"
            />
          </label>

          <label className="mt-4 block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Message
            </span>
            <textarea
              rows={6}
              name="message"
              required
              minLength={10}
              value={formData.message}
              onChange={handleChange}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-7 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-300/60"
              placeholder="Tell me what you want to build..."
            />
          </label>

          {status.msg && (
            <div
              role="status"
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${
                status.type === "success"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  : "border-red-400/20 bg-red-400/10 text-red-200"
              }`}
            >
              {status.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-cursor-label="SEND"
            className="mt-5 flex min-h-13 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_18px_45px_rgba(37,99,235,0.28)] transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading ? (
              <>
                Sending
                <LuLoader className="animate-spin" size={15} />
              </>
            ) : (
              <>
                Send Message
                <IoSendSharp size={15} />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
