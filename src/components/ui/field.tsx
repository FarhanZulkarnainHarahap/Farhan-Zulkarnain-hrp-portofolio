import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-(--field-radius) border border-(color:--field-border) bg-(--field-bg) px-3.5 font-body text-copy text-(color:--field-text) " +
  "placeholder:text-muted transition-colors duration-(--duration-fast) ease-standard " +
  "focus-visible:border-(color:--field-border-focus) " +
  "aria-invalid:border-(color:--field-border-error) disabled:cursor-not-allowed disabled:opacity-50";

export function Label({
  className,
  required,
  children,
  ...props
}: ComponentPropsWithoutRef<"label"> & { required?: boolean }) {
  return (
    <label
      className={cn("text-small font-medium text-ink", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="text-muted" aria-hidden="true">
          {" "}
          *
        </span>
      )}
    </label>
  );
}

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(control, "h-(--field-height)", className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  rows = 6,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      rows={rows}
      className={cn(control, "min-h-32 py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

/** Inline error under a field; link it with aria-describedby={id} on the control. */
export function FieldError({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  if (!children) return null;
  return (
    <p className={cn("text-small text-danger", className)} {...props}>
      {children}
    </p>
  );
}

/** Persistent helper text under a field. */
export function FieldHint({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return <p className={cn("text-small text-muted", className)} {...props} />;
}
