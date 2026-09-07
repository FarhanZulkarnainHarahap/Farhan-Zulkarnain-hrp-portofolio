/** The same primary backend is used by public reads and authenticated writes. */
export const PUBLIC_API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.farhanzulkarnainhrp.com"
)
  .trim()
  .replace(/\/+$/, "");
export const API_TIMEOUT_MS = 10_000;
