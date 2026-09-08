"use client";
import SpatialSystem from "./SpatialSystem";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CollectionState, SectionHeading, SystemIcon } from "./Primitives";
import { useCollection, type Experience } from "./data";
import { useScene } from "./SceneState";
const milestones = [
  {
    title: "Independent Web Development",
    company: "Self-directed learning",
    description:
      "Built a foundation in HTML, CSS, JavaScript, Git, and responsive interfaces.",
    technologies: ["HTML", "CSS", "JavaScript"],
    period: "FOUNDATION",
  },
  {
    title: "Full-Stack Bootcamp",
    company: "Purwadhika",
    description:
      "Structured training in full-stack delivery, database modeling, and team workflows.",
    technologies: ["React", "Next.js", "Node.js"],
    period: "STRUCTURED LEARNING",
  },
  {
    title: "Laravel Training",
    company: "Backend development",
    description:
      "Explored MVC architecture, routing, validation, and application maintenance.",
    technologies: ["Laravel", "MVC"],
    period: "BACKEND EXPANSION",
  },
  {
    title: "Data-entry Internship",
    company: "PT Tokio Marine Indonesia",
    description:
      "Developed discipline in accuracy, operational detail, and professional communication.",
    technologies: [],
    period: "PROFESSIONAL PRACTICE",
  },
  {
    title: "Full-Stack Product Builds",
    company: "Independent projects",
    description:
      "Building deployable products, dashboards, and API integrations from idea to implementation.",
    technologies: ["Next.js", "Express", "PostgreSQL"],
    period: "CURRENT FOCUS",
  },
];
export default function Trajectory() {
  const state = useCollection<Experience>("/api/experiences");
  const { setMode, setActive } = useScene();
  const reduced = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const items = state.data.length
    ? state.data.map((item) => ({
        ...item,
        period: `${new Date(item.startDate).getFullYear()} — ${item.current ? "PRESENT" : item.endDate ? new Date(item.endDate).getFullYear() : ""}`,
      }))
    : milestones;
  return (
    <section className="section trajectory" id="trajectory">
      <div className="story-spatial">
        <SpatialSystem mode="trajectory" />
      </div>
      <SectionHeading
        number="03"
        label="TRAJECTORY MAP"
        title="Every step adds a dimension."
        description="A path through learning, professional practice, and building real products."
      />
      <CollectionState
        loading={state.loading}
        error={state.error}
        retry={state.retry}
      />
      {!state.loading && (
        <div className="trajectory-path">
          <svg
            className="trajectory-route"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M20 40 C200 40 220 95 350 95 S540 160 685 160 C1030 160 1030 420 720 420 S410 430 350 430 C230 430 220 350 20 350" />
          </svg>
          {items.map((item, i) => (
            <motion.article
              key={item.title + i}
              className={`trajectory-stop ${activeStep === i ? "active" : ""}`}
              initial={false}
              whileInView={reduced ? {} : { opacity: 1 }}
              onViewportEnter={() => {
                setActiveStep(i);
                setMode("trajectory");
                setActive(item.title);
              }}
              viewport={{ amount: 0.6 }}
            >
              <div className="trajectory-node">
                <span>0{i + 1}</span>
                <SystemIcon kind="trajectory" />
              </div>
              <p className="eyebrow">{item.period}</p>
              <h3>{item.title}</h3>
              <p className="trajectory-company">{item.company}</p>
              <p>{item.description}</p>
              <div className="tags">
                {item.technologies.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      )}
      {!state.loading && !state.data.length && (
        <p className="eyebrow trajectory-note">
          PROFILE MILESTONES / DATED EXPERIENCE ENTRIES NOT YET PUBLISHED
        </p>
      )}
    </section>
  );
}
