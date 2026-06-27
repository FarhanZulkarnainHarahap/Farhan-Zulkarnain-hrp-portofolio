"use client";
import { FaArrowRight, FaTerminal, FaLayerGroup, FaLightbulb } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
  return (
    <section id="about" className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-transparent py-20 lg:h-screen lg:py-0">
      
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-80 h-80 md:w-125 md:h-125 bg-blue-600/10 rounded-full blur-[100px] md:blur-[120px]" 
        />
      </div>

      <div className="z-10 mx-auto w-full max-w-6xl px-6 md:px-12">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-end lg:gap-16">
          
          {/* Left Side: Visual Element */}
          <div
            className="relative group shrink-0"
          >
            <div className="relative z-10 h-60 w-48 overflow-hidden rounded-sm border border-white/5 bg-[#020203] shadow-2xl md:h-80 md:w-64 lg:h-96 lg:w-72">
              <Image 
                src="https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg" 
                alt="Farhan Workspace" 
                fill 
                sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 320px"
                className="object-cover transition-all duration-1000 scale-110 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Corner line decoration */}
            <div
              className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-12 h-12 md:w-20 md:h-20 border-l-2 border-b-2 border-blue-500/50 z-0" 
            />
          </div>

          {/* SISI KANAN: Konten Utama */}
          <div className="flex-1 space-y-8 md:space-y-10 text-center lg:text-left z-10">
            <div
              className="space-y-4"
            >
              <div className="flex items-center justify-center lg:justify-start gap-4 text-blue-500 font-bold text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase">
                <span
                  className="hidden h-px w-8 bg-blue-500 md:block"
                ></span> 
                About Me
              </div>
              <h3 className="text-3xl font-black uppercase leading-[1.1] tracking-tight text-white md:text-5xl lg:text-5xl">
                CODE IS MY <br />
                <span className="italic font-serif font-light text-blue-400">Language.</span>
              </h3>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
            >
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                A year as a digital architect has shaped my high standards for front-end visual precision and backend stability. I am committed to building digital products optimized for performance</p>
              <div className="flex flex-col gap-4 items-center lg:items-start">
                {[
                  { icon: FaTerminal, text: "Fullstack Dev" },
                  { icon: FaLayerGroup, text: "System Architecture" },
                  { icon: FaLightbulb, text: "UI/UX Strategy" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-default"
                  >
                    <item.icon className="text-blue-500" size={14} /> 
                    <span className="tracking-[0.2em] uppercase font-bold text-[9px] md:text-[10px]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="pt-4 flex justify-center lg:justify-start"
            >
              <Link href="/documents" target="_blank" className="group flex items-center gap-4 text-white hover:text-blue-400 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">View Full Resume</span>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                  <FaArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform text-sm" />
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Ornament Number */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 opacity-5 text-[15vw] lg:text-[10vw] font-black text-white italic select-none pointer-events-none">
        01
      </div>
    </section>
  );
}
