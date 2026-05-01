"use client";
import { motion, Variants } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import ShinyText from "./ShinyText"; // Pastikan path import sudah benar
import Link from "next/link";

export default function HeroCard() {
  const fadeInUp: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any },
    },
  };

  return (
    <section className="relative w-full h-full flex items-center justify-center bg-[#030406] overflow-hidden">
      {/* 1. Ambient Background Decor */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* 2. Kolom Teks Utama (Span 7) */}
        <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-4">
            <div className="flex items-center gap-3 text-blue-500 font-bold tracking-[0.5em] text-[10px] uppercase">
              <span className="h-px w-10 bg-blue-500"></span> Available for projects
            </div>
            
            {/* IMPLEMENTASI SHINY TEXT PADA NAMA */}
            <h1 className="text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase flex flex-col items-start">
              <ShinyText 
                text="FARHAN" 
                speed={3} 
                color="rgba(255, 255, 255, 0.2)" 
                shineColor="#ffffff" 
              />
              <ShinyText 
                text="ZULKARNAIN." 
                speed={3} 
                color="#3b82f6" 
                shineColor="#ffffff" 
              />
            </h1>
          </motion.div>

          <motion.p 
            initial="hidden" animate="visible" variants={fadeInUp} 
            className="max-w-xl text-gray-500 text-lg md:text-xl font-light leading-relaxed"
          >
            Crafting high-performance digital experiences through <span className="text-white font-medium underline decoration-blue-500/30">clean code</span> and <span className="text-white font-medium italic">immersive design</span>.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="pt-4 flex flex-wrap gap-6">
            <Link href="/projects">
            <button className="group flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full transition-all shadow-xl shadow-blue-500/20">
              <span className="text-xs font-black uppercase tracking-widest">View My Projects</span>
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
            </Link>
          </motion.div>
        </div>

        {/* 3. Kolom Foto Profil (Span 5) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2"
        >
          <div className="relative group">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-6 border border-dashed border-blue-500/20 rounded-full pointer-events-none"
            />
            
            <div className="relative w-64 h-80 md:w-80 md:h-105 rounded-[2.5rem] overflow-hidden border border-white/10 bg-gray-900 shadow-2xl">
  <Image 
    src="https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg"  
    alt="Farhan Zulkarnain"
    fill
    priority
    // Tambahkan properti sizes di bawah ini
    sizes="(max-width: 768px) 256px, 320px"
    className="object-cover transition-all duration-1000 scale-110 group-hover:scale-100"
  />
  <div className="absolute inset-0 bg-linear-to-t from-[#030406] via-transparent to-transparent opacity-60" />
</div>

            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 p-4 glass-card border border-white/10 rounded-2xl shadow-2xl"
            >
              <div className="flex flex-col">
                <span className="text-blue-500 font-black text-xl leading-none">FZ.</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Creative Dev</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
