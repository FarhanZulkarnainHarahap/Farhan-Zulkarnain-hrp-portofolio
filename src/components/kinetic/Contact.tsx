"use client";
import SpatialSystem from "./SpatialSystem";
import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api-client";
import { profile } from "./data";
import { SectionHeading, SystemIcon } from "./Primitives";
import { useScene } from "./SceneState";
export default function Contact() {
  const [state, setState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const { setMode, setActive } = useScene();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const email = String(values.get("email") || "").trim();
    const subject = String(values.get("subject") || "").trim();
    const body = String(values.get("message") || "").trim();
    if (!name || !email || !subject || !body) {
      setState("error");
      setMessage("Please complete every field before sending.");
      return;
    }
    setState("submitting");
    setMessage("");
    try {
      const response = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: `Subject: ${subject}\n\n${body}`,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true)
        throw new Error(
          "Your message could not be sent. Please try again or use email.",
        );
      setState("success");
      setMessage("Message sent. Thank you — I’ll get back to you soon.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "Connection timed out. Please try again or use email.",
      );
    }
  }
  return (
    <section
      className="section contact-section"
      id="transmission"
      onPointerEnter={() => {
        setMode("signal");
        setActive("TRANSMISSION");
      }}
    >
      <SectionHeading
        number="06"
        label="TRANSMISSION INTERFACE"
        title="Let’s build what’s next."
      />
      <div className="contact-layout">
        <div className="contact-copy">
          <p>
            Have an idea, a role, or a challenge?
            <br />
            I’d love to hear about it.
          </p>
          <a className="contact-email" href={`mailto:${profile.email}`}>
            {profile.email} ↗
          </a>
          <div className="story-spatial">
            <SpatialSystem mode="signal" />
          </div>
          <span className="eyebrow">
            <span className="status-dot" /> OPEN CHANNEL / MEDAN, INDONESIA
          </span>
          <div className="button-row">
            <a
              className="text-link"
              href={profile.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
            <a
              className="text-link"
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
        <form
          className="transmission-form"
          onSubmit={submit}
          aria-busy={state === "submitting"}
        >
          <div className="form-header">
            <span className="eyebrow">NEW TRANSMISSION</span>
            <SystemIcon kind="signal" />
          </div>
          <div className="form-row">
            <label>
              Your name
              <input
                name="name"
                required
                autoComplete="name"
                placeholder="How should I call you?"
                maxLength={100}
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                maxLength={254}
              />
            </label>
          </div>
          <label>
            Subject
            <input
              name="subject"
              required
              placeholder="A project, a role, an idea…"
              maxLength={200}
            />
          </label>
          <label>
            Your message
            <textarea
              name="message"
              required
              placeholder="Tell me a little about what you have in mind."
              rows={5}
              maxLength={10000}
            />
          </label>
          <div className="form-submit">
            <span className="eyebrow">
              {state === "submitting"
                ? "SENDING…"
                : "LET’S START A CONVERSATION"}
            </span>
            <button className="button" disabled={state === "submitting"}>
              {state === "submitting" ? "Sending…" : "Send message ↗"}
            </button>
          </div>
          {message && (
            <p
              role={state === "error" ? "alert" : "status"}
              className={`form-message ${state}`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
