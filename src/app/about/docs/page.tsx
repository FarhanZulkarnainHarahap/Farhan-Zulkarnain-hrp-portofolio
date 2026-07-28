import type { Metadata } from "next";
import AboutNestedShell from "@/components/navigation/AboutNestedShell";
import DocSection from "@/components/sections/document/DocSection";

export const metadata: Metadata = {
  title: "Documents",
  description:
    "Professional documents, CV, resume, certificates, and downloadable assets for Farhan Zulkarnain Harahap.",
  alternates: { canonical: "/about/docs" },
};

export default function DocumentsPage() {
  return (
    <AboutNestedShell>
      <DocSection />
    </AboutNestedShell>
  );
}
