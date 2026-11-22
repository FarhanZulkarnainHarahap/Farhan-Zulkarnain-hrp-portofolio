import Link from "next/link";
import { ArrowDown, Download } from "lucide-react";
import { ProjectImage } from "@/components/projects/ProjectImage";
import { buttonClasses } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { profile } from "@/lib/site";

const facts = [
  { label: "Focus", value: "Full-stack web applications" },
  {
    label: "Approach",
    value: "Clear structure, reusable code, careful details",
  },
  {
    label: "Currently",
    value: "API design, admin dashboards, and product delivery",
  },
];

/** #profile: bio, portrait and facts (docs/COPY.md → About). `cvHref` comes from API documents. */
export function ProfileSection({ cvHref }: { cvHref: string }) {
  const cvIsFile = cvHref.startsWith("/api/");
  return (
    <Section id="profile" eyebrow="Profile" title="Hi, I'm Farhan." size="wide">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <ProjectImage
            src={profile.image}
            alt={`Portrait of ${profile.name}`}
            sizes="(min-width: 1024px) 420px, 92vw"
            className="aspect-[4/5] max-w-md"
          />
        </div>
        <div className="flex flex-col gap-8 lg:col-span-7">
          <div className="flex max-w-reading flex-col gap-4">
            <p className="font-heading text-headline text-ink text-balance">
              I connect product design with solid engineering.
            </p>
            <p className="text-copy-lg text-body text-pretty">
              I&apos;m a full-stack engineer based in Medan, Indonesia. I build
              web products from the first interface sketch to deployment,
              keeping the frontend, the API, and the data model consistent with
              each other.
            </p>
          </div>
          <dl className="grid border-t border-hairline">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="grid gap-1 border-b border-hairline py-4 sm:grid-cols-12 sm:gap-6"
              >
                <dt className="font-meta text-label text-muted uppercase sm:col-span-3">
                  {fact.label}
                </dt>
                <dd className="text-copy text-ink sm:col-span-9">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-3">
            {cvIsFile ? (
              <a
                href={cvHref}
                className={buttonClasses({ variant: "primary" })}
              >
                <Download aria-hidden="true" />
                Download CV
              </a>
            ) : (
              <Link
                href={cvHref}
                className={buttonClasses({ variant: "primary" })}
              >
                Download CV
              </Link>
            )}
            <Link href="#stack" className={buttonClasses({ variant: "ghost" })}>
              See the stack
              <ArrowDown aria-hidden="true" />
            </Link>
            <Link
              href="#documents"
              className={buttonClasses({ variant: "ghost" })}
            >
              Documents
              <ArrowDown aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
