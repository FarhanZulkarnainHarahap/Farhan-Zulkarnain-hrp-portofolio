import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ProjectNotFound() {
  return (
    <>
      <Navbar />
      <main className="portfolio-bg grid min-h-screen place-items-center px-6 text-center text-white">
        <div className="max-w-lg">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">
            Project Not Found
          </p>
          <h1 className="mt-5 text-4xl font-black uppercase">Case study unavailable</h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            The project slug is not available in the current project data.
          </p>
          <Link
            href="/projects"
            className="mt-7 inline-flex min-h-12 items-center rounded-full bg-blue-600 px-5 text-xs font-black uppercase tracking-[0.16em] text-white"
          >
            Back to Projects
          </Link>
        </div>
      </main>
    </>
  );
}
