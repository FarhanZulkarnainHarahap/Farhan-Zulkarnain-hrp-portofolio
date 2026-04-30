"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaInstagram, FaGithub, FaEnvelope, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { IoSendSharp } from "react-icons/io5";
import { LuLoader } from "react-icons/lu";

export default function ContactSection() {
  // State untuk form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT;
  console.log(API_URL)
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
        setStatus({ type: "success", msg: "Pesan berhasil dikirim! Saya akan segera menghubungi Anda." });
        setFormData({ name: "", email: "", message: "" }); // Reset form
      } else {
        setStatus({ type: "error", msg: result.message || "Gagal mengirim pesan." });
      }
    } catch (error) {
      setStatus({ type: "error", msg: "Kesalahan koneksi ke server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full max-w-6xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* SISI KIRI: FORM KONTAK */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h4 className="text-blue-500 font-bold text-[10px] tracking-[0.5em] uppercase">Connect</h4>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
              Get in <span className="text-blue-500 italic">Touch.</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-md">
              Punya ide luar biasa? Mari kita diskusikan dan bangun sesuatu yang bermakna bersama.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full bg-white/3 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700" 
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
                  className="w-full bg-white/3 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-1">Message</label>
              <textarea 
                rows={4} 
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="How can I help you?" 
                className="w-full bg-white/3 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700 resize-none" 
              />
            </div>
            
            {/* Notifikasi Status */}
            {status.msg && (
              <div className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest ${status.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                {status.msg}
              </div>
            )}

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>SENDING... <LuLoader className="animate-spin" size={14} /></>
              ) : (
                <>SEND MESSAGE <IoSendSharp size={14} /></>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* SISI KANAN: INFO DETAIL & SOCIAL CARDS */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 gap-6"
        >
          <div className="p-8 space-y-6 border border-white/5 bg-linear-to-br from-white/2 to-transparent rounded-3xl">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                  <FaEnvelope size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Email Me</p>
                  <p className="text-white text-sm font-medium italic">farhanzulkarnaenhrp@gmail.com</p>
                </div>
             </div>

             <div className="flex items-center gap-6 group border-t border-white/5 pt-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                  <FaPhoneAlt size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Call / WA</p>
                  <p className="text-white text-sm font-medium">+62 819 5816 9283</p>
                </div>
             </div>
          </div>

          {/* Social Media Grid */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: FaLinkedin, link: "https://linkedin.com", color: "hover:bg-blue-600" },
              { icon: FaInstagram, link: "https://instagram.com", color: "hover:bg-pink-600" },
              { icon: FaGithub, link: "https://github.com", color: "hover:bg-white hover:text-black" },
              { icon: FaWhatsapp, link: "https://wa.me", color: "hover:bg-green-600" }
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5 }}
                className={`aspect-square flex items-center justify-center rounded-2xl border border-white/10 bg-white/2 text-gray-400 transition-all duration-500 ${social.color}`}
              >
                <social.icon size={22} />
              </motion.a>
            ))}
          </div>

          <div className="p-6 rounded-2xl border border-dashed border-white/10 flex items-center justify-center gap-4 opacity-50">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Open for new opportunities</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
