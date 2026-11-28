// Reproducible development server for the "dev-quality" Playwright project (Fase K4).
//
// Next 16 keeps a persistent development cache in .next/dev (Turbopack cache, route list, route
// types). After a dev server is killed mid-write, or after only part of that folder is deleted,
// a new dev server can start with a stale route list — new routes such as /dev/animation-lab then
// answer 404 until a file in them changes (seen in Fase K3). The tests must not depend on that
// state, so this script starts every dev-quality run from a clean .next/dev:
//
//   - If .next/dev/lock names a process that is still alive, another dev server owns the folder
//     (e.g. the owner's own `npm run dev`): we refuse to touch it and exit with an explanation.
//   - Otherwise .next/dev (generated cache only; never sources) is removed and `next dev` starts.
//
// Usage (playwright.config.ts webServer): node tests/dev-server.mjs --port 3102
import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const devDir = join(cwd, ".next", "dev");
const lockFile = join(devDir, "lock");

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

if (existsSync(lockFile)) {
  let pid = 0;
  try {
    pid = Number(JSON.parse(readFileSync(lockFile, "utf8")).pid) || 0;
  } catch {
    pid = 0;
  }
  if (pid && alive(pid)) {
    console.error(`[dev-server] .next/dev is in use by a running dev server (pid ${pid}); not clearing it. Stop that server or run the tests without it.`);
    process.exit(1);
  }
}

rmSync(devDir, { recursive: true, force: true });
console.log("[dev-server] cleared .next/dev (generated development cache)");

const child = spawn(join(cwd, "node_modules", ".bin", "next"), ["dev", ...process.argv.slice(2)], { stdio: "inherit", env: process.env });
const stop = (signal) => child.kill(signal);
process.on("SIGTERM", () => stop("SIGTERM"));
process.on("SIGINT", () => stop("SIGINT"));
child.on("exit", (code) => process.exit(code ?? 0));
