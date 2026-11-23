/**
 * Home fly-through content (Fase 10.5). Copy is the approved text in docs/COPY.md → "Home
 * fly-through"; it is static interface copy, not API data. Assets are Blender renders in
 * public/3d/flight (`${theme}-${id}.mp4`, `${theme}-${id}-m.mp4` for phones, and the clip's first
 * frame as the still: `${theme}-${id}-1920` / `${theme}-${id}-m-720`, AVIF + WebP).
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
  /** True once the scene's clip and still are rendered (Checkpoint B: scene 1 only). */
  available: boolean;
  linger?: number;
};

export const FLIGHT_SCENES: FlightScene[] = [
  {
    id: "s1",
    eyebrow: "01 · Interface",
    title: "Where people meet the product.",
    body: "I build responsive, accessible interfaces in React and Next.js, with shared design tokens so every screen behaves the same way.",
    available: true,
    linger: 0.35,
  },
  {
    id: "s2",
    eyebrow: "02 · API",
    title: "Clear contracts between front and back.",
    body: "I design typed endpoints with input validation and consistent error responses, so each side can change without breaking the other.",
    available: false,
  },
  {
    id: "s3",
    eyebrow: "03 · Service",
    title: "Business rules in one place.",
    body: "Authentication, permissions and domain logic live in TypeScript services on Node.js, kept apart from routes and storage.",
    available: false,
  },
  {
    id: "s4",
    eyebrow: "04 · Database",
    title: "Data shaped for the questions it answers.",
    body: "I model relational data in PostgreSQL with migrations, constraints and indexes, so it stays correct as the product grows.",
    available: false,
  },
  {
    id: "s5",
    eyebrow: "05 · Deployment",
    title: "Shipped the same way every time.",
    body: "Builds and releases are automated, with configuration kept out of the code, so shipping is routine.",
    available: false,
  },
];

export const FLIGHT_CLOSING = {
  title: "Five layers, one product.",
  body: "The projects below show them in practice.",
};
