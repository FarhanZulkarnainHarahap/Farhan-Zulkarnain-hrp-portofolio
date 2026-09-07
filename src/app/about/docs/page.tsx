import type { Metadata } from "next";
import AboutNestedShell from "@/components/navigation/AboutNestedShell";
import Documents from "@/components/kinetic/Documents";
export const metadata: Metadata = {
  title: "Documents",
  alternates: { canonical: "/about/docs" },
};
export default function Page() {
  return (
    <AboutNestedShell>
      <h1 className="nested-title">CV & credentials</h1>
      <Documents />
    </AboutNestedShell>
  );
}
