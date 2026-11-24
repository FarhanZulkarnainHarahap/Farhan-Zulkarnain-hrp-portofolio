/**
 * Full-stack application anatomy — a monochrome dimensional drawing (Fase 9.1) for the /about
 * header slot. Exploded axonometric stack: Interface → API → Service → Database → Deployment.
 * Inline SVG, colors from tokens (stroke-ink / fill-* utilities → light/dark automatically), labels
 * are real <text>. Outline/glyph lines have pathLength="1" so the motion layer can draw them once ([data-draw]);
 * the dash-dot centre line keeps its real dash pattern and fades in instead.
 */
import { useId } from "react";
import { cn } from "@/lib/utils";

const W = 480;
const H = 400;
const CX = 300; // stack centre
const HALF = 110; // half plate width
const DEPTH = 64; // projected plate depth
const THICK = 8; // plate thickness
const GAP = 66; // vertical pitch between plates
const TOP = 28;

type Layer = {
  code: string;
  name: string;
  note: string;
  glyph: (m: Mapper) => string[];
};
type Mapper = (u: number, v: number) => [number, number];

/** Unit square (u along the left→top edge, v along left→bottom edge) to a plate's top face. */
function plate(i: number) {
  const y = TOP + i * GAP;
  const L: [number, number] = [CX - HALF, y + DEPTH / 2];
  const map: Mapper = (u, v) => [
    L[0] + u * HALF + v * HALF,
    L[1] - (u * DEPTH) / 2 + (v * DEPTH) / 2,
  ];
  return { y, L, map };
}

const p = (pts: [number, number][], close = false) =>
  `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")}${close ? " Z" : ""}`;
const rect = (m: Mapper, u0: number, v0: number, u1: number, v1: number) =>
  p([m(u0, v0), m(u1, v0), m(u1, v1), m(u0, v1)], true);
const line = (m: Mapper, u0: number, v0: number, u1: number, v1: number) =>
  p([m(u0, v0), m(u1, v1)]);

const LAYERS: Layer[] = [
  {
    code: "1",
    name: "INTERFACE",
    note: "Client · UI",
    glyph: (m) => [
      rect(m, 0.18, 0.2, 0.82, 0.8),
      line(m, 0.3, 0.2, 0.3, 0.8),
      line(m, 0.45, 0.32, 0.7, 0.32),
    ],
  },
  {
    code: "2",
    name: "API",
    note: "HTTP · JSON",
    glyph: (m) => [
      line(m, 0.2, 0.3, 0.8, 0.3),
      line(m, 0.2, 0.5, 0.8, 0.5),
      line(m, 0.2, 0.7, 0.8, 0.7),
    ],
  },
  {
    code: "3",
    name: "SERVICE",
    note: "Business logic",
    glyph: (m) => [
      rect(m, 0.2, 0.2, 0.45, 0.45),
      rect(m, 0.55, 0.2, 0.8, 0.45),
      rect(m, 0.2, 0.55, 0.45, 0.8),
      rect(m, 0.55, 0.55, 0.8, 0.8),
    ],
  },
  {
    code: "4",
    name: "DATABASE",
    note: "Relational data",
    glyph: (m) => [
      rect(m, 0.25, 0.2, 0.75, 0.8),
      line(m, 0.25, 0.4, 0.75, 0.4),
      line(m, 0.25, 0.6, 0.75, 0.6),
    ],
  },
  {
    code: "5",
    name: "DEPLOYMENT",
    note: "Build · runtime",
    glyph: (m) => [
      rect(m, 0.3, 0.3, 0.7, 0.7),
      line(m, 0.5, 0.15, 0.5, 0.3),
      line(m, 0.5, 0.7, 0.5, 0.85),
      line(m, 0.15, 0.5, 0.3, 0.5),
      line(m, 0.7, 0.5, 0.85, 0.5),
    ],
  },
];

export function StackAnatomy({ className }: { className?: string }) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const last = plate(LAYERS.length - 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      data-draw
      className={cn("h-auto w-full font-meta", className)}
    >
      <title id={titleId}>Anatomy of a full-stack application</title>
      <desc id={descId}>
        A technical drawing of five stacked layers, from top to bottom:
        interface (client and UI), API (HTTP and JSON), service (business
        logic), database (relational data) and deployment (build and runtime),
        connected along one centre line.
      </desc>

      {/* Centre line through the stack (dash-dot) */}
      <path
        className="draw-fade fill-none stroke-hairline-strong"
        strokeWidth={0.8}
        strokeDasharray="10 3 2 3"
        d={p([
          [CX, TOP - 14],
          [CX, last.y + DEPTH + THICK + 14],
        ])}
      />

      {LAYERS.map((layer, i) => {
        const { y, L, map } = plate(i);
        const T: [number, number] = [CX, y];
        const R: [number, number] = [CX + HALF, y + DEPTH / 2];
        const B: [number, number] = [CX, y + DEPTH];
        const down = (q: [number, number]): [number, number] => [
          q[0],
          q[1] + THICK,
        ];
        const labelY = L[1];
        return (
          <g key={layer.code}>
            {/* Faces: top (raised), sides (surface / hairline) */}
            <path className="draw-fade fill-raised" d={p([L, T, R, B], true)} />
            <path
              className="draw-fade fill-surface"
              d={p([L, B, down(B), down(L)], true)}
            />
            <path
              className="draw-fade fill-hairline"
              d={p([B, R, down(R), down(B)], true)}
            />
            {/* Outline */}
            <path
              className="draw fill-none stroke-ink"
              pathLength={1}
              strokeWidth={1.4}
              strokeLinejoin="round"
              d={`${p([L, T, R, B], true)} ${p([L, down(L), down(B), down(R), R])} ${p([B, down(B)])}`}
            />
            {/* Glyph on the top face */}
            {layer.glyph(map).map((d, k) => (
              <path
                key={k}
                className="draw fill-none stroke-muted"
                pathLength={1}
                strokeWidth={0.9}
                d={d}
              />
            ))}
            {/* Leader to the label on the left */}
            <path
              className="draw fill-none stroke-muted"
              pathLength={1}
              strokeWidth={0.7}
              d={p([L, [150, labelY]])}
            />
            <circle className="draw-fade fill-ink" cx={L[0]} cy={L[1]} r={2} />
            <g className="draw-fade">
              <rect
                className="fill-none stroke-ink"
                x={14}
                y={labelY - 16}
                width={16}
                height={16}
                strokeWidth={0.8}
              />
              <text
                x={22}
                y={labelY - 4.5}
                textAnchor="middle"
                className="fill-ink"
                fontSize={10}
              >
                {layer.code}
              </text>
              <text
                x={38}
                y={labelY - 4}
                className="fill-ink"
                fontSize={11}
                letterSpacing="0.08em"
              >
                {layer.name}
              </text>
              <text x={38} y={labelY + 10} className="fill-muted" fontSize={10}>
                {layer.note}
              </text>
            </g>
          </g>
        );
      })}

      {/* Sheet note */}
      <text
        x={W - 14}
        y={H - 10}
        textAnchor="end"
        className="draw-fade fill-muted"
        fontSize={9}
        letterSpacing="0.08em"
      >
        APPLICATION ANATOMY · NOT TO SCALE
      </text>
    </svg>
  );
}
