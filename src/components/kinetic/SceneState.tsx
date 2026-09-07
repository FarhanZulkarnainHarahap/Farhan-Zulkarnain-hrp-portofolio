"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
export type SceneMode =
  "system" | "capability" | "trajectory" | "project" | "signal";
const Context = createContext<{
  mode: SceneMode;
  active: string;
  setMode: (mode: SceneMode) => void;
  setActive: (active: string) => void;
}>({ mode: "system", active: "", setMode: () => {}, setActive: () => {} });
export function SceneProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SceneMode>("system");
  const [active, setActive] = useState("");
  return (
    <Context.Provider value={{ mode, active, setMode, setActive }}>
      {children}
    </Context.Provider>
  );
}
export const useScene = () => useContext(Context);
