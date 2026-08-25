"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ArrowUpRight, LoaderCircle, Send } from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { apiFetch } from "@/lib/api-client";
import { getOptimizedImageUrl } from "@/lib/image";
import {
  getProjectSlug,
  type ProjectLike,
} from "@/lib/portfolio/projects";

export interface ImmersiveContentProps {
  projects: ProjectLike[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

type ContactFormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

type ContactStatus = {
  type: "success" | "error" | null;
  message: string;
};

const EMPTY_CONTACT_FORM: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

const JOURNEY_NODES = [
  {
    name: "Purwadhika",
    detail: "Immersive learning / Software engineering",
    year: "01",
  },
  {
    name: "Laravel",
    detail: "Backend foundations / APIs and systems",
    year: "02",
  },
  {
    name: "Tokio Marine",
    detail: "Industry perspective / Enterprise practice",
    year: "03",
  },
  {
    name: "Full Stack Development",
    detail: "Interface to infrastructure / End-to-end products",
    year: "04",
  },
] as const;

const CONTACT_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/FarhanZulkarnainHarahap",
  },
  {
    label: "Email",
    href: "mailto:farhanzulkarnaenhrp@gmail.com",
  },
  {
    label: "Website",
    href: "https://farhanzulkarnainhrp.com",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/farhan-zulkarnain-71801a347",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/6281958169283",
  },
] as const;

function SectionMarker({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/50 sm:text-[10px]">
      <span className="font-mono text-cyan-200/80">{number}</span>
      <span className="h-px w-10 bg-white/20 sm:w-16" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default function ImmersiveContent({
  projects,
  loading,
  error,
  onRetry,
}: ImmersiveContentProps) {
  const reducedMotion = useReducedMotion();
  const projectsSectionRef = useRef<HTMLElement>(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [contactForm, setContactForm] =
    useState<ContactFormState>(EMPTY_CONTACT_FORM);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState<ContactStatus>({
    type: null,
    message: "",
  });

  const { scrollYProgress: projectProgress } = useScroll({
    target: projectsSectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(projectProgress, "change", (latest) => {
    if (projects.length === 0) return;

    const nextIndex = Math.min(
      projects.length - 1,
      Math.floor(Math.max(0, latest) * projects.length),
    );
    setActiveProjectIndex((current) =>
      current === nextIndex ? current : nextIndex,
    );
  });

  const safeProjectIndex = Math.min(
    activeProjectIndex,
    Math.max(projects.length - 1, 0),
  );
  const activeProject = projects[safeProjectIndex];
  const projectIsReversed = safeProjectIndex % 2 === 1;

  const handleContactChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const field = event.currentTarget.name as keyof ContactFormState;
    const value = event.currentTarget.value;
    setContactForm((current) => ({ ...current, [field]: value }));
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (contactLoading) return;

    setContactStatus({ type: null, message: "" });

    if (contactForm.website.trim()) {
      setContactForm(EMPTY_CONTACT_FORM);
      setContactStatus({
        type: "success",
        message: "Signal received. I will get back to you soon.",
      });
      return;
    }

    const message = contactForm.subject.trim()
      ? `Subject: ${contactForm.subject.trim()}\n\n${contactForm.message.trim()}`
      : contactForm.message.trim();

    setContactLoading(true);

    try {
      const response = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name.trim(),
          email: contactForm.email.trim(),
          message,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        error?: string;
      } | null;

      if (response.ok && result?.success) {
        setContactForm(EMPTY_CONTACT_FORM);
        setContactStatus({
          type: "success",
          message: "Signal received. I will get back to you soon.",
        });
      } else {
        setContactStatus({
          type: "error",
          message:
            result?.message ??
            result?.error ??
            "The signal could not be sent. Please try again.",
        });
      }
    } catch {
      setContactStatus({
        type: "error",
        message: "Connection interrupted. Please use email or WhatsApp.",
      });
    } finally {
      setContactLoading(false);
    }
  };

  const revealInitial = reducedMotion
    ? false
    : { opacity: 0, y: 44, filter: "blur(10px)" };
  const revealTransition = {
    duration: reducedMotion ? 0 : 0.82,
    ease: "easeOut" as const,
  };

  return (
    <div className="relative z-10 overflow-x-clip text-white">
      <section
        id="home"
        aria-labelledby="immersive-hero-title"
        className="relative h-[150svh]"
      >
        <div className="sticky top-0 h-svh overflow-hidden px-4 sm:px-7 lg:px-10">
          <div
            className="pointer-events-none absolute inset-x-4 top-5 flex items-start justify-between border-t border-white/15 pt-3 text-[8px] font-semibold uppercase tracking-[0.28em] text-white/45 sm:inset-x-7 sm:text-[9px] lg:inset-x-10"
            aria-hidden="true"
          >
            <span>Portfolio / 2026</span>
            <span>03° 35&apos; N · 98° 40&apos; E</span>
          </div>

          <div className="relative mx-auto flex h-full max-w-[100rem] flex-col justify-center pb-20 pt-24">
            <motion.p
              initial={revealInitial}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={revealTransition}
              className="mb-4 ml-[1vw] text-[9px] font-bold uppercase tracking-[0.38em] text-cyan-200/80 sm:text-[11px]"
            >
              Full-stack developer · Medan, Indonesia
            </motion.p>

            <motion.h1
              id="immersive-hero-title"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 1 }}
              className="relative font-black uppercase leading-[0.72] tracking-[-0.075em]"
            >
              <motion.span
                initial={reducedMotion ? false : { x: "-9vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: reducedMotion ? 0 : 1.05,
                  ease: "easeOut",
                }}
                className="block whitespace-nowrap text-[clamp(4.4rem,16vw,15rem)]"
              >
                Farhan
              </motion.span>
              <motion.span
                initial={reducedMotion ? false : { x: "9vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: reducedMotion ? 0 : 1.05,
                  delay: reducedMotion ? 0 : 0.08,
                  ease: "easeOut",
                }}
                className="ml-[7vw] mt-[0.18em] block whitespace-nowrap text-[clamp(3.4rem,13vw,12.5rem)] text-white/92"
              >
                Zulkarnain
              </motion.span>
            </motion.h1>

            <div className="absolute left-1/2 top-[48%] hidden -translate-x-1/2 -translate-y-1/2 items-center gap-3 sm:flex">
              <span className="h-px w-16 bg-cyan-200/50" aria-hidden="true" />
              <span className="whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.3em] text-cyan-100/70">
                FZH / Core 001
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
            </div>
          </div>

          <div className="absolute bottom-6 left-4 right-4 flex items-end justify-between sm:left-7 sm:right-7 lg:left-10 lg:right-10">
            <p className="max-w-44 text-[9px] uppercase leading-5 tracking-[0.22em] text-white/45 sm:max-w-64 sm:text-[10px]">
              Designing systems where engineering and atmosphere meet.
            </p>
            <div className="flex items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.28em] text-white/50 sm:text-[9px]">
              <span>Scroll to enter</span>
              <span className="relative h-12 w-px overflow-hidden bg-white/15">
                <motion.span
                  className="absolute inset-x-0 top-0 h-1/2 origin-top bg-cyan-200"
                  animate={
                    reducedMotion ? { scaleY: 1 } : { scaleY: [0, 1, 0] }
                  }
                  transition={{
                    duration: 1.8,
                    repeat: reducedMotion ? 0 : Infinity,
                    ease: "easeInOut",
                  }}
                />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        aria-labelledby="immersive-about-title"
        className="relative h-[200svh]"
      >
        <div className="sticky top-0 flex h-svh overflow-hidden px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
          <div className="mx-auto flex h-full w-full max-w-[96rem] flex-col">
            <div className="flex items-start justify-between">
              <SectionMarker number="01" label="About" />
              <p className="hidden max-w-52 text-right text-[9px] uppercase leading-5 tracking-[0.2em] text-white/35 sm:block">
                Code, motion and systems built with intent.
              </p>
            </div>

            <div className="grid flex-1 items-center lg:grid-cols-[0.74fr_1.26fr]">
              <div className="hidden lg:block" aria-hidden="true" />
              <motion.div
                initial={revealInitial}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.38 }}
                transition={revealTransition}
                className="min-w-0 lg:pl-8"
              >
                <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.34em] text-cyan-200/70">
                  Discipline / 001
                </p>
                <h2
                  id="immersive-about-title"
                  className="text-[clamp(3.4rem,9.8vw,10rem)] font-black uppercase leading-[0.76] tracking-[-0.07em]"
                >
                  <span className="block">Full Stack</span>
                  <span className="block text-white/42">Developer</span>
                </h2>
                <div className="mt-8 grid gap-5 border-t border-white/15 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
                  <p className="max-w-xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
                    I shape digital products from interface and interaction to
                    resilient APIs, data, and deployment.
                  </p>
                  <p className="text-[11px] font-black uppercase leading-5 tracking-[0.18em] text-cyan-100 sm:text-right sm:text-sm">
                    Based in Medan,
                    <br />
                    Indonesia
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[8px] uppercase tracking-[0.24em] text-white/30">
              <span>Frontend / Backend</span>
              <span>Open to collaboration</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="journey"
        aria-labelledby="immersive-journey-title"
        className="relative h-[200svh]"
      >
        <div className="sticky top-0 flex h-svh overflow-hidden px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
          <div className="mx-auto flex h-full w-full max-w-[96rem] flex-col">
            <div className="flex items-start justify-between">
              <SectionMarker number="02" label="Journey" />
              <p className="font-mono text-[8px] uppercase tracking-[0.26em] text-white/30">
                Four points / One trajectory
              </p>
            </div>

            <div className="grid min-h-0 flex-1 content-center gap-7 py-8 sm:gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-16">
              <motion.div
                initial={revealInitial}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.4 }}
                transition={revealTransition}
              >
                <p className="mb-3 text-[9px] uppercase tracking-[0.3em] text-cyan-200/70">
                  An evolving practice
                </p>
                <h2
                  id="immersive-journey-title"
                  className="max-w-lg text-[clamp(3.1rem,7vw,7.8rem)] font-black uppercase leading-[0.8] tracking-[-0.065em]"
                >
                  Built in
                  <span className="block text-white/35">motion.</span>
                </h2>
              </motion.div>

              <ol className="grid gap-x-12 gap-y-5 sm:grid-cols-2 sm:gap-y-9">
                {JOURNEY_NODES.map((node, index) => (
                  <motion.li
                    key={node.name}
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, x: index % 2 === 0 ? -28 : 28 }
                    }
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{
                      duration: reducedMotion ? 0 : 0.65,
                      delay: reducedMotion ? 0 : index * 0.07,
                      ease: "easeOut",
                    }}
                    className={`${index % 2 === 1 ? "sm:translate-y-10" : ""} group border-t border-white/20 pt-3`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="pt-1 font-mono text-[8px] text-cyan-200/60">
                        {node.year}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black uppercase leading-none tracking-[-0.04em] text-white sm:text-2xl lg:text-[clamp(1.5rem,2.6vw,3rem)]">
                          {node.name}
                        </h3>
                        <p className="mt-2 max-w-64 text-[8px] uppercase leading-4 tracking-[0.18em] text-white/35 sm:text-[9px]">
                          {node.detail}
                        </p>
                      </div>
                    </div>
                    <span
                      className="mt-3 block h-px w-0 bg-cyan-200/80 transition-[width] duration-700 motion-reduce:transition-none group-hover:w-full"
                      aria-hidden="true"
                    />
                  </motion.li>
                ))}
              </ol>
            </div>

            <div className="flex justify-end">
              <p className="max-w-sm text-right text-[8px] uppercase leading-4 tracking-[0.2em] text-white/30">
                Every node compounds — craft becomes system, system becomes
                experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={projectsSectionRef}
        id="projects"
        aria-labelledby="immersive-projects-title"
        className="relative h-[300svh]"
      >
        <div className="sticky top-0 flex h-svh overflow-hidden px-4 py-5 sm:px-7 sm:py-7 lg:px-10">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[96rem] flex-col">
            <div className="flex shrink-0 items-start justify-between gap-6">
              <SectionMarker number="03" label="Selected Work" />
              <div className="text-right">
                <p className="font-mono text-[10px] text-white/75">
                  {projects.length > 0
                    ? `${String(safeProjectIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`
                    : "00 / 00"}
                </p>
                <p className="mt-1 hidden text-[8px] uppercase tracking-[0.2em] text-white/30 sm:block">
                  Scroll to sequence
                </p>
              </div>
            </div>

            <div className="relative mt-3 h-px shrink-0 overflow-hidden bg-white/10 sm:mt-5">
              <motion.span
                className="absolute inset-y-0 left-0 w-full origin-left bg-cyan-200/80"
                style={{ scaleX: projectProgress }}
              />
            </div>

            <div className="relative min-h-0 flex-1">
              <AnimatePresence initial={false} mode="wait">
                {loading && !activeProject ? (
                  <motion.div
                    key="project-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full flex-col justify-center"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    <p className="text-[9px] uppercase tracking-[0.3em] text-cyan-200/70">
                      Establishing data link
                    </p>
                    <p className="mt-4 motion-safe:animate-pulse text-[clamp(3.8rem,11vw,11rem)] font-black uppercase leading-[0.78] tracking-[-0.07em] text-white/18">
                      Syncing
                      <br />
                      projects.
                    </p>
                  </motion.div>
                ) : error && !activeProject ? (
                  <motion.div
                    key="project-error"
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full max-w-3xl flex-col justify-center"
                    role="alert"
                  >
                    <p className="text-[9px] uppercase tracking-[0.3em] text-red-200/80">
                      Data link interrupted
                    </p>
                    <h2
                      id="immersive-projects-title"
                      className="mt-4 text-[clamp(3rem,8vw,8rem)] font-black uppercase leading-[0.8] tracking-[-0.065em]"
                    >
                      Signal
                      <br />
                      unavailable.
                    </h2>
                    <p className="mt-5 max-w-xl text-sm leading-6 text-white/50">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-7 w-fit border-b border-cyan-200 pb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100 transition-colors hover:text-white"
                    >
                      Reconnect / Retry
                    </button>
                  </motion.div>
                ) : !activeProject ? (
                  <motion.div
                    key="project-empty"
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full max-w-3xl flex-col justify-center"
                  >
                    <p className="text-[9px] uppercase tracking-[0.3em] text-cyan-200/70">
                      Archive / 000
                    </p>
                    <h2
                      id="immersive-projects-title"
                      className="mt-4 text-[clamp(3rem,8vw,8rem)] font-black uppercase leading-[0.8] tracking-[-0.065em]"
                    >
                      New work
                      <br />
                      incoming.
                    </h2>
                    <p className="mt-5 text-sm text-white/45">
                      The project archive is currently being prepared.
                    </p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-7 w-fit border-b border-white/40 pb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white/70 hover:text-white"
                    >
                      Check again
                    </button>
                  </motion.div>
                ) : (
                  <motion.article
                    key={activeProject.id}
                    initial={
                      reducedMotion
                        ? false
                        : {
                            opacity: 0,
                            x: projectIsReversed ? -52 : 52,
                            filter: "blur(8px)",
                          }
                    }
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={
                      reducedMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            x: projectIsReversed ? 40 : -40,
                            filter: "blur(6px)",
                          }
                    }
                    transition={{
                      duration: reducedMotion ? 0 : 0.48,
                      ease: "easeOut",
                    }}
                    className="grid h-full min-h-0 content-center gap-4 py-3 sm:gap-6 sm:py-5 lg:grid-cols-2 lg:items-center lg:gap-12"
                    aria-live="polite"
                  >
                    <div
                      className={`relative min-h-0 ${projectIsReversed ? "lg:order-2" : ""}`}
                    >
                      <p
                        className="pointer-events-none absolute -top-6 left-0 z-0 whitespace-nowrap text-[clamp(4rem,10vw,10rem)] font-black uppercase leading-none tracking-[-0.07em] text-white/[0.035]"
                        aria-hidden="true"
                      >
                        {String(safeProjectIndex + 1).padStart(2, "0")}
                      </p>
                      <div className="relative aspect-[16/9] max-h-[34svh] overflow-hidden border-y border-white/15 bg-[#05080d]/70 sm:max-h-[40svh] lg:max-h-[62svh] lg:aspect-[4/3]">
                        <Image
                          src={getOptimizedImageUrl(
                            activeProject.imageUrl || "/window.svg",
                            1400,
                          )}
                          alt={`${activeProject.title} project preview`}
                          fill
                          sizes="(max-width: 1023px) 100vw, 50vw"
                          className="object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#02050a]/70 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3 text-[8px] uppercase tracking-[0.22em] text-white/65 sm:p-4">
                          <span>Project artifact</span>
                          <span>{activeProject.caseType ?? "Web application"}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`min-w-0 ${projectIsReversed ? "lg:order-1 lg:text-right" : ""}`}
                    >
                      <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-cyan-200/70 sm:text-[9px]">
                        Case {String(safeProjectIndex + 1).padStart(2, "0")} ·{" "}
                        {activeProject.caseType ?? "Digital product"}
                      </p>
                      <h2
                        id="immersive-projects-title"
                        className="mt-2 text-[clamp(2.4rem,6vw,7rem)] font-black uppercase leading-[0.82] tracking-[-0.06em] sm:mt-3"
                      >
                        {activeProject.title}
                      </h2>
                      <p
                        className={`mt-3 max-w-2xl text-xs leading-5 text-white/52 sm:mt-5 sm:text-sm sm:leading-6 lg:text-base lg:leading-7 ${projectIsReversed ? "lg:ml-auto" : ""}`}
                      >
                        {activeProject.description}
                      </p>

                      <div
                        className={`mt-3 flex max-h-20 flex-wrap gap-x-3 gap-y-1.5 overflow-y-auto sm:mt-5 ${projectIsReversed ? "lg:justify-end" : ""}`}
                        aria-label="Technologies"
                      >
                        {activeProject.tags.length > 0 ? (
                          activeProject.tags.map((technology) => (
                            <span
                              key={technology}
                              className="border-b border-white/20 pb-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:text-[9px]"
                            >
                              {technology}
                            </span>
                          ))
                        ) : (
                          <span className="border-b border-white/20 pb-1 text-[8px] uppercase tracking-[0.16em] text-white/45">
                            Full-stack development
                          </span>
                        )}
                      </div>

                      <div
                        className={`mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-7 ${projectIsReversed ? "lg:justify-end" : ""}`}
                      >
                        <Link
                          href={`/projects/${getProjectSlug(activeProject)}`}
                          prefetch={false}
                          className="group flex items-center gap-2 border-b border-cyan-200 pb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-100"
                        >
                          Case study
                          <ArrowUpRight
                            size={13}
                            className="transition-transform motion-reduce:transition-none group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </Link>
                        {activeProject.demoUrl && (
                          <a
                            href={activeProject.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 border-b border-white/25 pb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/70 hover:border-white hover:text-white"
                          >
                            Live project
                            <ArrowUpRight
                              size={13}
                              className="transition-transform motion-reduce:transition-none group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                          </a>
                        )}
                        {activeProject.repoUrl && (
                          <a
                            href={activeProject.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 border-b border-white/25 pb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/70 hover:border-white hover:text-white"
                          >
                            GitHub
                            <ArrowUpRight
                              size={13}
                              className="transition-transform motion-reduce:transition-none group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                )}
              </AnimatePresence>

              {error && activeProject && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="absolute bottom-1 right-0 text-[8px] uppercase tracking-[0.2em] text-red-200/70 hover:text-red-100"
                >
                  Live sync interrupted · Retry
                </button>
              )}
              {loading && activeProject && (
                <p className="absolute bottom-1 left-0 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-white/40">
                  <LoaderCircle
                    size={11}
                    className="motion-safe:animate-spin"
                  />
                  Updating archive
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        aria-labelledby="immersive-contact-title"
        className="relative h-[250svh]"
      >
        <div className="sticky top-0 flex h-svh overflow-y-auto px-4 py-5 sm:px-7 sm:py-7 lg:overflow-hidden lg:px-10">
          <div className="mx-auto flex min-h-full w-full max-w-[96rem] flex-col lg:h-full">
            <div className="flex shrink-0 items-start justify-between">
              <SectionMarker number="04" label="Contact" />
              <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-emerald-200/60">
                Channel open
              </p>
            </div>

            <div className="grid flex-1 content-center gap-7 py-7 lg:min-h-0 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:gap-14 lg:py-5">
              <motion.div
                initial={revealInitial}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.35 }}
                transition={revealTransition}
                className="min-w-0"
              >
                <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.32em] text-cyan-200/75">
                  Have something worth building?
                </p>
                <h2
                  id="immersive-contact-title"
                  className="text-[clamp(4.4rem,11.5vw,12rem)] font-black uppercase leading-[0.7] tracking-[-0.075em]"
                >
                  <span className="block">Send a</span>
                  <span className="block text-white/36">Signal.</span>
                </h2>

                <nav
                  aria-label="Contact and social links"
                  className="mt-7 grid grid-cols-2 border-t border-white/15 sm:grid-cols-3 lg:max-w-3xl"
                >
                  {CONTACT_LINKS.map((link, index) => {
                    const isExternal = link.href.startsWith("http");
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="group flex min-h-11 items-center justify-between border-b border-white/15 py-2 pr-3 text-[8px] font-bold uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-cyan-100 sm:text-[9px]"
                      >
                        <span>
                          <span className="mr-2 font-mono text-white/25">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {link.label}
                        </span>
                        <ArrowUpRight
                          size={12}
                          className="transition-transform motion-reduce:transition-none group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </a>
                    );
                  })}
                </nav>
              </motion.div>

              <motion.form
                onSubmit={handleContactSubmit}
                initial={
                  reducedMotion ? false : { opacity: 0, y: 36, scale: 0.98 }
                }
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reducedMotion ? 0 : 0.7, ease: "easeOut" }}
                className="relative border-y border-white/15 bg-[#03070c]/45 px-4 py-5 backdrop-blur-md sm:px-6 sm:py-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-cyan-200/65">
                      Direct transmission
                    </p>
                    <h3 className="mt-1.5 text-xl font-black uppercase tracking-[-0.03em] sm:text-2xl">
                      Start a conversation
                    </h3>
                  </div>
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.85)]"
                    aria-label="Contact channel online"
                  />
                </div>

                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <label className="block border-b border-white/15 pb-2">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.22em] text-white/35">
                      Name
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      className="mt-1.5 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    />
                  </label>

                  <label className="block border-b border-white/15 pb-2">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.22em] text-white/35">
                      Email
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="mt-1.5 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    />
                  </label>

                  <label className="block border-b border-white/15 pb-2 sm:col-span-2">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.22em] text-white/35">
                      Subject
                    </span>
                    <input
                      type="text"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleContactChange}
                      autoComplete="off"
                      placeholder="Project, role, or collaboration"
                      className="mt-1.5 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    />
                  </label>

                  <label className="block border-b border-white/15 pb-2 sm:col-span-2">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.22em] text-white/35">
                      Message
                    </span>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      required
                      rows={3}
                      placeholder="Tell me what you want to make real."
                      className="mt-1.5 max-h-28 min-h-16 w-full resize-y bg-transparent text-sm leading-5 text-white outline-none placeholder:text-white/20"
                    />
                  </label>
                </div>

                <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                  Website
                  <input
                    type="text"
                    name="website"
                    value={contactForm.website}
                    onChange={handleContactChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="group flex min-h-10 items-center gap-3 border-b border-cyan-200 pb-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-100 disabled:cursor-wait disabled:opacity-50"
                  >
                    {contactLoading ? (
                      <LoaderCircle
                        size={14}
                        className="motion-safe:animate-spin"
                      />
                    ) : (
                      <Send
                        size={14}
                        className="transition-transform motion-reduce:transition-none group-hover:translate-x-1"
                      />
                    )}
                    {contactLoading ? "Transmitting" : "Send signal"}
                  </button>

                  <p className="max-w-56 text-right text-[8px] uppercase leading-4 tracking-[0.16em] text-white/25">
                    Usually responding within 24–48 hours.
                  </p>
                </div>

                <p
                  role={contactStatus.type === "error" ? "alert" : "status"}
                  aria-live="polite"
                  className={`mt-4 min-h-4 text-[9px] font-semibold uppercase tracking-[0.16em] ${
                    contactStatus.type === "success"
                      ? "text-emerald-200"
                      : contactStatus.type === "error"
                        ? "text-red-200"
                        : "text-transparent"
                  }`}
                >
                  {contactStatus.message || "Awaiting signal"}
                </p>
              </motion.form>
            </div>

            <footer className="flex shrink-0 items-end justify-between border-t border-white/10 pt-3 text-[8px] uppercase tracking-[0.2em] text-white/25">
              <span>© 2026 Farhan Zulkarnain</span>
              <span>Medan · Indonesia</span>
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}
