"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Project } from "@/services/api";
export type SceneMode =
  "system" | "identity" | "capability" | "trajectory" | "project" | "signal";
const Context = createContext<{
  mode: SceneMode;
  active: string;
  projects: Project[];
  selected: number;
  setMode: (mode: SceneMode) => void;
  setActive: (active: string) => void;
  setProjects: (projects: Project[]) => void;
  setSelected: (selected: number) => void;
}>({
  mode: "system",
  active: "",
  projects: [],
  selected: 0,
  setMode: () => {},
  setActive: () => {},
  setProjects: () => {},
  setSelected: () => {},
});
export function SceneProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SceneMode>("system"),
    [active, setActive] = useState("");
  const [projects, setProjects] = useState<Project[]>([]),
    [selected, setSelected] = useState(0);
  return (
    <Context.Provider
      value={{
        mode,
        active,
        setMode,
        setActive,
        projects,
        setProjects,
        selected,
        setSelected,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useScene = () => useContext(Context);
