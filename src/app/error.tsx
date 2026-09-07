"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="not-found" id="main-content">
      <p className="eyebrow">CONNECTION INTERRUPTED</p>
      <h1>Unable to load this page.</h1>
      <p>The data service may be unavailable. Please try again.</p>
      <div className="button-row">
        <button className="button" onClick={reset}>
          Retry connection ↗
        </button>
        <Link className="text-link" href="/">
          Back home
        </Link>
      </div>
    </main>
  );
}
