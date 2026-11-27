"use client";
/**
 * Theatre.js foundation (Fase K3), @theatre/core 0.7.2 WITHOUT @theatre/r3f (its peer is
 * @react-three/fiber ^8; this app runs fiber 9 + React 19).
 *
 *  Project "Kinetic Systems" → sheets (config THEATRE_SHEETS) → sheet objects (props.ts) →
 *  each sheet's sequence holds the keyframes. The committed state is
 *  src/theatre/kinetic-systems.theatre.json (Studio → project → Export → overwrite that file).
 *
 *  Flow per frame (one loop, ../ticker.ts): "scroll" phase — Lenis / ScrollTrigger may set
 *  `sheet.sequence.position` (scroll-synced sheets); "timeline" phase — Theatre's driver ticks
 *  (playback) and `onValuesChange` writes the values into a ref (useTheatreObject); "render"
 *  phase — R3F `useFrame` applies the ref to the Object3D / uniforms. No React state per frame.
 *
 *  Loading: `loadTheatre()` imports @theatre/core and the state lazily (only scenes that animate
 *  with Theatre pay for it). Studio: see ./studio.ts — development only.
 */
import type { IProject, IRafDriver, ISheet, ISheetObject, UnknownShorthandCompoundProps } from "@theatre/core";
import { THEATRE_PROJECT_ID, THEATRE_SHEETS, type TheatreSheetKey } from "../config";
import { THEATRE_OBJECTS, type TheatreObjectKey, type TheatreTypesModule } from "./props";
import { addTick } from "../ticker";
import { loadStudioInDevelopment } from "./studio";

type Core = typeof import("@theatre/core");

export type TheatreRuntime = {
  core: Core;
  project: IProject;
  studio: boolean;
  /**
   * Theatre's clock: ticks in the "timeline" phase of the shared ticker, and only while Theatre
   * asks for it (start/stop) — no extra rAF loop, nothing per frame while it is idle. Pass it to
   * `sequence.play({ rafDriver })` and `onValuesChange(fn, rafDriver)`.
   */
  driver: IRafDriver;
  sheet: (key: TheatreSheetKey, instance?: string) => ISheet;
  /** Sequence length in sequence units (seconds, or 0–1 for scroll-synced sheets). */
  length: (sheet: ISheet) => number;
};

let runtime: Promise<TheatreRuntime> | null = null;

export function loadTheatre(): Promise<TheatreRuntime> {
  if (runtime) return runtime;
  runtime = (async () => {
    // Order matters: @theatre/core must be loaded before Studio initialises (Studio attaches to the
    // core instance), and Studio must be initialised before the project is created to edit it.
    const [core, state] = await Promise.all([
      import("@theatre/core"),
      import("@/theatre/kinetic-systems.theatre.json").then((m) => m.default),
    ]);
    let removeTick: (() => void) | null = null;
    const driver: IRafDriver = core.createRafDriver({
      name: "kinetic-ticker",
      start: () => {
        removeTick ??= addTick("timeline", (_time, _delta, now) => driver.tick(now));
      },
      stop: () => {
        removeTick?.();
        removeTick = null;
      },
    });
    const studio = await loadStudioInDevelopment(driver);
    const project = core.getProject(THEATRE_PROJECT_ID, { state });
    await project.ready;
    return {
      core,
      project,
      studio,
      driver,
      sheet: (key, instance) => project.sheet(THEATRE_SHEETS[key], instance),
      length: (sheet) => core.val(sheet.sequence.pointer.length),
    };
  })();
  runtime.catch(() => {
    runtime = null;
  });
  return runtime;
}

type Factory<S extends TheatreSheetKey, K extends TheatreObjectKey<S>> = (typeof THEATRE_OBJECTS)[S][K];
/** Props shape of a declared object (what Theatre's `value` mirrors). */
export type TheatrePropsOf<S extends TheatreSheetKey, K extends TheatreObjectKey<S>> =
  Factory<S, K> extends (t: TheatreTypesModule) => infer P ? (P extends UnknownShorthandCompoundProps ? P : never) : never;
export type SheetObjectOf<S extends TheatreSheetKey, K extends TheatreObjectKey<S>> = ISheetObject<TheatrePropsOf<S, K>>;

/** Creates (or re-attaches) a declared object; `reconfigure` keeps HMR / re-mounts working. */
export function createSheetObject<S extends TheatreSheetKey, K extends TheatreObjectKey<S>>(
  rt: TheatreRuntime,
  sheetKey: S,
  objectKey: K,
  instance?: string,
): { sheet: ISheet; object: SheetObjectOf<S, K> } {
  const factory = THEATRE_OBJECTS[sheetKey][objectKey] as unknown as (t: TheatreTypesModule) => TheatrePropsOf<S, K>;
  const sheet = rt.sheet(sheetKey, instance);
  return { sheet, object: sheet.object(objectKey, factory(rt.core.types), { reconfigure: true }) };
}
