"use client";
import Modal from "@/components/kinetic/Modal";

import { useState, useEffect, useMemo } from "react";
import {
  LuArrowLeft,
  LuSave,
  LuType,
  LuLayers,
  LuLoader,
  LuShieldCheck,
  LuCircleCheck,
  LuArrowRight,
  LuX,
} from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Import all icon libraries
import { skillIcons } from "@/lib/skill-icons";
import { apiFetch } from "@/lib/api-client";
import { resolveSkillIconKey } from "@/lib/skill-icon-resolver";

type SkillCategory = "FRONTEND" | "BACKEND" | "TOOLS" | "OTHERS";

const CATEGORY_OPTIONS: ReadonlyArray<{
  value: SkillCategory;
  label: string;
}> = [
  { value: "FRONTEND", label: "Frontend" },
  { value: "BACKEND", label: "Backend" },
  { value: "TOOLS", label: "Tools" },
  { value: "OTHERS", label: "Other / Auto-detect" },
];

export default function ManageSkillPage() {
  const router = useRouter();
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState<SkillCategory>("FRONTEND");
  const [loading, setLoading] = useState(false);
  const [createdSkill, setCreatedSkill] = useState<{
    name: string;
    category: string;
  } | null>(null);

  const allIcons = skillIcons;

  const detectedIcon = useMemo(() => {
    if (!skillName) return "";
    return resolveSkillIconKey(skillName, allIcons);
  }, [skillName, allIcons]);

  useEffect(() => {
    if (!createdSkill) return;

    const closeModal = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCreatedSkill(null);
    };

    window.addEventListener("keydown", closeModal);
    return () => window.removeEventListener("keydown", closeModal);
  }, [createdSkill]);

  const goToSkillList = () => {
    router.push("/admin/skill");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName) return alert("Skill name is required!");

    setLoading(true);
    try {
      const response = await apiFetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: skillName,
          iconName: detectedIcon || skillName,
          category: category,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setCreatedSkill({ name: skillName, category });
      } else {
        alert("Failed: " + result.error);
      }
    } catch {
      alert("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-[var(--section)]">
      {createdSkill && (
        <Modal
          label="Skill created"
          onClose={() => setCreatedSkill(null)}
          busy={false}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-emerald-100 bg-[var(--card)] p-8 text-center shadow-2xl shadow-emerald-950/20 md:p-10">
            <button
              type="button"
              onClick={() => setCreatedSkill(null)}
              aria-label="Close modal"
              className="absolute right-5 top-5 rounded-full p-2 text-slate-300 transition-colors hover:bg-[var(--section)] hover:text-[var(--muted)]"
            >
              <LuX size={18} />
            </button>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-[var(--section)] text-emerald-500 shadow-inner">
              <LuCircleCheck size={42} />
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500">
              Publish Successful
            </p>
            <h2
              id="skill-success-title"
              className="mt-3 text-2xl font-black uppercase tracking-tight text-[var(--text)]"
            >
              Skill Created Successfully
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              <span className="font-bold text-[var(--text)]">
                {createdSkill.name}
              </span>{" "}
              was added to the{" "}
              <span className="font-bold text-[var(--secondary)]">
                {createdSkill.category}
              </span>
              .
            </p>

            <button
              type="button"
              onClick={goToSkillList}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-[var(--primary)] px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              View Skill List
              <LuArrowRight size={18} />
            </button>
          </div>
        </Modal>
      )}

      {/* Navigation */}
      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/admin/skill"
          className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--secondary)] transition-all font-bold text-xs uppercase tracking-tighter group"
        >
          <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
          Back
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-[var(--text)]">
            Add Skill
          </h1>
          <p className="text-[10px] text-[var(--secondary)] font-bold uppercase tracking-[0.2em] mt-1">
            Auto Icon Detection
          </p>
        </div>
      </div>

      <div className="bg-[var(--card)] p-8 md:p-12 rounded-[48px] border border-[var(--border)] shadow-2xl shadow-indigo-100/50">
        {/* Preview Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-32 h-32 bg-[var(--section)] rounded-[40px] shadow-inner flex items-center justify-center border border-white transition-all duration-500 transform hover:scale-110">
            {detectedIcon && allIcons[detectedIcon] ? (
              (() => {
                const Icon = allIcons[detectedIcon];
                return <Icon className="text-[var(--secondary)]" size={54} />;
              })()
            ) : (
              <LuShieldCheck className="text-slate-200" size={54} />
            )}
          </div>
          <div className="mt-5 px-5 py-1.5 bg-[var(--section)] rounded-full border border-indigo-100">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--secondary)]">
              {detectedIcon
                ? `Detected: ${detectedIcon}`
                : "Waiting for Input..."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Single Input */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-2">
              <LuType size={14} className="text-[var(--secondary)]" /> Skill
              Name
            </label>
            <input
              aria-label="Example: Next.js, Laravel, Docker..."
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="Example: Next.js, Laravel, Docker..."
              className="w-full bg-[var(--section)] border border-[var(--border)] rounded-lg px-8 py-5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-[var(--text)] text-lg shadow-sm"
            />
          </div>

          {/* Category */}
          <div className="space-y-4">
            <label
              htmlFor="skill-category"
              className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]"
            >
              <LuLayers size={14} className="text-[var(--secondary)]" />{" "}
              Category
            </label>
            <div className="relative">
              <select
                aria-label="category"
                id="skill-category"
                name="category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as SkillCategory)
                }
                required
                className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--section)] px-8 py-5 text-base font-bold text-[var(--text)] shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <LuLayers
                aria-hidden="true"
                className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 text-[var(--secondary)]"
                size={18}
              />
            </div>
            <p className="ml-2 text-xs leading-relaxed text-[var(--muted)]">
              Database dan UI/UX dari data lama tetap dikenali otomatis
              berdasarkan nama skill.
            </p>
          </div>

          {/* Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] hover:bg-indigo-700 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-indigo-100 transition-all active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <LuLoader className="animate-spin" size={20} />
              ) : (
                <LuSave size={20} />
              )}
              {loading ? "SAVING..." : "PUBLISH SKILL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
