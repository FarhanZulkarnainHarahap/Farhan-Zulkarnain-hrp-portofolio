"use client";
import { motion, Variants } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import ShinyText from "./ShinyText"; 
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
    <section className="relative w-full min-h-screen lg:h-screen flex items-center justify-center bg-[#030406] overflow-hidden py-20 lg:py-0">
      {/* 1. Ambient Background Decor - Ukuran dinamis agar tidak makan memori di mobile */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 md:w-96 md:h-96 bg-blue-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-60 h-60 md:w-80 md:h-80 bg-purple-600/5 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* 2. Kolom Foto Profil (Muncul di ATAS pada mobile: order-1) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2"
        >
          <div className="relative group">
            {/* Ring dekoratif - Disembunyikan di mobile agar lebih clean jika perlu, atau kecilkan ukurannya */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 md:-inset-6 border border-dashed border-blue-500/20 rounded-full pointer-events-none"
            />
            
            {/* Container Foto - Ukuran adaptif */}
            <div className="relative w-56 h-72 md:w-80 md:h-105 rounded-4xl md:rounded-[2.5rem] overflow-hidden border border-white/10 bg-gray-900 shadow-2xl">
              <Image 
                src="https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg"  
                alt="Farhan Zulkarnain"
                fill
                priority
                sizes="(max-width: 768px) 224px, 320px"
                className="object-cover transition-all duration-1000 scale-110 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#030406] via-transparent to-transparent opacity-60" />
            </div>

            {/* Floating Badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 p-3 md:p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl"
            >
              <div className="flex flex-col">
                <span className="text-blue-500 font-black text-lg md:text-xl leading-none">FZ.</span>
                <span className="text-[7px] md:text-[8px] text-gray-400 uppercase tracking-widest mt-1">Creative Dev</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 3. Kolom Teks Utama (Muncul di BAWAH pada mobile: order-2) */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8 order-2 lg:order-1 text-center lg:text-left">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3 text-blue-500 font-bold tracking-[0.3em] md:tracking-[0.5em] text-[9px] md:text-[10px] uppercase">
              <span className="h-px w-8 md:w-10 bg-blue-500"></span> Available for projects
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase flex flex-col items-center lg:items-start">
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
            className="max-w-xl mx-auto lg:mx-0 text-gray-500 text-base md:text-xl font-light leading-relaxed px-2 md:px-0"
          >
            Crafting high-performance digital experiences through <span className="text-white font-medium underline decoration-blue-500/30">clean code</span> and <span className="text-white font-medium italic">immersive design</span>.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="pt-4 flex justify-center lg:justify-start">
            <Link href="#projects">
              <button className="group flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">View My Projects</span>
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
