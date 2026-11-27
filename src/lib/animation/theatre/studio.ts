import type { IRafDriver } from "@theatre/core";

/**
 * Theatre Studio loader — DEVELOPMENT ONLY (Fase K3).
 *
 * `process.env.NODE_ENV` is replaced at build time, so in a production build the whole branch,
 * including the `import("@theatre/studio")` chunk, is removed (verified after every build:
 * no studio code in .next/static, see docs/THEATRE.md). @theatre/studio is a devDependency.
 *
 * Even in development the Studio UI is opt-in, so dev pages (and the dev-quality tests) look
 * like production: it loads on /dev/animation-lab (unless `?studio=0`), or on any page with
 * `?studio=1`.
 */
export function wantsStudio() {
  if (typeof window === "undefined") return false;
  const param = new URLSearchParams(window.location.search).get("studio");
  if (param === "0") return false;
  return param !== null || window.location.pathname.startsWith("/dev/animation-lab");
}

/**
 * `rafDriver`: the shared ticker's driver, so Studio's own UI updates run in the single loop too
 * (without it Studio starts a requestAnimationFrame loop of its own).
 * Studio 0.7.2 also checks updates.theatrejs.com once (no option to turn it off); development only.
 */
export async function loadStudioInDevelopment(rafDriver?: IRafDriver): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    if (!wantsStudio()) return false;
    const { default: studio } = await import("@theatre/studio");
    studio.initialize({ __experimental_rafDriver: rafDriver });
    return true;
  }
  return false;
}
