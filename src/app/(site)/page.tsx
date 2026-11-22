import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";

// Title/description come from the root defaults (docs/COPY.md → Global).
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return <HomeContent />;
}
