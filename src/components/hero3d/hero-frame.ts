/**
 * Geometry shared by the hero poster and the three.js HeroModel (Fase 10).
 * The poster is the 1200×1500 CAM_Hero render cropped to the model's alpha bounds. The model is
 * drawn at MODEL_SCALE of the Blender framing, about the frame centre: the poster rect is scaled
 * here and the three.js camera uses `zoom = MODEL_SCALE`, so both stay pixel-aligned. At this
 * scale the poster's box stays well below the H1 (≈ 0.6×), so the H1 remains the LCP element.
 */
export const MODEL_SCALE = 0.8;

const RENDER = { width: 1200, height: 1500 };
const CROP = { left: 224, top: 256, width: 744, height: 1016 };

const scaled = (start: number, size: number, total: number) => {
  const from = 50 + ((start / total) * 100 - 50) * MODEL_SCALE;
  return { from: `${from}%`, size: `${(size / total) * 100 * MODEL_SCALE}%` };
};
const x = scaled(CROP.left, CROP.width, RENDER.width);
const y = scaled(CROP.top, CROP.height, RENDER.height);

export const POSTER = {
  width: CROP.width,
  height: CROP.height,
  widths: [320, 560, 744] as const,
  rect: { left: x.from, top: y.from, width: x.size, height: y.size },
};
