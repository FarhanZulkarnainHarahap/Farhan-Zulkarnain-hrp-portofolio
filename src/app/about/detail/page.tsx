import type { Metadata } from "next";
import AboutNestedShell from "@/components/navigation/AboutNestedShell";
import Profile from "@/components/kinetic/Profile";
export const metadata: Metadata = {
  title: "Profile",
  alternates: { canonical: "/about/detail" },
};
export default function Page() {
  return (
    <AboutNestedShell>
      <h1 className="nested-title">Profile</h1>
      <Profile detail />
    </AboutNestedShell>
  );
}
