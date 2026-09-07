"use client";
import { useEffect, useRef, type ReactNode } from "react";
/** Native modal: focus stays inside, Escape closes, focus returns to its trigger. */
export default function Modal({
  children,
  onClose,
  label,
  busy = false,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      trigger?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="admin-dialog legacy-modal"
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current && !busy) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
