import "server-only";

const API_BASE_URL = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/+$/, "");

type UnknownRecord = Record<string, unknown>;
type ItemParser<T> = (value: unknown, index: number) => T;

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string | null;
  repoUrl: string | null;
  caseType: string | null;
  caseProblem: string | null;
  caseSolution: string | null;
  caseResult: string | null;
  tags: string[];
  features: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  previewUrl: string | null;
  size: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  iconName: string;
  category: "FRONTEND" | "BACKEND" | "TOOLS" | "OTHERS" | string;
  createdAt?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  technologies: string[];
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(
  record: UnknownRecord,
  key: string,
  resourceName: string,
): string {
  const value = record[key];

  if (typeof value !== "string") {
    throw new TypeError(`${resourceName}.${key} harus berupa string.`);
  }

  return value;
}

function optionalString(
  record: UnknownRecord,
  key: string,
  resourceName: string,
): string | null {
  const value = record[key];

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new TypeError(`${resourceName}.${key} harus berupa string atau null.`);
  }

  return value;
}

function optionalStringArray(
  record: UnknownRecord,
  key: string,
  resourceName: string,
): string[] {
  const value = record[key];

  if (value === null || value === undefined) {
    return [];
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new TypeError(`${resourceName}.${key} harus berupa string[].`);
  }

  return value;
}

function optionalTimestamp(
  record: UnknownRecord,
  key: string,
  resourceName: string,
): string | undefined {
  const value = record[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new TypeError(`${resourceName}.${key} harus berupa string.`);
  }

  return value;
}

function parseProject(value: unknown, index: number): Project {
  const resourceName = `Project[${index}]`;

  if (!isRecord(value)) {
    throw new TypeError(`${resourceName} harus berupa object.`);
  }

  return {
    id: requiredString(value, "id", resourceName),
    title: requiredString(value, "title", resourceName),
    description: requiredString(value, "description", resourceName),
    imageUrl: requiredString(value, "imageUrl", resourceName),
    demoUrl: optionalString(value, "demoUrl", resourceName),
    repoUrl: optionalString(value, "repoUrl", resourceName),
    caseType: optionalString(value, "caseType", resourceName),
    caseProblem: optionalString(value, "caseProblem", resourceName),
    caseSolution: optionalString(value, "caseSolution", resourceName),
    caseResult: optionalString(value, "caseResult", resourceName),
    tags: optionalStringArray(value, "tags", resourceName),
    features: optionalStringArray(value, "features", resourceName),
    createdAt: optionalTimestamp(value, "createdAt", resourceName),
    updatedAt: optionalTimestamp(value, "updatedAt", resourceName),
  };
}

function parseDocument(value: unknown, index: number): Document {
  const resourceName = `Document[${index}]`;

  if (!isRecord(value)) {
    throw new TypeError(`${resourceName} harus berupa object.`);
  }

  const size = value.size;
  if (typeof size !== "number" || !Number.isFinite(size)) {
    throw new TypeError(`${resourceName}.size harus berupa number.`);
  }

  return {
    id: requiredString(value, "id", resourceName),
    name: requiredString(value, "name", resourceName),
    category: requiredString(value, "category", resourceName),
    fileUrl: requiredString(value, "fileUrl", resourceName),
    previewUrl: optionalString(value, "previewUrl", resourceName),
    size,
    createdAt: requiredString(value, "createdAt", resourceName),
    updatedAt: optionalTimestamp(value, "updatedAt", resourceName),
  };
}

function parseSkill(value: unknown, index: number): Skill {
  const resourceName = `Skill[${index}]`;

  if (!isRecord(value)) {
    throw new TypeError(`${resourceName} harus berupa object.`);
  }

  return {
    id: requiredString(value, "id", resourceName),
    name: requiredString(value, "name", resourceName),
    iconName: requiredString(value, "iconName", resourceName),
    category: requiredString(value, "category", resourceName),
    createdAt: optionalTimestamp(value, "createdAt", resourceName),
  };
}

function parseExperience(value: unknown, index: number): Experience {
  const resourceName = `Experience[${index}]`;

  if (!isRecord(value)) {
    throw new TypeError(`${resourceName} harus berupa object.`);
  }

  const current = value.current;
  const sortOrder = value.sortOrder;

  if (typeof current !== "boolean") {
    throw new TypeError(`${resourceName}.current harus berupa boolean.`);
  }

  if (typeof sortOrder !== "number" || !Number.isFinite(sortOrder)) {
    throw new TypeError(`${resourceName}.sortOrder harus berupa number.`);
  }

  return {
    id: requiredString(value, "id", resourceName),
    title: requiredString(value, "title", resourceName),
    company: requiredString(value, "company", resourceName),
    location: optionalString(value, "location", resourceName),
    startDate: requiredString(value, "startDate", resourceName),
    endDate: optionalString(value, "endDate", resourceName),
    current,
    description: optionalString(value, "description", resourceName),
    technologies: optionalStringArray(value, "technologies", resourceName),
    sortOrder,
    createdAt: optionalTimestamp(value, "createdAt", resourceName),
    updatedAt: optionalTimestamp(value, "updatedAt", resourceName),
  };
}

function parseSingle<T>(
  payload: unknown,
  resourceName: string,
  parseItem: ItemParser<T>,
): T {
  if (!isRecord(payload) || payload.success !== true) {
    throw new TypeError(`Respons ${resourceName} dari backend tidak valid.`);
  }

  return parseItem(payload.data, 0);
}

function parseCollection<T>(
  payload: unknown,
  resourceName: string,
  parseItem: ItemParser<T>,
): T[] {
  if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data)) {
    throw new TypeError(`Respons ${resourceName} dari backend tidak valid.`);
  }

  return payload.data.map(parseItem);
}

async function fetchCollection<T>(
  path: string,
  resourceName: string,
  parseItem: ItemParser<T>,
): Promise<T[]> {
  /*
   * Next.js memoizes GET dengan URL dan options yang identik selama satu
   * server render pass. Jangan menambahkan AbortSignal di sini karena signal
   * membuat fetch keluar dari request memoization.
   *
   * `no-store` hanya mematikan cache lintas request. Dua Server Component
   * dalam render yang sama tetap berbagi satu request backend.
   */
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Gagal mengambil ${resourceName}: backend merespons HTTP ${response.status}.`,
    );
  }

  const payload: unknown = await response.json();
  return parseCollection(payload, resourceName, parseItem);
}

async function fetchSingle<T>(
  path: string,
  resourceName: string,
  parseItem: ItemParser<T>,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Gagal mengambil ${resourceName}: backend merespons HTTP ${response.status}.`,
    );
  }

  const payload: unknown = await response.json();
  return parseSingle(payload, resourceName, parseItem);
}

export function getProjects(): Promise<Project[]> {
  return fetchCollection("/api/portofolios", "projects", parseProject);
}

export function getProjectById(id: string): Promise<Project> {
  return fetchSingle(`/api/portofolios/${encodeURIComponent(id)}`, "project", parseProject);
}

export function getDocuments(): Promise<Document[]> {
  return fetchCollection("/api/documents", "documents", parseDocument);
}

export function getSkills(): Promise<Skill[]> {
  return fetchCollection("/api/skills", "skills", parseSkill);
}

export function getExperiences(): Promise<Experience[]> {
  return fetchCollection("/api/experiences", "experiences", parseExperience);
}
