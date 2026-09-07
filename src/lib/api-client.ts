import { API_TIMEOUT_MS, PUBLIC_API_ORIGIN } from "./api-config";
export const API_ORIGINS = [PUBLIC_API_ORIGIN];
export async function apiFetch(
  path: string,
  init: RequestInit = {},
  timeoutMs = API_TIMEOUT_MS,
): Promise<Response> {
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeout])
    : timeout;
  const publicRead =
    (init.method || "GET").toUpperCase() === "GET" &&
    /^\/api\/(portofolios|skills|experiences|documents)$/.test(path);
  const url =
    publicRead && typeof window !== "undefined"
      ? path.replace("/api/", "/api/public/")
      : `${PUBLIC_API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    credentials: init.credentials ?? "include",
    signal,
  });
}
