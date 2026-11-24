import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og/render";

export const alt = "Contact Farhan Zulkarnain Harahap";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({
    eyebrow: "Contact",
    title: "Let's talk.",
    description: "Full-time roles, freelance projects, or collaboration.",
  });
}
