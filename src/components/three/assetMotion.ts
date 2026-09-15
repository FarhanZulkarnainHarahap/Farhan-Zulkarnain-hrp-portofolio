export type AssetMotionInput = {
  kind: "core" | "identity";
  time: number;
  mobile: boolean;
  tablet: boolean;
  active: boolean;
  pointerX: number;
  pointerY: number;
  scroll: number;
};

/** Visible standby motion is independent of pointer input on every screen size. */
export function getAssetMotion(input: AssetMotionInput) {
  const { kind, time, mobile, tablet, active, pointerX, pointerY, scroll } = input;
  const strength = mobile ? 0.75 : tablet ? 0.9 : 1;
  const core = kind === "core";
  const hover = active ? 1 : 0;
  return {
    rotationX: strength * (Math.sin(time * 0.63) * 0.045 - pointerY * hover * 0.08 + scroll * 0.14),
    rotationY: strength * (Math.sin(time * 0.48) * (core ? 0.16 : 0.10) + pointerX * hover * 0.14 + scroll * 0.22),
    rotationZ: strength * (Math.sin(time * 0.4) * (core ? 0.035 : 0.018) + scroll * 0.04),
    positionY: strength * (Math.sin(time * 1.05) * (core ? 0.065 : 0.055) + scroll * 0.12),
    scale: 1 + Math.sin(time * 1.05) * 0.007 * strength + hover * 0.03,
    speed: (mobile ? 0.9 : tablet ? 0.95 : 1) * (1 + hover * 0.65),
  };
}
