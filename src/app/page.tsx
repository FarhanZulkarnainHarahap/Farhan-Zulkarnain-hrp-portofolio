import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight,
  LuBadgeCheck,
  LuBlocks,
  LuBriefcaseBusiness,
  LuCalendarDays,
  LuExternalLink,
  LuLayers3,
  LuMapPin,
  LuPalette,
  LuServer,
  LuSparkles,
} from "react-icons/lu";
import CinematicScrollController from "@/components/motion/CinematicScrollController";
import PublicDock from "@/components/navigation/PublicDock";
import PublicContactForm from "@/components/public/PublicContactForm";
import SkillIconGrid from "@/components/public/SkillIconGrid";
import CinematicCanvas from "@/components/three/cinematic/CinematicCanvas";
import {
  getDocuments,
  getExperiences,
  getProjects,
  getSkills,
  type Document,
  type Experience,
  type Project,
  type Skill,
} from "@/services/api";

export const dynamic = "force-dynamic";

const PROFILE_IMAGE_URL =
  "https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg";

async function safeLoad<T>(loader: () => Promise<T>, fallback: T) {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

const systemChapters = [
  { label: "Concept", text: "Turn raw ideas into a clear product direction.", icon: LuSparkles },
  { label: "Interface", text: "Design responsive screens that feel polished and easy to use.", icon: LuLayers3 },
  { label: "Motion", text: "Add subtle interaction so the experience feels alive.", icon: LuPalette },
  { label: "Content", text: "Present projects with clean context, visuals, and outcomes.", icon: LuServer },
  { label: "Launch", text: "Prepare the work for a confident production release.", icon: LuBlocks },
];

const workProcess = [
  ["01", "Discover", "Understand the goal, audience, and product direction."],
  ["02", "Design", "Shape a visual language that feels premium and usable."],
  ["03", "Develop", "Build responsive pages, interactions, and reliable product flows."],
  ["04", "Refine", "Improve details, spacing, motion, and visual rhythm."],
  ["05", "Test", "Check layout, forms, mobile behavior, and performance."],
  ["06", "Launch", "Prepare the final experience for production."],
];

function projectTags(project: Project) {
  return project.tags.length ? project.tags : project.features.slice(0, 4);
}

function formatMonthYear(value?: string | null) {
  if (!value) return "Present";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

function groupSkills(skills: Skill[]) {
  return skills.reduce<Record<string, Skill[]>>((groups, skill) => {
    const key = skill.category || "TOOLS";
    groups[key] = groups[key] ? [...groups[key], skill] : [skill];
    return groups;
  }, {});
}

export default async function HomePage() {
  const [projects, skills, experiences, documents] = await Promise.all([
    safeLoad(getProjects, [] as Project[]),
    safeLoad(getSkills, [] as Skill[]),
    safeLoad(getExperiences, [] as Experience[]),
    safeLoad(getDocuments, [] as Document[]),
  ]);

  const featuredProjects = projects.slice(0, 4);
  const groupedSkills = groupSkills(skills);
  const skillGroups = Object.entries(groupedSkills).map(([category, items]) => ({
    category,
    items,
  }));
  const latestDocument = documents[0];

  return (
    <>
      <PublicDock />
      <CinematicScrollController>
        <main className="min-h-screen overflow-x-clip bg-[#02040a] text-slate-100">
          <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden px-5 pb-28 pt-20 sm:px-8 lg:px-12">
            <CinematicCanvas />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#02040a_0%,rgba(2,4,10,0.82)_42%,rgba(2,4,10,0.18)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#02040a] to-transparent" />

            <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(390px,0.68fr)] xl:grid-cols-[minmax(0,0.95fr)_minmax(430px,0.65fr)]">
              <div className="max-w-2xl">
                <p
                  data-hero-reveal
                  className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200"
                >
                  Farhan Zulkarnain Harahap
                </p>
                <h1
                  data-hero-reveal
                  className="mt-7 max-w-3xl text-[clamp(3.25rem,7.2vw,6.6rem)] font-black uppercase leading-[0.88] text-white"
                >
                  Full-stack developer for modern web products.
                </h1>
                <p
                  data-hero-reveal
                  className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
                >
                  I design and build premium digital experiences with clean interfaces,
                  thoughtful motion, and reliable product flows.
                </p>
                <div data-hero-reveal className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/projects"
                    className="inline-flex min-h-13 items-center justify-center gap-3 rounded-2xl bg-cyan-200 px-6 text-[11px] font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-white"
                  >
                    Explore Projects <LuArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex min-h-13 items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-6 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:border-cyan-200/50 hover:bg-cyan-200/10"
                  >
                    About Me
                  </Link>
                </div>
                <div
                  data-hero-reveal
                  className="mt-10 grid max-w-sm gap-4 rounded-[28px] border border-white/10 bg-slate-950/62 p-4 backdrop-blur-xl lg:hidden"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-cyan-200/18 bg-slate-900">
                    <Image
                      src={PROFILE_IMAGE_URL}
                      alt="Farhan Zulkarnain Harahap"
                      fill
                      priority
                      sizes="(max-width: 1024px) 90vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#02040a]/75 via-transparent to-transparent" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                    Full-Stack Web Developer
                  </p>
                </div>
              </div>

              <div data-hero-reveal className="hidden justify-end lg:flex">
                <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur-xl">
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[26px] border border-cyan-200/18 bg-slate-900">
                    <Image
                      src={PROFILE_IMAGE_URL}
                      alt="Farhan Zulkarnain Harahap"
                      fill
                      priority
                      sizes="430px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#02040a]/75 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100">
                        Full-Stack Web Developer
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["Projects", projects.length],
                      ["Skills", skills.length],
                      ["Docs", documents.length],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                        <p className="text-3xl font-black text-white">{value}</p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-3xl border border-cyan-300/15 bg-cyan-300/7 p-5">
                    <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                      <LuBadgeCheck className="h-4 w-4" /> Portfolio Snapshot
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Selected work, skills, and documents from my latest portfolio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative px-5 py-24 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div data-cinematic className="max-w-3xl">
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Creative Direction
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  From concept to polished product.
                </h2>
              </div>
              <div className="mt-12 grid gap-4 lg:grid-cols-5">
                {systemChapters.map(({ label, text, icon: Icon }) => (
                  <article
                    key={label}
                    data-cinematic
                    className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.035] p-5"
                  >
                    <Icon className="h-6 w-6 text-cyan-200" />
                    <h3 className="mt-6 text-xl font-black uppercase text-white">{label}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
                    <span data-story-progress className="absolute inset-x-0 bottom-0 h-px origin-left bg-cyan-200" />
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 py-24 sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr]">
              <div data-cinematic>
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Featured Projects
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  Selected production-ready work.
                </h2>
                <Link
                  href="/projects"
                  className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-2xl border border-cyan-200/25 px-5 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-200/10"
                >
                  View Archive <LuArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {featuredProjects.length ? (
                  featuredProjects.map((project) => (
                    <article
                      key={project.id}
                      data-cinematic
                      className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]"
                    >
                      <Link href={`/projects/${project.id}`} className="block">
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                          <Image
                            src={project.imageUrl}
                            alt={project.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 42vw"
                            className="object-cover transition duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-[#02040a] via-transparent to-transparent" />
                        </div>
                        <div className="p-5">
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
                            {project.caseType || "Portfolio Project"}
                          </p>
                          <h3 className="mt-3 text-2xl font-black uppercase text-white">
                            {project.title}
                          </h3>
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                            {project.description}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {projectTags(project).slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))
                ) : (
                  <div data-cinematic className="rounded-[28px] border border-white/10 bg-white/[0.035] p-8 text-slate-300 md:col-span-2">
                    Projects are being curated for the next portfolio update.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="px-5 py-24 sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr]">
              <div data-cinematic>
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Tech Stack
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  Tools I use to build polished experiences.
                </h2>
              </div>
              <SkillIconGrid groups={skillGroups} />
            </div>
          </section>

          {experiences.length ? (
          <section className="px-5 py-24 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div data-cinematic className="max-w-3xl">
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Experience
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  Professional timeline.
                </h2>
              </div>
              <div className="mt-12 grid gap-5">
                {experiences.map((item) => (
                    <article key={item.id} data-cinematic className="grid gap-5 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 lg:grid-cols-[0.28fr_1fr]">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-bold text-cyan-100">
                          <LuCalendarDays className="h-4 w-4" />
                          {formatMonthYear(item.startDate)} - {item.current ? "Present" : formatMonthYear(item.endDate)}
                        </p>
                        {item.location ? (
                          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                            <LuMapPin className="h-4 w-4" /> {item.location}
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase text-white">{item.title}</h3>
                        <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                          {item.company}
                        </p>
                        {item.description ? (
                          <p className="mt-4 text-sm leading-7 text-slate-300">{item.description}</p>
                        ) : null}
                        <div className="mt-5 flex flex-wrap gap-2">
                          {item.technologies.map((tech) => (
                            <span key={tech} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          </section>
          ) : null}

          <section className="px-5 py-24 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div data-cinematic>
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Work Process
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  A practical delivery path.
                </h2>
              </div>
              <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workProcess.map(([step, title, text]) => (
                  <article key={step} data-cinematic className="rounded-[26px] border border-white/10 bg-white/[0.035] p-6">
                    <p className="text-sm font-black text-cyan-200">{step}</p>
                    <h3 className="mt-5 text-2xl font-black uppercase text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="contact" className="px-5 pb-40 pt-24 sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1fr]">
              <div data-cinematic>
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Contact
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  Let&apos;s build something meaningful.
                </h2>
                <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <LuBriefcaseBusiness className="h-4 w-4 text-cyan-200" />
                    Tell me what you want to build, and I&apos;ll respond with a clear next step.
                  </p>
                  {latestDocument ? (
                    <a
                      href={latestDocument.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-100 hover:text-white"
                    >
                      View document: {latestDocument.name} <LuExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
              <div data-cinematic className="rounded-[30px] border border-white/10 bg-slate-950/52 p-5 backdrop-blur-xl sm:p-7">
                <PublicContactForm />
              </div>
            </div>
          </section>
        </main>
      </CinematicScrollController>
    </>
  );
}
