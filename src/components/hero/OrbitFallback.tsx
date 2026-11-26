import { FZ_F_PATH, FZ_VIEWBOX, FZ_Z_PATH } from "@/components/brand/FzMark";
import {
  buildOrbit,
  describeOrbit,
  projectNode,
  type OrbitRing,
} from "@/lib/display/orbit";
import type { Skill } from "@/types/content";

/**
 * Static technology orbit (SVG), drawn on the server from the API skills.
 *
 * ROLE: the permanent no-WebGL / reduced-data fallback of the hero orbit, and — until Fase 6 —
 * the TEMPORARY stand-in for the WebGL orbital system (marked data-orbit-renderer="svg"; Fase 6
 * mounts the R3F scene into the persistent canvas and hides this). It is not an animated CSS 2D
 * orbit: nothing moves here. It shows the same model as the 3D scene (src/lib/display/orbit.ts):
 * three inclined rings, nodes behind the Fz core drawn dimmer and occluded by it.
 */
const R = 112; // outer ring radius, SVG units
const SAMPLES = 72;

function arc(ring: OrbitRing, from: number, to: number) {
  const points: string[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = from + ((to - from) * i) / SAMPLES;
    const p = projectNode(ring, t);
    points.push(`${(p.x * R).toFixed(2)},${(p.y * R).toFixed(2)}`);
  }
  return points.join(" ");
}

function Nodes({ ring, front }: { ring: OrbitRing; front: boolean }) {
  return ring.nodes.map((node) => {
    const p = projectNode(ring, node.angle);
    if (p.z >= 0 !== front) return null;
    const x = p.x * R;
    const y = p.y * R;
    const right = x >= 0;
    return (
      <g key={node.id} opacity={front ? 1 : 0.38}>
        <rect
          x={x - 2.6}
          y={y - 2.6}
          width={5.2}
          height={5.2}
          fill="var(--ui-canvas)"
          stroke="var(--orbit-node)"
          strokeWidth={0.7}
          transform={`rotate(45 ${x} ${y})`}
        />
        {front && (
        <text
          className="orbit-label"
          x={x + (right ? 5.5 : -5.5)}
          y={y + 1.6}
          textAnchor={right ? "start" : "end"}
          fill={front ? "var(--ui-ink)" : "var(--ui-muted)"}
          fontSize={4.6}
          fontFamily="var(--font-meta)"
          letterSpacing={0.3}
        >
          {node.label.toUpperCase()}
        </text>
        )}
      </g>
    );
  });
}

export function OrbitFallback({ skills }: { skills: Skill[] }) {
  const rings = buildOrbit(skills);
  const summary = describeOrbit(rings);
  const core = 46;
  return (
    <svg
      viewBox="-132 -100 264 200"
      role="img"
      aria-label={
        summary
          ? `Technology orbit around the Fz monogram. ${summary}.`
          : "Technology orbit around the Fz monogram."
      }
      className="size-full overflow-visible"
      data-orbit-fallback
    >
      {/* Back halves of the rings (behind the core) */}
      {rings.map((ring) => (
        <polyline
          key={`${ring.id}-back`}
          points={arc(ring, Math.PI, Math.PI * 2)}
          fill="none"
          stroke="var(--orbit-ring)"
          strokeWidth={0.5}
          strokeDasharray="1.2 2.4"
        />
      ))}
      {rings.map((ring) => (
        <Nodes key={`${ring.id}-back-nodes`} ring={ring} front={false} />
      ))}

      {/* Core: the Fz monogram on a square plate. Opaque, so it occludes what passes behind. */}
      <g>
        <rect
          x={-core / 2}
          y={-core / 2}
          width={core}
          height={core}
          fill="var(--orbit-core)"
          stroke="var(--ui-hairline-strong)"
          strokeWidth={0.6}
        />
        <svg
          x={-core / 2 + 4}
          y={-core / 2 + 4}
          width={core - 8}
          height={core - 8}
          viewBox={FZ_VIEWBOX}
          aria-hidden="true"
        >
          <path fill="var(--ui-ink)" d={FZ_F_PATH} />
          <path fill="var(--ui-accent)" d={FZ_Z_PATH} />
        </svg>
      </g>

      {/* Front halves and their nodes, over the core */}
      {rings.map((ring) => (
        <polyline
          key={`${ring.id}-front`}
          points={arc(ring, 0, Math.PI)}
          fill="none"
          stroke="var(--orbit-ring)"
          strokeWidth={0.6}
        />
      ))}
      {rings.map((ring) => (
        <Nodes key={`${ring.id}-front-nodes`} ring={ring} front />
      ))}

      {/* Ring index labels at each ring's leftmost point */}
      {rings.map((ring, index) => {
        const p = projectNode(ring, Math.PI);
        return (
          <text
            key={`${ring.id}-label`}
            className="orbit-label"
            x={p.x * R - 4}
            y={p.y * R - 4}
            textAnchor="end"
            fill="var(--ui-muted)"
            fontSize={4}
            fontFamily="var(--font-meta)"
            letterSpacing={0.4}
          >
            {`0${index + 1} ${ring.label.toUpperCase()}`}
          </text>
        );
      })}
    </svg>
  );
}
