import { Vector3 } from "three";
import type { SceneMode } from "@/components/kinetic/SceneState";
import type { SymbolKind } from "../geometry/assets";
export const CAPABILITIES: SymbolKind[] = [
  "frontend",
  "backend",
  "database",
  "infrastructure",
  "creative",
];
const architecture = [
  [-2.65, 0.9, 0],
  [2.65, 0.75, -0.2],
  [-2.1, -1.55, 0.2],
  [2.25, -1.55, -0.3],
  [0, 2, -0.75],
];
export function nodePosition(index: number, mode: SceneMode) {
  if (mode === "trajectory")
    return new Vector3(
      (index - 2) * 1.3,
      Math.sin(index * 0.85) * 0.7 - 0.2,
      (index - 2) * -0.2,
    );
  if (mode === "signal") {
    const a = (index / 5) * Math.PI * 2;
    return new Vector3(Math.cos(a) * 1.6, Math.sin(a) * 1.35, -0.7);
  }
  if (mode === "project")
    return new Vector3(
      ...(architecture[index].map((value) => value * 1.25) as [
        number,
        number,
        number,
      ]),
    );
  return new Vector3(...architecture[index]);
}
export function activeCapability(label: string): SymbolKind | undefined {
  const name = label.toLowerCase();
  if (/frontend|react|next|css|html|redux|interface|ui/.test(name))
    return "frontend";
  if (/database|prisma|postgres|mongo|supabase|sql/.test(name))
    return "database";
  if (/infrastructure|docker|aws|vercel|cloud|deployment/.test(name))
    return "infrastructure";
  if (/creative|figma|three|design/.test(name)) return "creative";
  if (/backend|node|express|nest|bun|api/.test(name)) return "backend";
  return undefined;
}
