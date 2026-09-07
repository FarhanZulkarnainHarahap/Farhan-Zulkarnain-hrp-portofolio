"use client";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  cloudinaryImageLoader,
  isCloudinaryImage,
  validImageSource,
} from "@/lib/image-loader";
import { useState, type ReactNode } from "react";
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -30px 0px" }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
export function SectionHeading({
  number,
  label,
  title,
  description,
}: {
  number: string;
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">
        <span>{number} /</span> {label}
      </p>
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}
export function SystemIcon({
  kind = "system",
}: {
  kind?: "system" | "signal" | "project" | "capability" | "trajectory" | "node";
}) {
  const paths = {
    system: "M12 2 22 7v10l-10 5-10-5V7L12 2Zm0 0v20M2 7l10 5 10-5",
    signal: "M2 12h4l3-7 6 14 3-7h4",
    project: "M3 5h18v14H3V5Zm0 4h18M6 7h1m2 0h1",
    capability: "M12 3v6m0 6v6M3 12h6m6 0h6M9 9h6v6H9V9Z",
    trajectory: "M3 19 8 9l7 6 6-12M1 19h4M6 9h4m3 6h4m2-12h4",
    node: "M12 3 21 12 12 21 3 12 12 3Zm0 6 3 3-3 3-3-3 3-3Z",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden="true"
    >
      <path d={paths[kind]} />
    </svg>
  );
}
export function CollectionState({
  loading,
  error,
  retry,
  empty = false,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
  empty?: boolean;
}) {
  if (loading)
    return (
      <div className="collection-state" role="status">
        <span className="loading-line" />
        Loading collection…
      </div>
    );
  if (error)
    return (
      <div className="collection-state" role="alert">
        <p>{error}</p>
        <button className="button secondary" onClick={retry}>
          Retry connection ↗
        </button>
      </div>
    );
  if (empty)
    return <div className="collection-state">No entries published yet.</div>;
  return null;
}
export function Media({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`media ${className}`}>
      {src && validImageSource(src) && !failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 767px) 90vw, 60vw"
          priority={priority}
          loader={isCloudinaryImage(src) ? cloudinaryImageLoader : undefined}
          unoptimized={!isCloudinaryImage(src)}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="media-fallback">
          <SystemIcon kind="project" />
          <span>Preview unavailable</span>
        </div>
      )}
    </div>
  );
}
