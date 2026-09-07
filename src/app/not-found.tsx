import Link from "next/link";
import Shell from "@/components/kinetic/Shell";
export default function NotFound() {
  return (
    <Shell>
      <div className="not-found">
        <p className="eyebrow">ERROR / 404</p>
        <div aria-hidden="true">404</div>
        <h1>Node not found.</h1>
        <p>
          This connection doesn’t lead to a page. Let’s get you back to the
          system.
        </p>
        <Link href="/" className="button">
          Back home ↗
        </Link>
      </div>
    </Shell>
  );
}
