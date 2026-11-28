"use client";
/**
 * SceneRegistry, module half (Fase K4). The data half — presets, anchors, which scene a route or
 * section shows — is lib/scene/presets.ts (SCENES). Here: each scene's code, loaded with import()
 * only when the scene is first shown (or preloaded at idle as the likely next one), and the size
 * of the box each scene is authored in (its "unit"), which ScrollTransformGroup fits into the
 * scene's DOM slot. The development lab scene is not even referenced in production builds.
 */
import type { ComponentType } from "react";
import type { SceneId } from "@/lib/scene/types";

export type SceneProps = { id: SceneId };
export type Loader = () => Promise<{ default: ComponentType<SceneProps> }>;

export const LOADERS: Partial<Record<SceneId, Loader>> = {
  home: () => import("./scenes/HomeScene"),
  about: () => import("./scenes/AboutScene"),
  skills: () => import("./scenes/SkillsScene"),
  journey: () => import("./scenes/JourneyScene"),
  projects: () => import("./scenes/ProjectsScene"),
  "project-detail": () => import("./scenes/ProjectDetailScene"),
  contact: () => import("./scenes/ContactScene"),
  ...(process.env.NODE_ENV === "development" ? { lab: () => import("./scenes/LabStageScene") } : {}),
};

/** Authored size [width, height] in scene units; fitted into the anchor rect. */
export const SCENE_UNITS: Record<SceneId, [number, number]> = {
  home: [2.64, 2],
  about: [1.6, 1.6],
  skills: [1.6, 1.6],
  journey: [1.6, 1.6],
  projects: [1.6, 1.6],
  "project-detail": [1.6, 1.6],
  contact: [1.6, 1.6],
  lab: [2.4, 2.4],
};

/** Preloaders for the SceneController (module only; assets load when the scene mounts). */
export const SCENE_PRELOADERS: Partial<Record<SceneId, () => Promise<unknown>>> = LOADERS;

/** Likely next scenes, preloaded at idle after the current one is active. */
export const NEXT_SCENES: Partial<Record<SceneId, SceneId[]>> = {
  home: ["projects", "about"],
  projects: ["project-detail"],
  "project-detail": ["projects"],
  about: ["skills", "journey"],
  journey: ["contact"],
};
