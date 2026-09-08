"use client";
import Image from "next/image";
import { useScene, type SceneMode } from "./SceneState";
export default function SpatialSystem({
  mode = "system",
}: {
  mode?: SceneMode;
}) {
  const { active } = useScene();
  return (
    <div
      className="spatial-system"
      data-scene-slot={mode}
      role="img"
      aria-label="Farhan FZ computational architecture"
    >
      <div className="spatial-fallback" aria-hidden="true">
        <Image
          src="/visuals/system-map.svg"
          alt=""
          fill
          sizes="(max-width:767px) 90vw, 50vw"
          unoptimized
        />
      </div>
      <div className="spatial-tag tag-top">
        <span className="status-dot" />
        {active || "FARHAN / COMPUTATIONAL ARCHITECTURE"}
      </div>
      <div className="spatial-caption">
        <span>FZ—CORE / {mode === "system" ? "BOOT" : mode.toUpperCase()}</span>
        <span>FIG. 001</span>
      </div>
    </div>
  );
}
