/**
 * Technology orbit model (hero). One definition shared by the static SVG fallback (now, and
 * whenever WebGL is unavailable) and the WebGL orbital system of Fase 6, so both always show the
 * same rings and the same skills.
 *
 * Skills come only from the API (/api/skills). Rings by API category:
 *   ring 0 — FRONTEND
 *   ring 1 — BACKEND
 *   ring 2 — everything else (TOOLS, OTHERS, unknown categories)
 * Nothing is added: an empty category leaves its ring empty.
 */
import type { Skill } from "@/types/content";
import { displaySkillName, sameSkill } from "./skills";

export type OrbitRingSpec = {
  id: "frontend" | "backend" | "tooling";
  label: string;
  /** API categories (upper case) on this ring; null = all remaining categories. */
  categories: string[] | null;
  /** Radius relative to the outer ring (0–1). */
  radius: number;
  /** Orbital plane inclination around X, degrees (3D) — also the ellipse squash in 2D. */
  inclination: number;
  /** Roll of the orbital plane around the view axis, degrees. */
  roll: number;
  /** +1 counter-clockwise, -1 clockwise (seen from above). */
  direction: 1 | -1;
  /** Angular speed in radians per second at idle (WebGL). */
  speed: number;
  /** Phase offset of the first node, radians. */
  phase: number;
};

export const ORBIT_RINGS: readonly OrbitRingSpec[] = [
  { id: "frontend", label: "Frontend", categories: ["FRONTEND"], radius: 0.48, inclination: 54, roll: -16, direction: 1, speed: 0.22, phase: 0.4 },
  { id: "backend", label: "Backend", categories: ["BACKEND"], radius: 0.74, inclination: 59, roll: 9, direction: -1, speed: 0.14, phase: 1.3 },
  { id: "tooling", label: "Tools & platforms", categories: null, radius: 1, inclination: 64, roll: -5, direction: 1, speed: 0.09, phase: 2.1 },
];

export type OrbitNode = { id: string; name: string; label: string; angle: number };
export type OrbitRing = OrbitRingSpec & { nodes: OrbitNode[] };

/** Assigns API skills to rings (deduplicated by display name) and spreads them evenly. */
export function buildOrbit(skills: Skill[]): OrbitRing[] {
  const claimed = new Set(
    ORBIT_RINGS.flatMap((ring) => ring.categories ?? []),
  );
  return ORBIT_RINGS.map((ring) => {
    const members: Skill[] = [];
    for (const skill of skills) {
      const category = (skill.category || "OTHERS").toUpperCase();
      const onRing = ring.categories
        ? ring.categories.includes(category)
        : !claimed.has(category);
      if (onRing && !members.some((m) => sameSkill(m.name, skill.name)))
        members.push(skill);
    }
    const step = members.length ? (Math.PI * 2) / members.length : 0;
    return {
      ...ring,
      nodes: members.map((skill, index) => ({
        id: skill.id,
        name: skill.name,
        label: displaySkillName(skill.name),
        angle: ring.phase + index * step,
      })),
    };
  });
}

/**
 * 2D projection of a node on its inclined ring (orthographic, for the SVG fallback).
 * Returns the point (in units of the outer radius) and its depth: z > 0 is in front of the core.
 */
export function projectNode(ring: OrbitRingSpec, angle: number) {
  const incline = (ring.inclination * Math.PI) / 180;
  const roll = (ring.roll * Math.PI) / 180;
  const x0 = Math.cos(angle) * ring.radius;
  const y0 = Math.sin(angle) * ring.radius * Math.cos(incline);
  const z = Math.sin(angle) * ring.radius * Math.sin(incline);
  return {
    x: x0 * Math.cos(roll) - y0 * Math.sin(roll),
    y: x0 * Math.sin(roll) + y0 * Math.cos(roll),
    z,
  };
}

/** Accessible summary: "Frontend: React, Next.js. Backend: …". */
export function describeOrbit(rings: OrbitRing[]) {
  return rings
    .filter((ring) => ring.nodes.length)
    .map((ring) => `${ring.label}: ${ring.nodes.map((n) => n.label).join(", ")}`)
    .join(". ");
}
