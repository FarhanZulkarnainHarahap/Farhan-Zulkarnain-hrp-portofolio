export type NodePosition = [number, number, number];
/** Engineered staggered array, not a circular orbit. Pages bound rendering cost. */
export function capabilityLayout(count: number, mobile = false): NodePosition[] {
  if (count === 0) return [];
  if (mobile) return Array.from({ length: count }, (_, i) => [(i - (count - 1) / 2) * 0.91, -0.92, (i % 2) * 0.035]);
  if (count === 1) return [[0, -1.12, 0.1]];
  if (count === 2) return [[-1.42, 0, 0.06], [1.42, 0, -0.06]];
  if (count === 3) return [[-1.52, 0.72, 0.06], [1.52, 0.72, -0.08], [0, -1.12, 0.12]];
  if (count === 4) return [[-1.5, 0.9, 0.06], [1.5, 0.9, -0.08], [-1.3, -0.97, 0.1], [1.3, -0.97, -0.1]];
  if (count === 5) return [[-1.65, 0.65, 0.08], [0, 1.3, -0.12], [1.65, 0.65, -0.06], [-1.05, -1.05, 0.12], [1.05, -1.05, -0.1]];
  // More nodes expand along top and bottom bus rows, keeping > 0.9 units spacing.
  const top = Math.ceil(count / 2), bottom = count - top;
  return Array.from({ length: count }, (_, i) => {
    const first = i < top, rowCount = first ? top : bottom, index = first ? i : i - top;
    return [(index - (rowCount - 1) / 2) * 1.08, first ? 1.25 : -1.15, ((i % 3) - 1) * 0.1];
  });
}
export const CAPABILITY_PATH = "/models/capability/";
