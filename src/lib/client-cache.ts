import { apiFetch } from "@/lib/api-client";

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 5 * 60 * 1000;

export async function fetchCachedJson<T>(
  path: string,
  cacheKey: string,
  ttl = DEFAULT_TTL,
): Promise<T> {
  const now = Date.now();
  const memoryEntry = memoryCache.get(cacheKey) as CacheEntry<T> | undefined;

  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.value;
  }

  if (typeof window !== "undefined") {
    const stored = window.sessionStorage.getItem(cacheKey);

    if (stored) {
      try {
        const sessionEntry = JSON.parse(stored) as CacheEntry<T>;
        if (sessionEntry.expiresAt > now) {
          memoryCache.set(cacheKey, sessionEntry);
          return sessionEntry.value;
        }
        window.sessionStorage.removeItem(cacheKey);
      } catch {
        window.sessionStorage.removeItem(cacheKey);
      }
    }
  }

  const response = await apiFetch(path, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const value = (await response.json()) as T;
  const entry: CacheEntry<T> = {
    expiresAt: now + ttl,
    value,
  };

  memoryCache.set(cacheKey, entry);
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  }

  return value;
}
