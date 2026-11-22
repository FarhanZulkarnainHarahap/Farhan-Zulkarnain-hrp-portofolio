import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { StatusPage } from "./StatusPage";

export function NotFoundContent() {
  return (
    <StatusPage
      eyebrow="404"
      title="This page doesn't exist."
      body="The link may be outdated or mistyped."
      actions={
        <>
          <Link href="/" className={buttonClasses({ variant: "primary" })}>
            Back to home
          </Link>
          <Link
            href="/projects"
            className={buttonClasses({ variant: "secondary" })}
          >
            Browse projects
          </Link>
        </>
      }
    />
  );
}
