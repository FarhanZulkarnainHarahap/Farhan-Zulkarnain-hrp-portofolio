"use client";

import Image from "next/image";
import Link from "next/link";
import { LuArrowRight, LuCodeXml, LuSparkles } from "react-icons/lu";
import { getOptimizedImageUrl } from "@/lib/image";

const profileImage = getOptimizedImageUrl(
  "https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg",
  900,
);

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-transparent px-5 pb-32 pt-18 sm:px-8 lg:h-screen lg:px-12 lg:pb-28 lg:pt-8"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[4%] top-[12%] h-36 w-36 bg-[radial-gradient(circle,#3b82f6_1px,transparent_1.5px)] bg-size-[13px_13px] opacity-25" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[110px]" />
        <div className="absolute left-0 top-1/2 h-px w-[34%] bg-linear-to-r from-transparent via-blue-500/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-18">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <div className="mb-6 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.42em] text-blue-400 lg:justify-start">
            <span className="h-px w-10 bg-blue-500" />
            About Me
          </div>

          <h2 className="text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-[4.7rem]">
            About <span className="text-blue-500">Me</span>
          </h2>

          <div className="mx-auto mt-7 h-px w-22 bg-linear-to-r from-blue-400 to-transparent lg:mx-0" />

          <p className="mx-auto mt-7 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg lg:mx-0">
            Let&apos;s turn ideas into reality.
            <br />
            Discover my journey, expertise, and credentials.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <span className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/8 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-200">
              <LuCodeXml size={14} />
              Full-stack Developer
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-300">
              <LuSparkles size={14} />
              Based in Medan
            </span>
          </div>

          <Link
            href="/about"
            data-cursor-label="EXPLORE"
            className="group mx-auto mt-9 flex w-fit items-center gap-8 border border-blue-400/55 bg-[#050a14]/80 px-7 py-4 text-xs font-black uppercase tracking-[0.22em] text-white shadow-[0_0_30px_rgba(37,99,235,0.14),inset_0_0_24px_rgba(37,99,235,0.06)] transition-all hover:border-blue-300 hover:bg-blue-500/12 hover:shadow-[0_0_36px_rgba(37,99,235,0.28)] lg:mx-0"
          >
            Explore Me
            <LuArrowRight className="text-blue-400 transition-transform group-hover:translate-x-1.5" size={20} />
          </Link>
        </div>

        <div className="order-1 mx-auto w-full max-w-[31rem] lg:order-2">
          <div className="about-cyber-frame group relative p-3 sm:p-4">
            <div className="absolute -left-1 top-[28%] h-16 w-1 bg-blue-500 shadow-[0_0_18px_#3b82f6]" />
            <div className="absolute -right-1 top-[28%] h-16 w-1 bg-blue-500 shadow-[0_0_18px_#3b82f6]" />
            <div className="relative aspect-[4/5] overflow-hidden bg-[#08101d]">
              <Image
                src={profileImage}
                alt="Farhan Zulkarnain"
                fill
                sizes="(max-width: 1024px) 80vw, 500px"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#02050b]/38 via-transparent to-blue-500/6" />
            </div>
            <span className="absolute -top-1 left-8 h-1 w-18 skew-x-[-35deg] bg-blue-500 shadow-[0_0_14px_#3b82f6]" />
            <span className="absolute -bottom-1 right-8 h-1 w-18 skew-x-[-35deg] bg-blue-500 shadow-[0_0_14px_#3b82f6]" />
          </div>
        </div>
      </div>
    </section>
  );
}
