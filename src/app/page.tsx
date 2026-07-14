import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight,
  LuBadgeCheck,
  LuBlocks,
  LuBriefcaseBusiness,
  LuCalendarDays,
  LuDatabase,
  LuExternalLink,
  LuLayers3,
  LuMapPin,
  LuServer,
  LuSparkles,
} from "react-icons/lu";
import CinematicScrollController from "@/components/motion/CinematicScrollController";
import PublicDock from "@/components/navigation/PublicDock";
import PublicContactForm from "@/components/public/PublicContactForm";
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

async function safeLoad<T>(loader: () => Promise<T>, fallback: T) {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

const systemChapters = [
  { label: "Idea", text: "Translate product intent into a focused interface direction.", icon: LuSparkles },
  { label: "Interface", text: "Shape readable UI systems with responsive interaction states.", icon: LuLayers3 },
  { label: "API", text: "Connect the experience to durable Express endpoints.", icon: LuServer },
  { label: "Database", text: "Keep portfolio content managed through Prisma-backed data.", icon: LuDatabase },
  { label: "Deploy", text: "Ship the frontend and backend as production-ready services.", icon: LuBlocks },
];

const workProcess = [
  ["01", "Discover", "Clarify the product context, audience, constraints, and available data."],
  ["02", "Design", "Create a visual system that supports scanning, trust, and action."],
  ["03", "Develop", "Build typed frontend and backend features with reusable boundaries."],
  ["04", "Integrate", "Connect API, auth, upload, dashboard, and public experiences."],
  ["05", "Test", "Verify routes, forms, responsive behavior, access control, and build output."],
  ["06", "Deploy", "Prepare environment variables and production-safe configuration."],
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

            <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="max-w-3xl">
                <p
                  data-hero-reveal
                  className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200"
                >
                  Nexxus Cinematic Digital Universe
                </p>
                <h1
                  data-hero-reveal
                  className="mt-7 max-w-4xl text-5xl font-black uppercase leading-[0.9] text-white sm:text-7xl lg:text-8xl"
                >
                  Full-stack systems with cinematic clarity.
                </h1>
                <p
                  data-hero-reveal
                  className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
                >
                  A portfolio interface for projects, skills, documents, and experience managed
                  through the existing Express API and Prisma data model.
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
                    About the System
                  </Link>
                </div>
              </div>

              <div data-hero-reveal className="hidden justify-end lg:flex">
                <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-slate-950/42 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur-xl">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["Projects", projects.length],
                      ["Skills", skills.length],
                      ["Experience", experiences.length],
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
                      <LuBadgeCheck className="h-4 w-4" /> Live Data
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Counts come from current API responses, not static portfolio arrays.
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
                  System Philosophy
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  From idea to integrated product.
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
                  Recent builds from the portfolio database.
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
                    No portfolio projects are available from the API right now.
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
                  Skills grouped by Prisma category.
                </h2>
              </div>
              <div className="grid gap-4">
                {Object.entries(groupedSkills).length ? (
                  Object.entries(groupedSkills).map(([category, items]) => (
                    <article key={category} data-cinematic className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100">
                        {category}
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {items.map((skill) => (
                          <span
                            key={skill.id}
                            className="rounded-full bg-white/[0.06] px-3 py-2 text-xs font-bold text-slate-200"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))
                ) : (
                  <div data-cinematic className="rounded-[26px] border border-white/10 bg-white/[0.035] p-6 text-slate-300">
                    No skills are available from the API right now.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="px-5 py-24 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              <div data-cinematic className="max-w-3xl">
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">
                  Experience
                </p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-6xl">
                  Timeline from the backend.
                </h2>
              </div>
              <div className="mt-12 grid gap-5">
                {experiences.length ? (
                  experiences.map((item) => (
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
                  ))
                ) : (
                  <div data-cinematic className="rounded-[28px] border border-white/10 bg-white/[0.035] p-8 text-slate-300">
                    No experience entries are available from the API right now.
                  </div>
                )}
              </div>
            </div>
          </section>

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
                    Contact messages are stored through the existing Express endpoint.
                  </p>
                  {latestDocument ? (
                    <a
                      href={latestDocument.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-100 hover:text-white"
                    >
                      Latest document: {latestDocument.name} <LuExternalLink className="h-4 w-4" />
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
