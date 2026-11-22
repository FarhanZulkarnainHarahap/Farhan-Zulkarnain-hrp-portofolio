"use client";
// Errors inside public pages: the (site) layout keeps the header and footer around this.
import Link from "next/link";
import { StatusPage } from "@/components/site/StatusPage";
import { Button, buttonClasses } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusPage
      eyebrow="Something went wrong"
      title="This page couldn't be loaded."
      body="The content service may be temporarily unavailable. Please try again in a moment."
      actions={
        <>
          <Button onClick={reset}>Try again</Button>
          <Link href="/" className={buttonClasses({ variant: "secondary" })}>
            Back to home
          </Link>
        </>
      }
    />
  );
}
