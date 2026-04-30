"use client";
import { motion } from "framer-motion";
import { FaArrowRight, FaTerminal, FaLayerGroup, FaLightbulb } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
  return (
    <section id="about" className="h-screen w-full bg-[#020203] flex items-center justify-center snap-start overflow-hidden relative">
      
      {/* 1. DEKORASI BERGERAK: Ambient Glow & Floating Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow Biru Berdenyut */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-125 h-125 bg-blue-600/10 rounded-full blur-[120px]" 
        />

        {/* Bentuk Geometris Melayang */}
        <motion.div 
          animate={{ y: [0, -30, 0], rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-10 w-4 h-4 border border-blue-500/30 rotate-45 hidden md:block" 
        />
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-blue-400/20 rounded-full hidden md:block" 
        />
      </div>

      {/* 2. DEKORASI BERGERAK: Background Big Text (Marquee Effect) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          <h2 className="text-[25vw] font-black text-white/2 leading-none tracking-tighter uppercase pr-20">
            CREATIVE CREATIVE CREATIVE
          </h2>
        </motion.div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 z-10">
        <div className="flex flex-col md:flex-row items-end gap-12 lg:gap-20">
          
          {/* SISI KIRI: Visual Element with Moving Border */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative group shrink-0 hidden md:block"
          >
            <div className="relative w-64 h-80 md:w-80 md:h-112.5 overflow-hidden rounded-sm border border-white/5 z-10 bg-[#020203]">
  <Image 
    src="https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg" 
    alt="Farhan Workspace" 
    fill 
    // Tambahkan properti ini
    sizes="(max-width: 768px) 256px, 320px"
    className="object-cover transition-all duration-1000 scale-110 group-hover:scale-100"
  />
  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
</div>

            {/* Dekorasi Garis Bergerak (Siku) */}
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5] 
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-4 -left-4 w-20 h-20 border-l-2 border-b-2 border-blue-500/50 z-0" 
            />
          </motion.div>

          {/* SISI KANAN: Konten Utama */}
          <div className="flex-1 space-y-10 pb-6 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 text-blue-500 font-bold text-[10px] tracking-[0.5em] uppercase">
                <motion.span 
                  animate={{ width: [0, 32, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="h-px bg-blue-500"
                ></motion.span> 
                About Me
              </div>
              <h3 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight uppercase">
                CODE IS MY <br />
                <span className="italic font-serif font-light text-blue-400">Language.</span>
              </h3>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                Saya adalah arsitek digital yang fokus pada pembuatan antarmuka intuitif dan performa backend solid. 4 tahun perjalanan ini membentuk presisi visual saya.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: FaTerminal, text: "Fullstack Dev" },
                  { icon: FaLayerGroup, text: "System Architecture" },
                  { icon: FaLightbulb, text: "UI/UX Strategy" }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-3 text-xs text-gray-400 hover:text-white transition-colors cursor-default"
                  >
                    <item.icon className="text-blue-500" size={14} /> 
                    <span className="tracking-widest uppercase font-bold text-[9px]">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6"
            >
              <button className="group flex items-center gap-6 text-white hover:text-blue-400 transition-colors">
                <Link href="/documents" target="_blank" className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Lihat Resume Lengkap</span>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                  <FaArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform" />
                </div>
                </Link>
              </button>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Ornament Number Bergerak Pelan */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-10 opacity-5 text-[10vw] font-black text-white italic select-none pointer-events-none"
      >
        01
      </motion.div>
    </section>
  );
}
