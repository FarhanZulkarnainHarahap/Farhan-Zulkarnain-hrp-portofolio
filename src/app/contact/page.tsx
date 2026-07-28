import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Farhan Zulkarnain Harahap for full-stack developer roles, freelance projects, collaboration, and web application work.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <LandingPage initialSection="contact" />;
}
