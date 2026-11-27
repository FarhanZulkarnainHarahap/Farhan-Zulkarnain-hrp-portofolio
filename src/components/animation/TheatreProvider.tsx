"use client";
/**
 * TheatreProvider (Fase K3): loads the Theatre project lazily (lib/animation/theatre/project.ts)
 * and gives scenes `useTheatreObject` / `useTheatreSequence`.
 *
 * useTheatreObject(sheet, object) returns a ref whose `.current` is the object's latest values,
 * updated by Theatre's `onValuesChange` subscription — no React state, no re-render. R3F scenes
 * read the ref inside useFrame and apply it to their "choreography" TransformStack layer or to
 * uniforms. Objects are detached on unmount.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { ISheet } from "@theatre/core";
import type { TheatreSheetKey } from "@/lib/animation/config";
import { createSheetObject, loadTheatre, type SheetObjectOf, type TheatreRuntime } from "@/lib/animation/theatre/project";
import type { TheatreObjectKey } from "@/lib/animation/theatre/props";

type TheatreState = { status: "loading" | "ready" | "error"; runtime: TheatreRuntime | null };
const TheatreContext = createContext<TheatreState>({ status: "loading", runtime: null });

export function TheatreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TheatreState>({ status: "loading", runtime: null });
  useEffect(() => {
    let alive = true;
    loadTheatre().then(
      (runtime) => alive && setState({ status: "ready", runtime }),
      () => alive && setState({ status: "error", runtime: null }),
    );
    return () => {
      alive = false;
    };
  }, []);
  return <TheatreContext.Provider value={state}>{children}</TheatreContext.Provider>;
}

export function useTheatre() {
  return useContext(TheatreContext);
}

type ValuesOf<S extends TheatreSheetKey, K extends TheatreObjectKey<S>> = SheetObjectOf<S, K>["value"];

/** Latest values of a declared sheet object, in a ref (null until Theatre is ready). */
export function useTheatreObject<S extends TheatreSheetKey, K extends TheatreObjectKey<S>>(
  sheetKey: S,
  objectKey: K,
): { values: RefObject<ValuesOf<S, K> | null>; sheet: RefObject<ISheet | null> } {
  const { runtime } = useTheatre();
  const values = useRef<ValuesOf<S, K> | null>(null);
  const sheet = useRef<ISheet | null>(null);
  useEffect(() => {
    if (!runtime) return;
    const created = createSheetObject(runtime, sheetKey, objectKey);
    sheet.current = created.sheet;
    values.current = created.object.value as ValuesOf<S, K>;
    const unsubscribe = created.object.onValuesChange((next) => {
      values.current = next as ValuesOf<S, K>;
    }, runtime.driver);
    return () => {
      unsubscribe();
      created.sheet.detachObject(objectKey);
      values.current = null;
    };
  }, [runtime, sheetKey, objectKey]);
  return { values, sheet };
}

/** The sheet of a key (for its sequence), once Theatre is ready. */
export function useTheatreSheet(sheetKey: TheatreSheetKey) {
  const { runtime } = useTheatre();
  return runtime ? { sheet: runtime.sheet(sheetKey), length: runtime.length(runtime.sheet(sheetKey)), runtime } : null;
}
