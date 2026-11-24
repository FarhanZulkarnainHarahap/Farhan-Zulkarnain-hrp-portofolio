import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHeader } from "@/components/site/PageHeader";
import { CopyEmail } from "@/components/site/CopyEmail";
import { ExternalMark } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Farhan Zulkarnain Harahap about full-time roles, freelance projects, or collaboration.",
  alternates: { canonical: "/contact" },
  // Own title/description/url for social cards (images come from ./opengraph-image.tsx).
  openGraph: {
    title: "Contact · Farhan Zulkarnain Harahap",
    description:
      "Contact Farhan Zulkarnain Harahap about full-time roles, freelance projects, or collaboration.",
    url: "/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact · Farhan Zulkarnain Harahap",
    description:
      "Contact Farhan Zulkarnain Harahap about full-time roles, freelance projects, or collaboration.",
  },
};

const linkClass =
  "inline-flex min-h-(--hit-area-min) items-center gap-1.5 text-copy text-ink underline decoration-(color:--link-underline) underline-offset-(--link-underline-offset) [&_svg]:size-(--icon-sm)";

/** Two columns: direct contact details, and the working form (same request as before). */
export default function ContactPage() {
  return (
    <main id="main-content" className="flex-1">
      <PageHeader
        eyebrow="Contact"
        title="Let's talk."
        lead="Whether it's a role, a project, or a question, send a message and I'll reply by email."
      />
      <section aria-label="Contact" className="pb-section">
        <Container
          size="wide"
          className="grid gap-12 lg:grid-cols-12 lg:gap-16"
        >
          <div className="flex flex-col gap-8 lg:col-span-4">
            <p className="flex items-center gap-2.5 text-small text-ink">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-pill bg-success"
              />
              Open to full-time roles and freelance projects
            </p>
            <dl className="flex flex-col border-t border-hairline">
              <div className="flex flex-col gap-1 border-b border-hairline py-4">
                <dt className="font-meta text-label text-muted uppercase">
                  Email
                </dt>
                <dd className="flex flex-col">
                  <a href={`mailto:${profile.email}`} className={linkClass}>
                    Write an email
                  </a>
                  <CopyEmail />
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-hairline py-4">
                <dt className="font-meta text-label text-muted uppercase">
                  Elsewhere
                </dt>
                <dd className="flex flex-wrap gap-x-6">
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    GitHub
                    <ExternalMark />
                  </a>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    LinkedIn
                    <ExternalMark />
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-hairline py-4">
                <dt className="font-meta text-label text-muted uppercase">
                  Location
                </dt>
                <dd className="text-copy text-ink">
                  Based in Medan, Indonesia (WIB, UTC+7)
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-(--card-radius) border border-hairline bg-surface p-(--card-padding) md:p-10 lg:col-span-8">
            <ContactForm />
          </div>
        </Container>
      </section>
    </main>
  );
}
