/**
 * Local stand-in for https://api.farhanzulkarnainhrp.com during Playwright runs.
 * The Next.js test servers get API_URL=http://localhost:3190, so server-side reads
 * (getProjects / getPublicPayload, incl. /api/public/*) never reach production.
 *
 * Scenarios (POST /__scenario with JSON):
 *   { "scenario": "normal" | "empty" | "fail" | "extreme" | "worst",
 *     "nosize": true,          // worst only: one document without `size` (api.ts rejects it)
 *     "fail":  ["skills", ...],   // optional: these collections answer 503
 *     "empty": ["experiences", ...] } // optional: these collections answer []
 * GET /__health → 200. Unknown paths → 404.
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.FIXTURE_API_PORT ?? 3190);
const dir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const load = (name) =>
  JSON.parse(readFileSync(join(dir, `${name}.json`), "utf8")).data;

const base = {
  portofolios: load("projects"),
  skills: load("skills"),
  documents: load("documents"),
  experiences: load("experiences"),
};

const extremeProject = {
  ...base.portofolios[0],
  id: "fx-extreme",
  title:
    "An extremely long project title that keeps going well past two lines on any card width",
  description: "Lorem ipsum dolor sit amet. ".repeat(60),
  imageUrl:
    "https://res.cloudinary.com/demo/image/upload/does-not-exist-fixture.jpg",
  caseType: "Web App, Dashboard, Web App",
  caseProblem: "Problem",
  caseSolution: null,
  caseResult: null,
  tags: Array.from({ length: 32 }, (_, i) => `Tag ${i + 1}`),
  features: Array.from({ length: 94 }, (_, i) => `Feature ${i + 1}`),
};

// Fase 12.3 (/break-ui): the realistic worst case for every rendered value, mixed across rows
// (real naming patterns, not random strings). Used by .qa/fase12/break-ui and tests/break-ui.spec.ts.
const techs = ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "TanStack React Query", "Zustand",
  "React Hook Form", "Zod", "Recharts", "Dexie / IndexedDB", "ZXing Barcode Scanner", "ExcelJS",
  "@tanstack/react-query-devtools", "Node.js", "Express.js 5", "Prisma ORM", "PostgreSQL", "Redis",
  "Cloudinary", "Resend Email API", "Socket.IO", "JWT Authentication", "CSRF Protection", "Vercel",
  "Docker Compose", "GitHub Actions", "Playwright", "Vitest", "🧪 Testing Library", "Sentry"];
const worstProjects = [
  {
    ...base.portofolios[0],
    id: "fx-worst-1",
    title:
      "Sistem Informasi Manajemen Inventaris, Penjualan dan Pelaporan Keuangan Multi-Cabang untuk UMKM Kuliner di Kota Medan",
    description: "",
    imageUrl: "https://res.cloudinary.com/dpanr1qqp/image/upload/v1/Porto/deleted-screenshot.png",
    caseType: "Full-Stack Web Application — Point of Sale (POS) & Retail Management System, Dashboard, Dashboard",
    tags: [...techs, ...techs.slice(0, 26).map((t) => `${t} (v2)`)],
    features: Array.from({ length: 94 }, (_, i) => (i % 15 === 0 ? `📦 Module ${i / 15 + 1}` : `Feature ${i + 1}: stock adjustments per branch with audit trail`)),
  },
  {
    ...base.portofolios[1],
    id: "fx-worst-2",
    title: "東京ラーメン 🍜 注文システム",
    description: "飲食店向けのモバイル注文システム。テーブルからQRコードで注文し、厨房にリアルタイムで届きます。",
    imageUrl: "",
    demoUrl: null,
    repoUrl: null,
    caseType: null,
    caseProblem: null,
    caseSolution: null,
    caseResult: null,
    tags: ["🛒 POS", "Next.js", "日本語"],
    features: [],
  },
  {
    ...base.portofolios[2],
    id: "fx-worst-3",
    title: "Платформа онлайн-бронирования столиков",
    description:
      "See https://github.com/FarhanZulkarnainHarahap/sistem-informasi-manajemen-inventaris-multi-cabang-umkm-kuliner-medan for the full write-up.",
    tags: [],
    features: ["✓"],
  },
  { ...base.portofolios[3], id: "fx-worst-4", title: "Qu", tags: ["Go"], features: ["Search"] },
];
const companies = ["PT Bank Rakyat Indonesia (Persero) Tbk — Divisi Transformasi Digital", "Freelance", "Nexxus", "株式会社サイバーエージェント",
  "Northwind Industries Holdings International Ltd.", "Studio"];
const worstExperiences = Array.from({ length: 20 }, (_, i) => ({
  id: `fx-worst-exp-${i + 1}`,
  title: i === 0 ? "Senior Full-Stack Software Engineer & Technical Lead, Payments Platform" : i % 3 === 0 ? "Intern" : "Full-Stack Developer",
  company: companies[i % companies.length],
  ...(i % 4 === 1 ? {} : { location: i % 5 === 0 ? "Medan, Sumatera Utara, Indonesia (Hybrid)" : "Remote" }),
  startDate: new Date(Date.UTC(2026 - i, i % 12, 1)).toISOString(),
  ...(i === 0 ? {} : { endDate: new Date(Date.UTC(2026 - i, (i % 12) + 6, 1)).toISOString() }),
  current: i === 0,
  ...(i % 2 === 0 ? { description: i === 0 ? "Led a team of 6 engineers. ".repeat(12) : "Built and maintained internal tools." } : {}),
  technologies: i === 0 ? techs : i % 3 === 0 ? [] : techs.slice(i % 7, (i % 7) + 4),
  sortOrder: i,
}));
const worstSkills = [
  ...base.skills,
  { id: "fx-worst-skill-1", name: "Amazon Web Services Elastic Container Service (ECS)", iconName: "", category: "DEVOPS", createdAt: "2026-07-01T00:00:00.000Z" },
  { id: "fx-worst-skill-2", name: "日本語NLP", iconName: "", category: "BACKEND", createdAt: "2026-07-01T00:00:00.000Z" },
  { id: "fx-worst-skill-3", name: "🧪 Vitest", iconName: "", category: "TOOLS", createdAt: "2026-07-01T00:00:00.000Z" },
  { id: "fx-worst-skill-4", name: "C", iconName: "", category: "Programming Languages & Runtimes", createdAt: "2026-07-01T00:00:00.000Z" },
];
const worstDocuments = (nosize) => [
  {
    ...base.documents[0],
    id: "fx-worst-doc-1",
    name: "Sertifikat Kompetensi Pengembang Web Full-Stack Badan Nasional Sertifikasi Profesi (BNSP) 2026 - final revisi 3.pdf",
    previewUrl: null,
    size: 0,
  },
  { ...base.documents[1], id: "fx-worst-doc-2", name: "CV", category: "Résumé — English & Bahasa Indonesia", size: 48_734_221 },
  ...(nosize
    ? [Object.fromEntries(Object.entries({ ...base.documents[2], id: "fx-worst-doc-3" }).filter(([k]) => k !== "size"))]
    : []),
  ...base.documents.slice(3),
];

let state = { scenario: "normal", fail: [], empty: [], nosize: false };

function collection(resource) {
  if (state.scenario === "fail" || state.fail.includes(resource)) return null;
  if (state.scenario === "empty" || state.empty.includes(resource)) return [];
  if (state.scenario === "extreme" && resource === "portofolios")
    return [extremeProject, ...base.portofolios];
  if (state.scenario === "worst") {
    if (resource === "portofolios") return [...worstProjects, ...base.portofolios.slice(4)];
    if (resource === "experiences") return worstExperiences;
    if (resource === "skills") return worstSkills;
    if (resource === "documents") return worstDocuments(state.nosize);
  }
  return base[resource];
}

const send = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  if (url.pathname === "/__health") return send(res, 200, { ok: true });
  if (url.pathname === "/__scenario") {
    if (req.method === "GET") return send(res, 200, state);
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      const body = raw ? JSON.parse(raw) : {};
      state = {
        scenario: body.scenario ?? "normal",
        fail: body.fail ?? [],
        empty: body.empty ?? [],
        nosize: body.nosize === true,
      };
      send(res, 200, state);
    });
    return;
  }
  const match = url.pathname.match(
    /^\/api\/(portofolios|skills|experiences|documents)$/,
  );
  if (req.method === "GET" && match) {
    const data = collection(match[1]);
    if (data === null)
      return send(res, 503, { success: false, message: "Fixture failure" });
    return send(res, 200, { success: true, data });
  }
  send(res, 404, { success: false, message: "Not found in fixture API" });
}).listen(PORT, () => console.log(`fixture API on http://localhost:${PORT}`));
