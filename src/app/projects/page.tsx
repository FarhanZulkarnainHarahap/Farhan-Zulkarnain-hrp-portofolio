import type { Metadata } from "next";
import { getDocuments, getProjects } from "@/services/api";
import ProjectCollection from "./_components/ProjectCollection";
import ProjectsSidebar from "./_components/ProjectsSidebar";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected portfolio projects and supporting documents.",
};

// Memastikan contoh dijalankan pada request, bukan diprerender saat build.
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  /*
   * Empat pemanggilan dimulai secara paralel. Karena setiap pasangan memakai
   * URL dan fetch options yang identik, request memoization Next.js membuat
   * backend hanya menerima satu request projects dan satu request documents.
   */
  const [
    mainProjects,
    mainDocuments,
    sidebarProjects,
    sidebarDocuments,
  ] = await Promise.all([
    getProjects(),
    getDocuments(),
    getProjects(),
    getDocuments(),
  ]);

  return (
    <main className="min-h-screen bg-[#050816] px-5 py-12 text-white sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <ProjectCollection
          projects={mainProjects}
          documents={mainDocuments}
        />
        <ProjectsSidebar
          projects={sidebarProjects}
          documents={sidebarDocuments}
        />
      </div>
    </main>
  );
}
