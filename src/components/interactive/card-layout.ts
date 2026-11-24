/**
 * Where the contact rows sit on the rendered back of the Fz card, in % of the frame. Projected from
 * the Blender scene (BK_Line_* in the final flip pose, CAM_Asset, 720×900; the footer render uses the
 * same camera so the percentages hold): lines span x 33.3–65 %, at y 45.0 / 53.1 / 61.1 %.
 * `rows` = the baseline just above each line; `width` runs to the card's inner edge.
 */
export const BACK_LAYOUT = { left: 33.4, width: 42, rows: [44.2, 52.3, 60.3] } as const;
