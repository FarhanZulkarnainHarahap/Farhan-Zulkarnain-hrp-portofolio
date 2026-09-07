import type { Metadata } from "next";
import AboutNestedShell from "@/components/navigation/AboutNestedShell";
import Capabilities from "@/components/kinetic/Capabilities";
export const metadata: Metadata = {
  title: "Capabilities",
  alternates: { canonical: "/about/skills" },
};
export default function Page() {
  return (
    <AboutNestedShell>
      <h1 className="nested-title">Capabilities</h1>
      <Capabilities />
    </AboutNestedShell>
  );
}
