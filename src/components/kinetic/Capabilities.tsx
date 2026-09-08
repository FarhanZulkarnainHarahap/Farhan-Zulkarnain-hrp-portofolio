"use client";
import { useState } from "react";
import SpatialSystem from "./SpatialSystem";
import { CollectionState, SectionHeading, SystemIcon } from "./Primitives";
import { type Skill, useCollection } from "./data";
import { useScene } from "./SceneState";
const categories = [
  "Frontend",
  "Backend",
  "Database",
  "Infrastructure",
  "Creative",
  "Tools",
];
function category(skill: Skill) {
  if (/postgres|mongo|mysql|prisma|supabase|redis/i.test(skill.name))
    return "Database";
  if (/docker|vercel|aws|cloud|railway/i.test(skill.name))
    return "Infrastructure";
  if (/figma|three|blender|design/i.test(skill.name)) return "Creative";
  if (skill.category === "FRONTEND") return "Frontend";
  if (skill.category === "BACKEND") return "Backend";
  return "Tools";
}
export default function Capabilities() {
  const state = useCollection<Skill>("/api/skills");
  const [selected, setSelected] = useState("Frontend");
  const { setActive, setMode } = useScene();
  const skills = state.data.filter((skill) => category(skill) === selected);
  return (
    <section
      className="section capabilities"
      id="capabilities"
      onPointerEnter={() => setMode("capability")}
    >
      <SectionHeading
        number="02"
        label="CAPABILITY GRAPH"
        title="One stack. Many connections."
        description="From what you see to what makes it work. Explore the technologies across each layer."
      />
      <CollectionState {...state} empty={!state.data.length} />
      {!state.loading && !state.error && state.data.length > 0 && (
        <div className="capability-layout">
          <div
            className="capability-tabs"
            role="tablist"
            aria-label="Technology layers"
          >
            {categories.map((name, i) => (
              <button
                key={name}
                role="tab"
                id={`tab-${name}`}
                aria-controls="skill-nodes"
                aria-selected={selected === name}
                tabIndex={selected === name ? 0 : -1}
                onClick={() => {
                  setSelected(name);
                  setActive(name);
                }}
                onKeyDown={(event) => {
                  if (
                    [
                      "ArrowDown",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowLeft",
                    ].includes(event.key)
                  ) {
                    event.preventDefault();
                    const next =
                      categories[
                        (i +
                          (["ArrowDown", "ArrowRight"].includes(event.key)
                            ? 1
                            : 5)) %
                          6
                      ];
                    setSelected(next);
                    setActive(next);
                    document.getElementById(`tab-${next}`)?.focus();
                  }
                }}
              >
                <span className="eyebrow">0{i + 1}</span>
                <span>{name}</span>
                <span className="tab-count">
                  {
                    state.data.filter((skill) => category(skill) === name)
                      .length
                  }
                </span>
              </button>
            ))}
          </div>
          <div
            className="capability-graph"
            role="tabpanel"
            id="skill-nodes"
            aria-labelledby={`tab-${selected}`}
          >
            <div className="graph-spatial">
              <SpatialSystem mode="capability" />
            </div>
            <div className="graph-core">
              <SystemIcon kind="capability" />
              <span>{selected.toUpperCase()}</span>
            </div>
            <div className="graph-nodes">
              {skills.map((skill) => (
                <button
                  className="skill-node"
                  key={skill.id}
                  onFocus={() => setActive(skill.name)}
                  onPointerEnter={() => setActive(skill.name)}
                  onPointerLeave={() => setActive(selected)}
                  onClick={() => setActive(skill.name)}
                >
                  <SystemIcon kind="node" />
                  <span>{skill.name}</span>
                </button>
              ))}
            </div>
            <p className="graph-caption eyebrow">
              {skills.length} CONNECTED NODES / {selected.toUpperCase()} LAYER
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
