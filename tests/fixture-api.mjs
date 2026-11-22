/**
 * Local stand-in for https://api.farhanzulkarnainhrp.com during Playwright runs.
 * The Next.js test servers get API_URL=http://localhost:3190, so server-side reads
 * (getProjects / getPublicPayload, incl. /api/public/*) never reach production.
 *
 * Scenarios (POST /__scenario with JSON):
 *   { "scenario": "normal" | "empty" | "fail" | "extreme",
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

let state = { scenario: "normal", fail: [], empty: [] };

function collection(resource) {
  if (state.scenario === "fail" || state.fail.includes(resource)) return null;
  if (state.scenario === "empty" || state.empty.includes(resource)) return [];
  if (state.scenario === "extreme" && resource === "portofolios")
    return [extremeProject, ...base.portofolios];
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
