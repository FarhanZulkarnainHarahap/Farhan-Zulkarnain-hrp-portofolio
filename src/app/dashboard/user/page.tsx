"use client";

import dynamic from "next/dynamic";

const HorizontalPortfolio = dynamic(() => import("@/components/horizontal/HorizontalPortfolio"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.45em] text-cyan-300">Dark Tech OS</p>
        <h1 className="mt-4 text-4xl font-black uppercase text-white md:text-6xl">
          Initializing Portfolio
        </h1>
        <p className="mt-4 text-sm text-slate-400">Loading horizontal experience...</p>
      </div>
    </main>
  ),
});

export default function Home() {
  return <HorizontalPortfolio />;
}
