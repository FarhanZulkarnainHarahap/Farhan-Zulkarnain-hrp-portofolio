"use client";
import { motion } from "framer-motion";
import { FaArrowRight, FaTerminal, FaLayerGroup, FaLightbulb } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
  return (
    <section id="about" className="min-h-screen lg:h-screen w-full bg-[#020203] flex items-center justify-center snap-start overflow-hidden relative py-20 lg:py-0">
      
      {/* 1. DEKORASI BERGERAK */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-80 h-80 md:w-125 md:h-125 bg-blue-600/10 rounded-full blur-[100px] md:blur-[120px]" 
        />
      </div>

      {/* 2. BACKGROUND BIG TEXT - Ukuran lebih kecil di mobile agar tidak berantakan */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-20 lg:opacity-100">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          <h2 className="text-[35vw] lg:text-[25vw] font-black text-white/5 leading-none tracking-tighter uppercase pr-20">
            CREATIVE CREATIVE CREATIVE
          </h2>
        </motion.div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 lg:gap-20">
          
          {/* SISI KIRI: Visual Element - Sekarang muncul di Mobile dengan ukuran menyesuaikan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative group shrink-0"
          >
            <div className="relative w-48 h-60 md:w-64 md:h-80 lg:w-80 lg:h-112.5 overflow-hidden rounded-sm border border-white/5 z-10 bg-[#020203] shadow-2xl">
              <Image 
                src="https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg" 
                alt="Farhan Workspace" 
                fill 
                sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 320px"
                className="object-cover transition-all duration-1000 scale-110 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Dekorasi Garis (Siku) - Disesuaikan ukurannya */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-12 h-12 md:w-20 md:h-20 border-l-2 border-b-2 border-blue-500/50 z-0" 
            />
          </motion.div>

          {/* SISI KANAN: Konten Utama */}
          <div className="flex-1 space-y-8 md:space-y-10 text-center lg:text-left z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center lg:justify-start gap-4 text-blue-500 font-bold text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase">
                <motion.span 
                  animate={{ width: [0, 32, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="h-px bg-blue-500 hidden md:block"
                ></motion.span> 
                About Me
              </div>
              <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight uppercase">
                CODE IS MY <br />
                <span className="italic font-serif font-light text-blue-400">Language.</span>
              </h3>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
            >
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                Satu tahun berkarier sebagai arsitek digital telah membentuk standar tinggi saya terhadap presisi visual dan stabilitas backend. Saya berkomitmen pada pembuatan produk digital yang optimal secara performa.
              </p>
              
              <div className="flex flex-col gap-4 items-center lg:items-start">
                {[
                  { icon: FaTerminal, text: "Fullstack Dev" },
                  { icon: FaLayerGroup, text: "System Architecture" },
                  { icon: FaLightbulb, text: "UI/UX Strategy" }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-default"
                  >
                    <item.icon className="text-blue-500" size={14} /> 
                    <span className="tracking-[0.2em] uppercase font-bold text-[9px] md:text-[10px]">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-4 flex justify-center lg:justify-start"
            >
              <Link href="/documents" target="_blank" className="group flex items-center gap-4 text-white hover:text-blue-400 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Lihat Resume Lengkap</span>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                  <FaArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform text-sm" />
                </div>
              </Link>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Ornament Number - Ukuran lebih kecil di mobile */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 opacity-5 text-[15vw] lg:text-[10vw] font-black text-white italic select-none pointer-events-none">
        01
      </div>
    </section>
  );
}
