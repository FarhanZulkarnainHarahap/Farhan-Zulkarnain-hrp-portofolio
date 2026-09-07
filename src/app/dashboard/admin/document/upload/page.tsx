"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  LuArrowLeft,
  LuFileUp,
  LuShieldCheck,
  LuRefreshCw,
  LuFileText,
  LuX,
} from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

export default function UploadDocPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Resume"); // Default category
  const maxFileSize = 4 * 1024 * 1024;

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const isPdf =
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "" ||
        selectedFile.type === "application/octet-stream";

      if (!isPdf || !selectedFile.name.toLowerCase().endsWith(".pdf")) {
        alert("Only PDF files are allowed!");
        e.target.value = "";
        return;
      }

      if (selectedFile.size > maxFileSize) {
        alert("PDF size must be 4MB or less.");
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
    }
  };

  // Submit to backend
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !name) return alert("Name and file are required!");

    setLoading(true);
    const data = new FormData();
    data.append("name", name);
    data.append("category", category);
    data.append("file", file);
    try {
      const response = await apiFetch("/api/documents", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      const result = await response.json().catch(() => ({
        success: false,
        error: `Server returned status ${response.status}`,
      }));

      if (response.ok && result.success) {
        alert("Document uploaded successfully!");
        router.push("/admin/document");
        router.refresh();
      } else {
        alert("Failed: " + (result.error || "Document upload failed"));
      }
    } catch (error) {
      console.error(error);
      alert("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Link
        href="/admin/document"
        className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--secondary)] mb-6 text-sm font-bold uppercase tracking-tighter group"
      >
        <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
        Back
      </Link>

      <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-lg p-8 md:p-10 shadow-sm">
        <div className="w-20 h-20 bg-[var(--section)] text-[var(--secondary)] rounded-lg flex items-center justify-center mx-auto mb-6">
          <LuFileUp size={40} />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-[var(--text)] mb-2 tracking-tight">
            Upload Document
          </h2>
          <p className="text-[var(--muted)] text-sm italic">
            Upload your CV, diploma, or certificate in PDF format.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Document Name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 ml-1">
              Document Name
            </label>
            <input
              aria-label="Document name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: CV_Farhan_2026"
              className="w-full bg-[var(--section)] border-none rounded-xl px-5 py-4 text-sm focus:ring-2  focus:ring-indigo-100 outline-none font-medium text-[var(--text)]"
            />
          </div>

          {/* Select Category */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 ml-1">
              Category
            </label>
            <select
              aria-label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[var(--section)] border-none rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-[var(--text)] appearance-none"
            >
              <option value="Resume">CV / Resume</option>
              <option value="Certificate">Certificate</option>
              <option value="Education">Diploma / Education Document</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Dropzone/File Picker */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 ml-1">
              Document File (PDF)
            </label>
            {file ? (
              <div className="flex items-center justify-between bg-[var(--section)] border-2 border-indigo-100 rounded-lg p-4 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--card)] rounded-lg flex items-center justify-center text-[var(--secondary)] shadow-sm">
                    <LuFileText size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-indigo-900 truncate max-w-50">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-indigo-400 uppercase font-black">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove selected file"
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-red-50 text-[var(--muted)] hover:text-red-500 rounded-full transition-colors"
                >
                  <LuX size={18} />
                </button>
              </div>
            ) : (
              <label className="block w-full py-10 bg-[var(--section)] border-2 border-dashed border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--section)] hover:border-indigo-200 transition-all text-center group">
                <span className="text-xs font-bold text-[var(--muted)] group-hover:text-[var(--secondary)] uppercase tracking-widest">
                  Click to choose a PDF file
                </span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-[var(--primary)] text-white py-4 rounded-lg font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <LuRefreshCw className="animate-spin" />
            ) : (
              <LuShieldCheck size={20} />
            )}
            {loading ? "Uploading..." : "Save Document"}
          </button>
        </form>
      </div>
    </div>
  );
}
