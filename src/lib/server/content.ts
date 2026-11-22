/**
 * Server-side reads for public pages, built only on the existing functions in
 * src/services/api.ts (which stays unchanged):
 *   - projects  → getProjects(), documents → getDocuments()
 *   - skills, experiences → getPublicPayload(path) + validation here (api.ts has no
 *     dedicated function for them; this mirrors its parseCollection pattern).
 *
 * Results are cached with unstable_cache for 300 s so pages do not wait on the API for every
 * request. CONTENT_CACHE=off disables the cache (Playwright fixture server switches scenarios
 * between tests). Failed reads are not cached, so the next request retries.
 */
import { unstable_cache } from "next/cache";
import {
  getDocuments,
  getProjects,
  getPublicPayload,
  type Document,
  type Project,
} from "@/services/api";
import type { Experience, Skill } from "@/types/content";

export const CONTENT_REVALIDATE_SECONDS = 300;

/** A section either has data or a message explaining why it could not be loaded. */
export type Loaded<T> = { data: T[]; error: string | null };

type Rec = Record<string, unknown>;
const isRecord = (value: unknown): value is Rec =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const str = (value: unknown) => (typeof value === "string" ? value : undefined);
const strArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

function items(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload) && Array.isArray(payload.data)) return payload.data;
  throw new TypeError("Invalid collection response.");
}

function parseSkill(value: unknown): Skill | null {
  if (!isRecord(value)) return null;
  const id =
    str(value.id) ??
    (typeof value.id === "number" ? String(value.id) : undefined);
  const name = str(value.name);
  if (!id || !name) return null;
  return { id, name, category: str(value.category) ?? "OTHERS" };
}

function parseExperience(value: unknown): Experience | null {
  if (!isRecord(value)) return null;
  const id = str(value.id);
  const title = str(value.title);
  const company = str(value.company);
  const startDate = str(value.startDate);
  if (!id || !title || !company || !startDate) return null;
  return {
    id,
    title,
    company,
    startDate,
    location: str(value.location),
    endDate: str(value.endDate),
    current: value.current === true,
    description: str(value.description),
    technologies: strArray(value.technologies),
    sortOrder:
      typeof value.sortOrder === "number" ? value.sortOrder : undefined,
  };
}

async function readSkills() {
  return items(await getPublicPayload("/api/skills"))
    .map(parseSkill)
    .filter((skill): skill is Skill => skill !== null);
}

async function readExperiences() {
  return items(await getPublicPayload("/api/experiences"))
    .map(parseExperience)
    .filter((item): item is Experience => item !== null);
}

const cacheOff = () => process.env.CONTENT_CACHE === "off";

function cached<T>(key: string, read: () => Promise<T[]>) {
  const withCache = unstable_cache(read, ["public-content", key], {
    revalidate: CONTENT_REVALIDATE_SECONDS,
    tags: [`content:${key}`],
  });
  return () => (cacheOff() ? read() : withCache());
}

const projects = cached<Project>("projects", getProjects);
const skills = cached<Skill>("skills", readSkills);
const experiences = cached<Experience>("experiences", readExperiences);
const documents = cached<Document>("documents", getDocuments);

const MESSAGE =
  "The content service may be temporarily unavailable. Please try again in a moment.";

async function settle<T>(read: () => Promise<T[]>): Promise<Loaded<T>> {
  try {
    return { data: await read(), error: null };
  } catch (error) {
    console.error("[content]", error instanceof Error ? error.message : error);
    return { data: [], error: MESSAGE };
  }
}

/** Cached projects read that throws on failure (case study pages: errors go to error.tsx). */
export const getCachedProjects = projects;

/** Per-collection loaders: never throw; a failure becomes { data: [], error }. */
export const loadProjects = () => settle(projects);
export const loadSkills = () => settle(skills);
export const loadExperiences = () => settle(experiences);
export const loadDocuments = () => settle(documents);

/** Reads each collection once; one failing collection never fails the others. */
export async function getHomeContent() {
  const [p, s, e] = await Promise.all([
    loadProjects(),
    loadSkills(),
    loadExperiences(),
  ]);
  return { projects: p, skills: s, experiences: e };
}
