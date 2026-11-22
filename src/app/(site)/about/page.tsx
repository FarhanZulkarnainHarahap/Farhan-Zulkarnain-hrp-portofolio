import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "About Me",
  description:
    "About Farhan Zulkarnain Harahap, a Full-Stack Web Developer from Medan focused on modern web applications, responsive UI, APIs, and deployment.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <LandingPage initialSection="about" />;
}
