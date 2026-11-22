import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) {
  // display: contents; scopes legacy-kinetic.css until /auth is restyled.
  return <div className="legacy-root">{children}</div>;
}
