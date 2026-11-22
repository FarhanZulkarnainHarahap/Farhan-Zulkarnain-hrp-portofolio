import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og/render";

export const alt = "Projects by Farhan Zulkarnain Harahap";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({
    eyebrow: "Projects",
    title: "Projects",
    description: "Web applications designed and built end to end, each with a case study.",
  });
}
