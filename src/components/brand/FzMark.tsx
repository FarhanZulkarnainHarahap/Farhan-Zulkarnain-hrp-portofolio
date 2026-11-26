import type { SVGProps } from "react";

/**
 * The Fz monogram (brand identity, src/app/icon.svg): the original glyph outlines, drawn in
 * currentColor with the "z" in the accent. Decorative; the brand name is always next to it or
 * given by the surrounding link.
 */
export const FZ_VIEWBOX = "-0.4075 -0.3482 0.8148 0.8148";
export const FZ_F_PATH =
  "M-0.0009 -0.0233V0.1655H-0.0311L-0.0386 0.0896H-0.1774V0.2755L-0.1181 0.2938V0.3118H-0.2975V0.2938L-0.2382 0.2755V-0.138L-0.2975 -0.1564V-0.1743H0.0121L0.0502 -0.1934H0.0603L0.0801 -0.0373L0.0574 -0.0348L0.0085 -0.1369H-0.1774V0.0522H-0.0386L-0.0311 -0.0233Z";
export const FZ_Z_PATH =
  "M0.0307 0.3118V0.3003L0.2137 0.0274H0.0897L0.0526 0.0946H0.0336L0.0476 -0.0122H0.0631L0.0864 -0.005H0.2896V0.0065L0.1055 0.2798H0.2346L0.2781 0.2093H0.2982L0.2738 0.3118Z";

export function FzMark({
  framed = false,
  ...props
}: SVGProps<SVGSVGElement> & { framed?: boolean }) {
  return (
    <svg viewBox={FZ_VIEWBOX} aria-hidden="true" focusable="false" {...props}>
      {framed && (
        <rect
          x="-0.4075"
          y="-0.3482"
          width="0.8148"
          height="0.8148"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="0.02"
        />
      )}
      <path fill="currentColor" d={FZ_F_PATH} />
      <path fill="var(--ui-accent)" d={FZ_Z_PATH} />
    </svg>
  );
}
