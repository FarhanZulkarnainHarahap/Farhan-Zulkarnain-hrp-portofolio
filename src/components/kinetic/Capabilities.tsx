"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { capabilityCategories as categories, skillCategory as category, capabilitySkill } from "@/data/techStack";
const CapabilityMatrix = dynamic(() => import("../three/CapabilityMatrix"), { loading: () => <p>Loading capability matrix…</p> });
import { CollectionState, SectionHeading } from "./Primitives";
import { type Skill, useCollection } from "./data";
import { useScene } from "./SceneState";
export default function Capabilities() {
  const state = useCollection<Skill>("/api/skills");
  const [selected, setSelected] = useState<string>("Frontend");
  const [selectedSkillId, setSelectedSkillId] = useState<string|null>(null);
  const { setActive, setMode } = useScene();
  const skills = useMemo(() => state.data.filter((skill) => category(skill) === selected).map(capabilitySkill), [state.data,selected]);
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
                  setSelectedSkillId(null);
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
                    setSelectedSkillId(null);
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
            className="capability-graph capability-graph-matrix"
            role="tabpanel"
            id="skill-nodes"
            aria-labelledby={`tab-${selected}`}
          >
            <CapabilityMatrix category={selected} skills={skills} selectedSkillId={selectedSkillId} onSelect={setSelectedSkillId} />
          </div>
        </div>
      )}
    </section>
  );
}
