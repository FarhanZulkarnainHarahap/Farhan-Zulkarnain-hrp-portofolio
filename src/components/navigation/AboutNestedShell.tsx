import Link from "next/link";
import Shell from "@/components/kinetic/Shell";
export default function AboutNestedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Shell>
      <div className="nested-nav">
        <Link href="/about">← About</Link>
        <Link href="/about/detail">Profile</Link>
        <Link href="/about/skills">Capabilities</Link>
        <Link href="/about/docs">Documents</Link>
      </div>
      {children}
    </Shell>
  );
}
