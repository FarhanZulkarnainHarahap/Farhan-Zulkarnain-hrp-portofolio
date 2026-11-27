"use client";
/**
 * MaskedText (Fase K3, Motion): words (or the whole line) slide up from below a clipping mask when
 * the text enters the viewport. Server markup is the plain text in its final position (useReveal):
 * the split pieces are aria-hidden and the real text is kept for assistive tech, so screen readers
 * read one sentence, not fragments. Do NOT use it for the LCP heading (the hero H1 is revealed by
 * GSAP SplitText at runtime and reverted, see gsap-utils.maskedTextReveal).
 */
import { m } from "motion/react";
import { useMemo, useRef, type RefObject } from "react";
import { maskVariants, staggerVariants } from "@/lib/animation/motion-variants";
import { getMotionTokens } from "@/lib/design-tokens";
import { useReveal } from "./useReveal";

type Tag = "p" | "h2" | "h3" | "h4" | "span" | "div";

export function MaskedText({ text, as = "p", by = "word", className }: { text: string; as?: Tag; by?: "word" | "line"; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { variant } = useReveal(ref);
  const { parent, child } = useMemo(() => {
    const t = getMotionTokens();
    return { parent: staggerVariants(t, t.stagger.words), child: maskVariants(t) };
  }, []);
  const pieces = by === "word" ? text.split(/(\s+)/) : [text];

  const Tag = as as "p";
  return (
    <Tag ref={ref as RefObject<HTMLParagraphElement>} className={className}>
      <span className="sr-only">{text}</span>
      <m.span aria-hidden="true" className="inline" variants={parent} initial={false} animate={variant}>
        {pieces.map((piece, index) =>
          /^\s+$/.test(piece) ? (
            piece
          ) : (
            <span key={index} className={by === "word" ? "mask-word" : "mask-line"}>
              <m.span variants={child}>
                {piece}
              </m.span>
            </span>
          ),
        )}
      </m.span>
    </Tag>
  );
}
