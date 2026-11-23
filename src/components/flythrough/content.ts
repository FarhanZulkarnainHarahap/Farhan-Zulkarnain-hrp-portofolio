/**
 * Home fly-through content (Fase 10.5). Copy is the approved text in docs/COPY.md → "Home
 * fly-through"; it is static interface copy, not API data. Assets are Blender renders in
 * public/3d/flight (`${theme}-${id}.mp4`, `${theme}-${id}-m.mp4` for phones, and the clip's first
 * frame as the still: `${theme}-${id}-1920` / `${theme}-${id}-m-720`, AVIF + WebP).
 *
 * Segments (one Blender timeline, see docs/3D_PLAN.md): s1 c1 s2 c2 s3 c3 s4 c4 s5 c5 s6. Each
 * connector's first frame is the last frame of the scene before it (the same PNG in both encodes).
 *
 * Scroll pacing (screens per segment): scenes 0.8, connectors 0.4 → the full film is
 * 6 × 0.8 + 5 × 0.4 + 1 = 7.8 screens (the skill default 1.3 / 0.9 would be 13.3).
 */
export const FLIGHT_TITLE = "How I build, layer by layer";
export const FLIGHT_SKIP = "Skip to projects";
export const SCENE_SCROLL = 0.8;
export const CONNECTOR_SCROLL = 0.4;

export type FlightScene = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  linger?: number;
};

export const FLIGHT_SCENES: FlightScene[] = [
  {
    id: "s1",
    eyebrow: "01 · Interface",
    title: "Where people meet the product.",
    body: "I build responsive, accessible interfaces in React and Next.js, with shared design tokens so every screen behaves the same way.",
    linger: 0.35,
  },
  {
    id: "s2",
    eyebrow: "02 · API",
    title: "Clear contracts between front and back.",
    body: "I design typed endpoints with input validation and consistent error responses, so each side can change without breaking the other.",
    linger: 0.3,
  },
  {
    id: "s3",
    eyebrow: "03 · Service",
    title: "Business rules in one place.",
    body: "Authentication, permissions and domain logic live in TypeScript services on Node.js, kept apart from routes and storage.",
    linger: 0.3,
  },
  {
    id: "s4",
    eyebrow: "04 · Database",
    title: "Data shaped for the questions it answers.",
    body: "I model relational data in PostgreSQL with migrations, constraints and indexes, so it stays correct as the product grows.",
    linger: 0.3,
  },
  {
    id: "s5",
    eyebrow: "05 · Deployment",
    title: "Shipped the same way every time.",
    body: "Builds and releases are automated, with configuration kept out of the code, so shipping is routine.",
    linger: 0.3,
  },
];

/** Closing scene (s6): the layers close into the Fz card, which opens into three project cards. */
export const FLIGHT_CLOSING = {
  id: "s6",
  title: "Five layers, one product.",
  body: "The projects below show them in practice.",
  linger: 0.25,
};

export type FlightSegment =
  | { kind: "scene"; id: string; scene: FlightScene; index: number }
  | { kind: "connector"; id: string }
  | { kind: "closing"; id: string };

/** The scroll chain: every scene followed by its connector, then the closing scene. */
export const FLIGHT_SEGMENTS: FlightSegment[] = [
  ...FLIGHT_SCENES.flatMap((scene, index): FlightSegment[] => [
    { kind: "scene", id: scene.id, scene, index },
    { kind: "connector", id: `c${index + 1}` },
  ]),
  { kind: "closing", id: FLIGHT_CLOSING.id },
];
