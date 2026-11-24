import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og/render";

export const alt = "Farhan Zulkarnain Harahap, full-stack engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({
    eyebrow: "Portfolio",
    title: "Farhan Zulkarnain Harahap",
    description:
      "I build web applications end to end, from a clear interface to the API and database behind it.",
  });
}
