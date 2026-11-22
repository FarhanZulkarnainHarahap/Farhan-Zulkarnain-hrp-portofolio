/**
 * DeviceMockup geometry, exported from Blender (design/blender/portfolio-3d.blend, scene "Device",
 * camera perpendicular to the screen plane, 90 mm). Percentages of the 1600×1000 render.
 * The four screen corners are axis-aligned (max misalignment 0.000%), so the screenshot is placed
 * with plain absolute positioning (no matrix3d).
 */
export const DEVICE_RENDER = { width: 1600, height: 1000 } as const;

export const DEVICE_SCREEN = {
  topLeft: { left: 25.342, top: 9.342 },
  topRight: { left: 74.658, top: 9.342 },
  bottomRight: { left: 74.658, top: 58.658 },
  bottomLeft: { left: 25.342, top: 58.658 },
} as const;

/** Opaque laptop bounds in the render (for the CSS ground shadow). */
export const DEVICE_BOUNDS = { left: 18.5, right: 81.44, top: 6, bottom: 90 } as const;

export const screenBox = {
  left: `${DEVICE_SCREEN.topLeft.left}%`,
  top: `${DEVICE_SCREEN.topLeft.top}%`,
  width: `${DEVICE_SCREEN.topRight.left - DEVICE_SCREEN.topLeft.left}%`,
  height: `${DEVICE_SCREEN.bottomLeft.top - DEVICE_SCREEN.topLeft.top}%`,
};
