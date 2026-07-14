import type { Metadata } from "next";
import Link from "next/link";
import { LuArrowLeft, LuBriefcaseBusiness } from "react-icons/lu";
import CinematicScrollController from "@/components/motion/CinematicScrollController";
import PublicDock from "@/components/navigation/PublicDock";
import PublicContactForm from "@/components/public/PublicContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send a message through the portfolio contact form backed by the existing Express API and Prisma Contact model.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PublicDock />
      <CinematicScrollController>
        <main className="min-h-screen bg-[#02040a] px-5 pb-40 pt-28 text-slate-100 sm:px-8 lg:px-12">
          <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <Link
                href="/"
                data-hero-reveal
                className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-white/12 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                <LuArrowLeft className="h-4 w-4" /> Home
              </Link>
              <p data-hero-reveal className="mt-10 text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                Contact
              </p>
              <h1 data-hero-reveal className="mt-5 text-5xl font-black uppercase leading-[0.92] text-white sm:text-7xl">
                Let&apos;s build something meaningful.
              </h1>
              <p data-hero-reveal className="mt-7 text-base leading-8 text-slate-300">
                This form submits to the existing Express contact endpoint, stores the message
                through Prisma, and preserves the backend email flow.
              </p>
              <div data-hero-reveal className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-300">
                  <LuBriefcaseBusiness className="h-4 w-4 text-cyan-200" />
                  No mock submission or local-only storage is used.
                </p>
              </div>
            </div>
            <div data-hero-reveal className="rounded-[30px] border border-white/10 bg-slate-950/52 p-5 backdrop-blur-xl sm:p-7">
              <PublicContactForm />
            </div>
          </section>
        </main>
      </CinematicScrollController>
    </>
  );
}
