import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Journey",
  description:
    "Farhan Zulkarnain Harahap's development journey, bootcamp, training, internship, and full-stack project milestones.",
  alternates: { canonical: "/journey" },
};

export default function JourneyPage() {
  return <LandingPage initialSection="journey" />;
}
