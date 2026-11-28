/**
 * Development-lab switches for the K4 lab scene (shared by the lab page and LabStageScene).
 * A tiny external store: the lab buttons flip a switch, the scene reacts. Development only.
 */
type LabSwitches = { brokenShader: boolean; maskSource: "scroll" | "manual"; maskManual: number };

let state: LabSwitches = { brokenShader: false, maskSource: "scroll", maskManual: 1 };
const listeners = new Set<() => void>();

export const labControls = {
  get: () => state,
  set(patch: Partial<LabSwitches>) {
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
};
