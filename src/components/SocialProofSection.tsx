"use client";

import { motion } from "framer-motion";
import {
  LuBadgeCheck,
  LuDatabaseZap,
  LuFileCheck,
  LuLayoutDashboard,
  LuRocket,
  LuSparkles,
} from "react-icons/lu";

const proofCards = [
  {
    icon: LuRocket,
    title: "Product Delivery",
    label: "Frontend + Backend",
    description: "End-to-end project execution from UI structure to API-connected features.",
  },
  {
    icon: LuLayoutDashboard,
    title: "Admin Systems",
    label: "Managed Content",
    description: "Dashboards for skills, projects, and documents with clean management flows.",
  },
  {
    icon: LuDatabaseZap,
    title: "API Integration",
    label: "Live Data",
    description: "Portfolio content is powered by backend endpoints instead of static-only pages.",
  },
  {
    icon: LuFileCheck,
    title: "Verified Assets",
    label: "Documents",
    description: "Certificates and resume assets are presented as searchable professional proof.",
  },
];

const stats = [
  { value: "Full", label: "Stack Mindset" },
  { value: "UI", label: "Focused Design" },
  { value: "API", label: "Connected System" },
];

export default function SocialProofSection() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-[#030406] px-4 py-20 md:px-6 md:py-24">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(14,165,233,0.1),transparent_30%)]" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 -z-10 h-110 w-110 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-blue-500/18"
      />

      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-blue-300"
          >
            <LuSparkles size={14} />
            Proof of Work
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-4xl font-black uppercase leading-[0.95] text-white md:text-6xl"
          >
            Built to Show <span className="text-blue-500">Capability.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
            className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-zinc-400 lg:mx-0"
          >
            This portfolio is not just a gallery. It demonstrates structured UI, backend-connected content, admin workflows, and professional assets in one experience.
          </motion.p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + index * 0.08 }}
                className="rounded-2xl border border-white/8 bg-white/4 p-4 text-center"
              >
                <p className="text-2xl font-black text-blue-400">{stat.value}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {proofCards.map(({ icon: Icon, title, label, description }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, rotate: index % 2 === 0 ? -1 : 1 }}
              className="group relative overflow-hidden rounded-[26px] border border-white/8 bg-[#080d18]/90 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
            >
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.4, 0.15] }}
                transition={{ duration: 4, repeat: Infinity, delay: index * 0.35 }}
                className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/20 blur-[35px]"
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/12 text-blue-300">
                    <Icon size={22} />
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
                    <LuBadgeCheck className="text-blue-400" size={12} />
                    {label}
                  </div>
                </div>

                <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
