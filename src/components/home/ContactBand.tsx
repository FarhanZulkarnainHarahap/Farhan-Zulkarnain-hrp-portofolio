import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CopyEmail } from "@/components/site/CopyEmail";

export function ContactBand() {
  return (
    <section aria-labelledby="contact-band-title" className="py-section">
      <Container size="wide">
        <div
          data-reveal
          className="flex flex-col gap-8 rounded-(--card-radius) border border-hairline bg-surface p-(--card-padding) md:flex-row md:items-end md:justify-between md:p-12"
        >
          <div className="flex max-w-reading flex-col gap-3">
            <h2
              id="contact-band-title"
              className="font-heading text-headline text-ink text-balance"
            >
              Have a role or a project in mind?
            </h2>
            <p className="text-copy-lg text-body">Tell me about it.</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <Link
              href="/contact"
              className={buttonClasses({ variant: "primary", size: "lg" })}
            >
              Get in touch
            </Link>
            <CopyEmail className="md:items-end" />
          </div>
        </div>
      </Container>
    </section>
  );
}
