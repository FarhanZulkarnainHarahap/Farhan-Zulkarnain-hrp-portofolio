const LOCAL_EXPRESS_API = "http://localhost:8000";
const LOCAL_NEST_API = "http://localhost:8001";
const PRODUCTION_NEST_API = "https://nest-api.farhanzulkarnainhrp.com";
const DEFAULT_TIMEOUT_MS = 8_000;
const UNHEALTHY_COOLDOWN_MS = 30_000;

const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, "");

const configuredOrigins = [
  process.env.NEXT_PUBLIC_API_URL || LOCAL_EXPRESS_API,
  process.env.NEXT_PUBLIC_API_URL_SECONDARY ||
    (process.env.NODE_ENV === "production" ? PRODUCTION_NEST_API : LOCAL_NEST_API),
]
  .map(normalizeOrigin)
  .filter((origin, index, origins) => origin && origins.indexOf(origin) === index);

export const API_ORIGINS = configuredOrigins;

const unhealthyUntil = new Map<string, number>();
let nextReadOrigin = Math.floor(Math.random() * configuredOrigins.length);

const joinUrl = (origin: string, path: string) =>
  `${origin}${path.startsWith("/") ? path : `/${path}`}`;

const orderedReadOrigins = () => {
  const now = Date.now();
  const healthyOrigins = API_ORIGINS.filter(
    (origin) => (unhealthyUntil.get(origin) || 0) <= now,
  );
  const availableOrigins = healthyOrigins.length > 0 ? healthyOrigins : API_ORIGINS;
  const startIndex = nextReadOrigin % availableOrigins.length;

  nextReadOrigin = (nextReadOrigin + 1) % Math.max(availableOrigins.length, 1);

  return [
    ...availableOrigins.slice(startIndex),
    ...availableOrigins.slice(0, startIndex),
  ];
};

const isSafeMethod = (method: string) =>
  method === "GET" || method === "HEAD" || method === "OPTIONS";

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  const canFailover = isSafeMethod(method);
  const origins = canFailover ? orderedReadOrigins() : [API_ORIGINS[0]];
  let lastError: unknown;

  for (let index = 0; index < origins.length; index += 1) {
    const origin = origins[index];
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort(init.signal?.reason);
    const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

    if (init.signal?.aborted) abortFromCaller();
    init.signal?.addEventListener("abort", abortFromCaller, { once: true });

    try {
      const response = await fetch(joinUrl(origin, path), {
        ...init,
        credentials: init.credentials || "include",
        signal: controller.signal,
      });

      const shouldFailover =
        response.status === 408 || response.status === 429 || response.status >= 500;

      if (canFailover && shouldFailover && index < origins.length - 1) {
        unhealthyUntil.set(origin, Date.now() + UNHEALTHY_COOLDOWN_MS);
        continue;
      }

      unhealthyUntil.delete(origin);
      return response;
    } catch (error) {
      lastError = error;
      unhealthyUntil.set(origin, Date.now() + UNHEALTHY_COOLDOWN_MS);

      if (!canFailover || index === origins.length - 1) {
        throw error;
      }
    } finally {
      globalThis.clearTimeout(timeout);
      init.signal?.removeEventListener("abort", abortFromCaller);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Every API endpoint is unavailable");
}
