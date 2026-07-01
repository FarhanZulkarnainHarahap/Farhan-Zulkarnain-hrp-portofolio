"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { LuArrowLeft, LuCloudUpload, LuCircleCheck, LuLink, LuCode, LuLoader } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

export default function UploadPortoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please choose a project image first!");

    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("demoUrl", formData.demoUrl);
    data.append("repoUrl", formData.repoUrl);
    data.append("caseType", formData.caseType);
    data.append("tags", formData.tags);
    data.append("caseProblem", formData.caseProblem);
    data.append("caseSolution", formData.caseSolution);
    data.append("caseResult", formData.caseResult);
    data.append("features", formData.features);
    data.append("image", file);

    try {
      const response = await apiFetch("/api/portofolios", {
        method: "POST",
        body: data,
        credentials: "include", 
      });

      const result = await response.json();

      if (result.success) {
        setSuccessOpen(true);
        router.refresh();
      } else {
        alert("Failed: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {successOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-emerald-100 bg-white p-8 text-center shadow-2xl shadow-emerald-950/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
              <LuCircleCheck size={34} />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-900">
              Project Created
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
              Project data has been created successfully and is ready to appear on the portfolio page.
            </p>
            <button
              type="button"
              onClick={() => router.push("/admin/portofolio")}
              className="mt-7 w-full rounded-2xl bg-emerald-600 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95"
            >
              Back to Projects
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-10 flex items-center justify-between">
        <Link 
          href="/admin/portofolio" 
          className="flex items-center gap-2 text-slate-500 hover:text-[#6f42c1] transition-colors text-sm font-bold group"
        >
          <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
          Back to List
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">
            New Project
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Portfolio Management
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left Column: Form Data */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-50/50 p-8 rounded-4xl border border-slate-100 space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Project Title</label>
              <input 
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter project name..." 
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-[#6f42c1] transition-all font-bold text-slate-700" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
              <textarea 
                rows={5}
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe this project..." 
                className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-purple-500/10 font-bold text-slate-700 focus:border-[#6f42c1] transition-all"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px]  uppercase tracking-widest font-black text-slate-400 mb-2">Demo URL</label>
                <div className="relative">
                  <input 
                    type="url"
                    name="demoUrl"
                    value={formData.demoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com" 
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-4 font-bold text-slate-700 focus:ring-purple-500/10 focus:border-[#6f42c1] transition-all text-sm" 
                  />
                  <LuLink className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Repository URL</label>
                <div className="relative">
                  <input 
                    type="url"
                    name="repoUrl"
                    value={formData.repoUrl}
                    onChange={handleChange}
                    placeholder="https://github.com..." 
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-4 outline-none  font-bold text-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-[#6f42c1] transition-all text-sm" 
                  />
                  <LuCode className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-4xl border border-blue-100 bg-blue-50/40 p-8">
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Case Study Content</p>
              <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-slate-800">
                Project Story
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                This content appears inside the public project case study modal.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Project Type</label>
                <input
                  type="text"
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleChange}
                  placeholder="E-Commerce Platform, Chat Application, Productivity App..."
                  className="w-full bg-white border border-blue-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tags / Tech Stack</label>
                <textarea
                  rows={3}
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Next.js, TypeScript, Tailwind, PostgreSQL"
                  className="w-full bg-white border border-blue-100 rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 focus:border-blue-500 transition-all"
                />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Separate with comma or new line
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Problem</label>
                  <textarea
                    rows={4}
                    name="caseProblem"
                    value={formData.caseProblem}
                    onChange={handleChange}
                    placeholder="What problem does this project solve?"
                    className="w-full bg-white border border-blue-100 rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Solution</label>
                  <textarea
                    rows={4}
                    name="caseSolution"
                    value={formData.caseSolution}
                    onChange={handleChange}
                    placeholder="How did you build or design the solution?"
                    className="w-full bg-white border border-blue-100 rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Result</label>
                  <textarea
                    rows={4}
                    name="caseResult"
                    value={formData.caseResult}
                    onChange={handleChange}
                    placeholder="What was improved, delivered, or achieved?"
                    className="w-full bg-white border border-blue-100 rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Features</label>
                <textarea
                  rows={4}
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  placeholder="Product catalog, Checkout flow, Admin dashboard, User profile"
                  className="w-full bg-white border border-blue-100 rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 focus:border-blue-500 transition-all"
                />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Separate with comma or new line
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upload & Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-2 hover:border-[#6f42c1] transition-colors group relative overflow-hidden">
            {preview ? (
              <div className="relative w-full aspect-video rounded-[36px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full text-xs"
                > Remove </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-16 cursor-pointer bg-slate-50/50 rounded-[36px] group-hover:bg-purple-50/50 transition-all">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-[#6f42c1] transition-all group-hover:scale-110">
                  <LuCloudUpload size={32} />
                </div>
                <p className="mt-5 text-sm font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Choose Screenshot</p>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Format: JPG, PNG (16:9)</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#6f42c1] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-purple-200 hover:bg-[#5a32a3] transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <LuLoader className="animate-spin" /> : <LuCircleCheck size={20} />}
              {loading ? "Publishing..." : "Publish Project"}
            </button>
            <button 
              type="button"
              onClick={() => router.back()}
              className="w-full bg-white text-slate-400 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:text-red-500 transition-colors"
            >
              Cancel & Go Back
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
