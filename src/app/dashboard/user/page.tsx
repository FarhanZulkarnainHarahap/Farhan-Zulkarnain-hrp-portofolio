import Link from "next/link";
import DashboardShell from "@/components/admin/DashboardShell";
export default function UserPage() {
  return (
    <DashboardShell>
      <div className="route-intro">
        <p className="eyebrow">Member area</p>
        <h1>Welcome back.</h1>
        <p>Explore Farhan’s projects, capabilities, and latest work.</p>
        <div className="button-row">
          <Link className="button" href="/projects">
            Explore projects ↗
          </Link>
          <Link className="text-link" href="/contact">
            Contact Farhan ↗
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
