import type { Metadata } from "next";
import "./admin.css";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) {
  // display: contents — scopes admin.css without adding a layout box.
  return <div className="dashboard-root">{children}</div>;
}
