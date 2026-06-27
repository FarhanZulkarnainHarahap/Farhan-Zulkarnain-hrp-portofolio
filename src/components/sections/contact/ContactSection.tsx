"use client";

import { useState } from "react";
import { FaLinkedin, FaInstagram, FaGithub, FaEnvelope, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { IoSendSharp } from "react-icons/io5";
import { LuLoader } from "react-icons/lu";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT;
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: "" });

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ type: "success", msg: "Message sent successfully! I will get back to you soon." });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus({ type: "error", msg: result.message || "Failed to send message." });
      }
    } catch {
      setStatus({ type: "error", msg: "Server connection error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-5xl px-6 py-12 lg:px-8 lg:py-8">
      <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-10">
        
        {/* Left Side: Contact Form */}
        <div
          className="space-y-8 lg:space-y-6"
        >
          <div className="space-y-4">
            <h4 className="text-blue-500 font-bold text-[10px] tracking-[0.5em] uppercase">Connect</h4>
            <h2 className="text-4xl font-black uppercase leading-none tracking-tighter text-white md:text-5xl lg:text-4xl">
              Get in <span className="text-blue-500 italic">Touch.</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-md">
              Have a great idea? Let&apos;s discuss it and build something meaningful together.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-1">Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name" 
                  className="w-full rounded-xl border border-white/10 bg-white/3 p-4 text-sm text-white transition-all placeholder:text-gray-700 focus:border-blue-500/50 focus:outline-none lg:p-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com" 
                  className="w-full rounded-xl border border-white/10 bg-white/3 p-4 text-sm text-white transition-all placeholder:text-gray-700 focus:border-blue-500/50 focus:outline-none lg:p-3"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-1">Message</label>
              <textarea 
                rows={3}
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="How can I help you?" 
                className="w-full resize-none rounded-xl border border-white/10 bg-white/3 p-4 text-sm text-white transition-all placeholder:text-gray-700 focus:border-blue-500/50 focus:outline-none lg:p-3"
              />
            </div>
            
            {/* Status Notification */}
            {status.msg && (
              <div className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest ${status.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                {status.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 lg:py-3"
            >
              {loading ? (
                <>SENDING... <LuLoader className="animate-spin" size={14} /></>
              ) : (
                <>SEND MESSAGE <IoSendSharp size={14} /></>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Details & Social Cards */}
        <div
          className="grid grid-cols-1 gap-6 lg:gap-4"
        >
          <div className="space-y-6 rounded-3xl border border-white/5 bg-linear-to-br from-white/2 to-transparent p-5 sm:p-8 lg:p-6">
             <div className="flex items-center gap-4 sm:gap-6 group">
                <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                  <FaEnvelope size={20} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Email Me</p>
                  <a
                    href="mailto:farhanzulkarnaenhrp@gmail.com"
                    className="block max-w-full break-all text-[11px] leading-relaxed font-medium italic text-white transition-colors hover:text-blue-400 md:text-sm"
                  >
                    farhanzulkarnaenhrp@gmail.com
                  </a>
                </div>
             </div>

             <div className="flex items-center gap-4 sm:gap-6 group border-t border-white/5 pt-6">
                <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                  <FaPhoneAlt size={18} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Call / WA</p>
                  <p className="text-white text-sm font-medium break-words">+62 819 5816 9283</p>
                </div>
             </div>
          </div>

          {/* Social Media Grid */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: "LinkedIn", icon: FaLinkedin, link: "https://www.linkedin.com/in/farhan-zulkarnain-71801a347?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", color: "hover:bg-blue-600" },
              { name: "Instagram", icon: FaInstagram, link: "https://www.instagram.com/farhan.nexxus?igsh=bmw4cmI4djQzeTN1", color: "hover:bg-pink-600" },
              { name: "GitHub", icon: FaGithub, link: "https://github.com/FarhanZulkarnainHarahap", color: "hover:bg-white hover:text-black" },
              { name: "WhatsApp", icon: FaWhatsapp, link: "https://wa.me/6281958169283", color: "hover:bg-green-600" }
            ].map((social, i) => (
              <a
                key={i}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className={`aspect-square flex items-center justify-center rounded-2xl border border-white/10 bg-white/2 text-gray-400 transition-all duration-500 ${social.color}`}
              >
                <social.icon size={22} />
              </a>
            ))}
          </div>

          <div className="p-6 rounded-2xl border border-dashed border-white/10 flex items-center justify-center gap-4 opacity-50">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Open for new opportunities</span>
          </div>
        </div>
      </div>
    </section>
  );
}
