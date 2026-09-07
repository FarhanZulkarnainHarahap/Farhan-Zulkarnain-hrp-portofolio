import Link from "next/link";
import Shell from "@/components/kinetic/Shell";
export default function UserPage() {
  return (
    <Shell>
      <div className="route-intro">
        <p className="eyebrow">KINETIC SYSTEMS / MEMBER</p>
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
    </Shell>
  );
}
