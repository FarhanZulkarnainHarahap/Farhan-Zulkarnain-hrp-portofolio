/** Display-only helpers for API experiences. */
import type { Experience } from "@/types/content";

const time = (value?: string | null) => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

/** Current roles first, then most recent start date; sortOrder breaks ties. */
export function sortExperiences(items: Experience[]) {
  return [...items].sort(
    (a, b) =>
      Number(b.current) - Number(a.current) ||
      time(b.startDate) - time(a.startDate) ||
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
}

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "Jan 2024 – Present" / "Mar 2022 – Dec 2023" (DESIGN.md → Voice → dates). */
export function formatRange(
  item: Pick<Experience, "startDate" | "endDate" | "current">,
) {
  const start = time(item.startDate)
    ? monthYear.format(new Date(item.startDate))
    : "";
  const end = item.current
    ? "Present"
    : time(item.endDate)
      ? monthYear.format(new Date(item.endDate!))
      : "";
  return [start, end].filter(Boolean).join(" – ");
}
