import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og/render";

export const alt = "About Farhan Zulkarnain Harahap";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({
    eyebrow: "About",
    title: "Engineer, from interface to database.",
    description: "Background, the way I work, the full stack, and my CV.",
  });
}
