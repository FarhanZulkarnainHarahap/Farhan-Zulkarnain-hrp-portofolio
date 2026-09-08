"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  Color,
  DoubleSide,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
} from "three";
import { signalFragment, signalVertex } from "../shaders/signal";
export type Quality = "high" | "medium" | "low";
function makeMaterials() {
  const css = getComputedStyle(document.documentElement);
  const color = (name: string) =>
    new Color(css.getPropertyValue(`--${name}`).trim());
  return {
    system: new MeshStandardMaterial({
      color: color("card"),
      metalness: 0.62,
      roughness: 0.38,
      side: DoubleSide,
    }),
    panel: new MeshStandardMaterial({
      color: color("border"),
      metalness: 0.42,
      roughness: 0.48,
      side: DoubleSide,
    }),
    core: new MeshPhysicalMaterial({
      color: color("primary"),
      metalness: 0.55,
      roughness: 0.28,
      clearcoat: 0.35,
    }),
    signal: new MeshBasicMaterial({
      color: color("secondary"),
      toneMapped: false,
    }),
    accent: new MeshBasicMaterial({
      color: color("accent"),
      toneMapped: false,
    }),
    ink: new MeshBasicMaterial({ color: color("text"), toneMapped: false }),
    edges: new LineBasicMaterial({
      color: color("muted"),
      transparent: true,
      opacity: 0.38,
    }),
    lowSignal: new MeshBasicMaterial({
      color: color("primary"),
      transparent: true,
      opacity: 0.3,
    }),
    grid: new LineBasicMaterial({
      color: color("primary"),
      transparent: true,
      opacity: 0.12,
    }),
    pulse: new ShaderMaterial({
      vertexShader: signalVertex,
      fragmentShader: signalFragment,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.17 },
        uActive: { value: 0 },
        uColor: { value: color("secondary") },
      },
    }),
  };
}
export type Materials = ReturnType<typeof makeMaterials>;
const Context = createContext<Materials | null>(null);
export function MaterialProvider({ children }: { children: ReactNode }) {
  const materials = useMemo(() => makeMaterials(), []);
  useEffect(
    () => () =>
      Object.values(materials).forEach((material) => material.dispose()),
    [materials],
  );
  return <Context.Provider value={materials}>{children}</Context.Provider>;
}
export function useMaterials() {
  const value = useContext(Context);
  if (!value) throw new Error("System materials missing");
  return value;
}

/** Frame-loop uniforms are GPU state, independent of React renders. */
export function updateSignals(
  material: Materials,
  time: number,
  active: boolean,
) {
  material.pulse.uniforms.uTime.value = time;
  material.pulse.uniforms.uActive.value = active ? 1 : 0;
}
