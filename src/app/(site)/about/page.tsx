import type { Metadata } from "next";
import { connection } from "next/server";
import { DocumentsSection } from "@/components/about/DocumentsSection";
import { FullStack } from "@/components/about/FullStack";
import { ProfileSection } from "@/components/about/ProfileSection";
import { HowIWork } from "@/components/home/HowIWork";
import { NextSteps } from "@/components/site/NextSteps";
import { StackAnatomy } from "@/components/illustrations/StackAnatomy";
import { PageHeader } from "@/components/site/PageHeader";
import { cvHref } from "@/components/site/nav";
import { loadDocuments, loadSkills } from "@/lib/server/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Farhan Zulkarnain Harahap, a full-stack engineer in Medan: background, approach, full stack, CV, and certificates.",
  alternates: { canonical: "/about" },
  // Own title/description/url for social cards (images come from ./opengraph-image.tsx).
  openGraph: {
    title: "About · Farhan Zulkarnain Harahap",
    description:
      "About Farhan Zulkarnain Harahap, a full-stack engineer in Medan: background, approach, full stack, CV, and certificates.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About · Farhan Zulkarnain Harahap",
    description:
      "About Farhan Zulkarnain Harahap, a full-stack engineer in Medan: background, approach, full stack, CV, and certificates.",
  },
};

/** Standalone About page. Anchors #profile, #stack and #documents are targets of 308 redirects. */
export default async function AboutPage() {
  await connection();
  const [skills, documents] = await Promise.all([
    loadSkills(),
    loadDocuments(),
  ]);
  return (
    <main id="main-content" className="flex-1">
      <PageHeader
        eyebrow="About"
        title="Engineer, from interface to database."
        lead="Background, the way I work, the full stack, and my CV."
        visual={
          <figure className="rounded-(--card-radius) border border-hairline bg-surface p-4">
            <StackAnatomy />
          </figure>
        }
      />
      <ProfileSection cvHref={cvHref(documents.data)} />
      <FullStack initial={skills} />
      <HowIWork />
      <DocumentsSection initial={documents} />
      <NextSteps
        title="Next: see the journey."
        primary={{ href: "/journey", label: "See the journey" }}
        secondary={{ href: "/contact", label: "Get in touch" }}
      />
    </main>
  );
}
