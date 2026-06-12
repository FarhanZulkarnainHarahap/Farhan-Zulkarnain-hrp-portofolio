"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import {
  LuCircleCheck,
  LuExternalLink,
  LuImagePlus,
  LuLayers,
  LuLoader,
  LuPencilLine,
  LuPlus,
  LuSave,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string | null;
  repoUrl: string | null;
  caseType?: string | null;
  caseProblem?: string | null;
  caseSolution?: string | null;
  caseResult?: string | null;
  tags?: string[] | string | null;
  features?: string[] | string | null;
}

type ProjectForm = {
  title: string;
  description: string;
  demoUrl: string;
  repoUrl: string;
  caseType: string;
  tags: string;
  caseProblem: string;
  caseSolution: string;
  caseResult: string;
  features: string;
};

const emptyForm: ProjectForm = {
  title: "",
  description: "",
  demoUrl: "",
  repoUrl: "",
  caseType: "",
  tags: "",
  caseProblem: "",
  caseSolution: "",
  caseResult: "",
  features: "",
};

const listToText = (value?: string[] | string | null) => {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value.join(", ") : value;
};

const projectToForm = (project: Project): ProjectForm => ({
  title: project.title,
  description: project.description,
  demoUrl: project.demoUrl ?? "",
  repoUrl: project.repoUrl ?? "",
  caseType: project.caseType ?? "",
  tags: listToText(project.tags),
  caseProblem: project.caseProblem ?? "",
  caseSolution: project.caseSolution ?? "",
  caseResult: project.caseResult ?? "",
  features: listToText(project.features),
});

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<ProjectForm>(emptyForm);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchPortfolios = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/portofolios`, {
        cache: "no-store",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setEditForm(projectToForm(project));
    setEditFile(null);
    setEditPreview(null);
  };

  const closeEditModal = () => {
    if (updating) {
      return;
    }

    setEditingProject(null);
    setEditForm(emptyForm);
    setEditFile(null);
    setEditPreview(null);
  };

  const handleEditChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleEditFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setEditFile(selectedFile);
    setEditPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();

    if (!editingProject) {
      return;
    }

    setUpdating(true);
    const data = new FormData();
    data.append("title", editForm.title);
    data.append("description", editForm.description);
    data.append("demoUrl", editForm.demoUrl);
    data.append("repoUrl", editForm.repoUrl);
    data.append("caseType", editForm.caseType);
    data.append("tags", editForm.tags);
    data.append("caseProblem", editForm.caseProblem);
    data.append("caseSolution", editForm.caseSolution);
    data.append("caseResult", editForm.caseResult);
    data.append("features", editForm.features);

    if (editFile) {
      data.append("image", editFile);
    }

    try {
      const response = await fetch(`${API_URL}/api/portofolios/${editingProject.id}`, {
        method: "PUT",
        body: data,
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setProjects((current) =>
          current.map((project) => (project.id === editingProject.id ? result.data : project)),
        );
        setEditingProject(null);
        setEditFile(null);
        setEditPreview(null);
        setSuccessMessage("Project updated successfully.");
      } else {
        alert("Failed to update project: " + (result.error || "Server error"));
      }
    } catch (error) {
      console.error("Error update:", error);
      alert("Connection error.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the "${title}" project?`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`${API_URL}/api/portofolios/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setProjects((prev) => prev.filter((project) => project.id !== id));
        alert("Project deleted successfully");
      } else {
        alert("Failed to delete project: " + (result.message || "Server error"));
      }
    } catch (error) {
      console.error("Error delete:", error);
      alert("Connection error.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPortfolios();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchPortfolios]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LuLoader className="h-10 w-10 animate-spin text-[#6f42c1]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {successMessage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-blue-100 bg-white p-8 text-center shadow-2xl shadow-blue-950/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
              <LuCircleCheck size={34} />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-900">
              Update Complete
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="mt-7 w-full rounded-2xl bg-blue-600 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 z-[900] flex items-start justify-center overflow-y-auto bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
          <form
            onSubmit={handleUpdate}
            className="my-auto w-full max-w-5xl rounded-[36px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 md:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6f42c1]">
                  Edit Project
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {editingProject.title}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Update project information and public case study content.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Close edit modal"
              >
                <LuX size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                <div className="rounded-4xl border border-slate-100 bg-slate-50/60 p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Project Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={editForm.title}
                        onChange={handleEditChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 outline-none transition-all focus:border-[#6f42c1] focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        name="description"
                        required
                        value={editForm.description}
                        onChange={handleEditChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-700 outline-none transition-all focus:border-[#6f42c1] focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Demo URL
                      </label>
                      <input
                        type="url"
                        name="demoUrl"
                        value={editForm.demoUrl}
                        onChange={handleEditChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-[#6f42c1] focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Repository URL
                      </label>
                      <input
                        type="url"
                        name="repoUrl"
                        value={editForm.repoUrl}
                        onChange={handleEditChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-[#6f42c1] focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-4xl border border-blue-100 bg-blue-50/40 p-6">
                  <div className="mb-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                      Case Study
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-slate-800">
                      Public Project Story
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Project Type
                      </label>
                      <input
                        type="text"
                        name="caseType"
                        value={editForm.caseType}
                        onChange={handleEditChange}
                        placeholder="E-Commerce Platform, Chat Application..."
                        className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 font-bold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Tags / Tech Stack
                      </label>
                      <textarea
                        rows={3}
                        name="tags"
                        value={editForm.tags}
                        onChange={handleEditChange}
                        placeholder="Next.js, TypeScript, Tailwind"
                        className="w-full rounded-2xl border border-blue-100 bg-white p-5 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {[
                        ["caseProblem", "Problem", "What problem does this project solve?"],
                        ["caseSolution", "Solution", "How did you build the solution?"],
                        ["caseResult", "Result", "What was achieved?"],
                      ].map(([name, label, placeholder]) => (
                        <div key={name}>
                          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {label}
                          </label>
                          <textarea
                            rows={5}
                            name={name}
                            value={editForm[name as keyof ProjectForm]}
                            onChange={handleEditChange}
                            placeholder={placeholder}
                            className="w-full rounded-2xl border border-blue-100 bg-white p-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Features
                      </label>
                      <textarea
                        rows={4}
                        name="features"
                        value={editForm.features}
                        onChange={handleEditChange}
                        placeholder="Product catalog, Checkout flow, Admin dashboard"
                        className="w-full rounded-2xl border border-blue-100 bg-white p-5 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Separate tags and features with comma or new line
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[32px] border-2 border-dashed border-slate-200 bg-white p-2">
                  <div className="relative aspect-video overflow-hidden rounded-[26px] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editPreview || editingProject.imageUrl}
                      alt={editingProject.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-purple-50 hover:text-[#6f42c1]">
                    <LuImagePlus size={18} />
                    Change Image
                    <input type="file" className="hidden" accept="image/*" onChange={handleEditFileChange} />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#6f42c1] py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-purple-200 transition-all hover:bg-[#5a32a3] active:scale-95 disabled:opacity-50"
                >
                  {updating ? <LuLoader className="animate-spin" /> : <LuSave size={18} />}
                  {updating ? "Updating..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="w-full rounded-2xl bg-slate-50 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-red-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tighter text-slate-800">
            <LuLayers className="text-[#6f42c1]" />
            Portfolio Projects
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Showcase your best work to the world.</p>
        </div>

        <Link href="/admin/portofolio/upload">
          <button className="flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-100 transition-all hover:bg-green-700 active:scale-95">
            <LuPlus size={20} />
            Upload New Project
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className={`group flex flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200 ${deletingId === project.id ? "opacity-50 grayscale" : ""}`}
            >
              <div className="relative h-56 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.imageUrl}
                  className="h-full w-full object-cover transition-all duration-700 group-hover:rotate-2 group-hover:scale-110"
                  alt={project.title}
                />

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={project.demoUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white p-3 text-black shadow-xl transition-transform hover:scale-110"
                  >
                    <LuExternalLink size={20} />
                  </a>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold leading-tight text-slate-800 transition-colors group-hover:text-[#6f42c1]">
                    {project.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{project.description}</p>
                </div>

                <div className="mt-auto flex gap-3 border-t border-slate-50 pt-6">
                  <button
                    type="button"
                    onClick={() => openEditModal(project)}
                    className="flex flex-2 items-center justify-center gap-2 rounded-2xl bg-slate-50 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition-all hover:bg-[#6f42c1] hover:text-white"
                  >
                    <LuPencilLine size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(project.id, project.title)}
                    disabled={deletingId === project.id}
                    className="flex flex-1 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm shadow-red-100 transition-all hover:bg-red-500 hover:text-white disabled:cursor-not-allowed"
                  >
                    {deletingId === project.id ? (
                      <LuLoader size={18} className="animate-spin" />
                    ) : (
                      <LuTrash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="font-bold uppercase tracking-widest text-slate-400">
              No projects have been uploaded yet.
            </p>
          </div>
        )}

        <Link
          href="/admin/portofolio/upload"
          className="group flex flex-col items-center justify-center rounded-4xl border-4 border-dashed border-slate-100 p-8 text-slate-300 transition-all hover:border-[#6f42c1] hover:bg-indigo-50/30 hover:text-[#6f42c1]"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-100 transition-all group-hover:border-[#6f42c1]">
            <LuPlus size={32} />
          </div>
          <p className="text-lg font-black uppercase tracking-tighter">Add New Case Study</p>
        </Link>
      </div>
    </div>
  );
}
