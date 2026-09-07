"use client";
import { useConfirm } from "@/components/kinetic/Confirmation";
import { useRef, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api-client";
import { type Experience, useCollection } from "@/components/kinetic/data";
import { CollectionState } from "@/components/kinetic/Primitives";
export default function ExperiencePage() {
  const confirm = useConfirm();
  const state = useCollection<Experience>("/api/experiences");
  const dialog = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title")).trim(),
      company: String(form.get("company")).trim(),
      location: String(form.get("location")).trim(),
      startDate: form.get("startDate"),
      endDate: form.get("current") ? null : form.get("endDate") || null,
      current: Boolean(form.get("current")),
      description: String(form.get("description")).trim(),
      technologies: String(form.get("technologies"))
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      sortOrder: Number(form.get("sortOrder")),
    };
    if (
      !payload.title ||
      !payload.company ||
      (payload.endDate && String(payload.endDate) < String(payload.startDate))
    ) {
      setError("Enter a title, company, and an end date after the start date.");
      setBusy(false);
      return;
    }
    try {
      const response = await apiFetch(
        `/api/experiences${editing ? `/${editing.id}` : ""}`,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error();
      dialog.current?.close();
      state.retry();
      setNotice("Experience saved.");
    } catch {
      setError("Unable to save experience. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(item: Experience) {
    if (!(await confirm(`Delete “${item.title}”? This cannot be undone.`)))
      return;
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch(`/api/experiences/${item.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      state.retry();
      setNotice("Experience deleted.");
    } catch {
      setError("Unable to delete experience. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">TRAJECTORY DATA</p>
          <h1>Experience</h1>
          <p>Manage the milestones published on your journey.</p>
        </div>
        <button
          className="button"
          onClick={() => {
            setEditing(null);
            setError("");
            setDialogOpen(true);
            setEditorVersion((value) => value + 1);
            dialog.current?.showModal();
          }}
        >
          Add experience +
        </button>
      </div>
      <CollectionState {...state} empty={!state.data.length} />
      {notice && <p role="status">{notice}</p>}
      {error && !dialogOpen && <p role="alert">{error}</p>}
      <div className="experience-list">
        {state.data.map((item) => (
          <article key={item.id}>
            <div>
              <h2>{item.title}</h2>
              <p>
                {item.company} · {item.startDate.slice(0, 10)} —{" "}
                {item.current ? "Present" : item.endDate?.slice(0, 10)}
              </p>
            </div>
            <div>
              <button
                className="button secondary"
                onClick={() => {
                  setEditing(item);
                  setError("");
                  setDialogOpen(true);
                  setEditorVersion((value) => value + 1);
                  dialog.current?.showModal();
                }}
              >
                Edit
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => remove(item)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      <dialog
        ref={dialog}
        onClose={() => setDialogOpen(false)}
        className="admin-dialog"
        aria-labelledby="experience-title"
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <form key={`${editing?.id || "new"}-${editorVersion}`} onSubmit={save}>
          <h2 id="experience-title">{editing ? "Edit" : "Add"} experience</h2>
          {[
            ["title", "Role", "text"],
            ["company", "Company / organization", "text"],
            ["location", "Location", "text"],
            ["startDate", "Start date", "date"],
            ["endDate", "End date", "date"],
            ["sortOrder", "Display order", "number"],
          ].map(([name, label, type]) => (
            <label key={name}>
              {label}
              <input
                name={name}
                type={type}
                required={["title", "company", "startDate"].includes(name)}
                defaultValue={String(
                  editing?.[name as keyof Experience] ??
                    (name === "sortOrder" ? 0 : ""),
                ).slice(0, type === "date" ? 10 : undefined)}
              />
            </label>
          ))}
          <label className="checkbox-label">
            <input
              name="current"
              type="checkbox"
              defaultChecked={editing?.current}
            />{" "}
            Current position
          </label>
          <label>
            Description
            <textarea
              name="description"
              rows={4}
              defaultValue={editing?.description}
            />
          </label>
          <label>
            Technologies, separated by commas
            <input
              name="technologies"
              defaultValue={editing?.technologies.join(", ")}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <div className="button-row">
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : "Save experience"}
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
