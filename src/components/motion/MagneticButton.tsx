"use client";

import {
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from "react";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  external?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorHTMLAttributes<HTMLAnchorElement>;

export function MagneticButton({
  children,
  className = "",
  href,
  external,
  type,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const setNodeRef = (node: HTMLElement | null) => {
    ref.current = node;
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    ref.current.style.setProperty("--magnetic-x", `${x * 0.18}px`);
    ref.current.style.setProperty("--magnetic-y", `${y * 0.18}px`);
  };

  const reset = () => {
    ref.current?.style.setProperty("--magnetic-x", "0px");
    ref.current?.style.setProperty("--magnetic-y", "0px");
  };

  const sharedProps = {
    ...props,
    onPointerMove: handlePointerMove,
    onPointerLeave: reset,
    style: {
      "--magnetic-x": "0px",
      "--magnetic-y": "0px",
      ...(props.style ?? {}),
    } as CSSProperties,
    className: `motion-safe:translate-x-[var(--magnetic-x)] motion-safe:translate-y-[var(--magnetic-y)] ${className}`,
  };

  if (href) {
    return (
      <a
        {...sharedProps}
        ref={setNodeRef as Ref<HTMLAnchorElement>}
        href={href}
        target={external ? "_blank" : props.target}
        rel={external ? "noopener noreferrer" : props.rel}
      >
        {children}
      </a>
    );
  }

  return (
    <button {...sharedProps} ref={setNodeRef as Ref<HTMLButtonElement>} type={type ?? "button"}>
      {children}
    </button>
  );
}
