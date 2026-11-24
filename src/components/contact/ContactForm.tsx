"use client";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/field";
import { apiFetch } from "@/lib/api-client";
import { profile } from "@/lib/site";

type Field = "name" | "email" | "subject" | "message";
type Values = Record<Field, string>;
const FIELDS: { name: Field; label: string }[] = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email" },
  { name: "subject", label: "Subject" },
  { name: "message", label: "Message" },
];
const EMPTY: Values = { name: "", email: "", subject: "", message: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Values) {
  const errors: Partial<Record<Field, string>> = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!EMAIL.test(values.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!values.subject.trim()) errors.subject = "Please add a subject.";
  if (!values.message.trim()) errors.message = "Please write a message.";
  return errors;
}

/**
 * Contact form. The request is exactly the pre-redesign one:
 *   apiFetch("/api/contact", POST, { name, email, message: "Subject: …\n\n…" })
 * and success requires response.ok && result.success === true.
 */
export function ContactForm() {
  const id = useId();
  const fieldId = (field: Field) => `${id}-${field}`;
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [result, setResult] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const submitting = status === "submitting";

  function set(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field])
      setErrors((current) => ({
        ...current,
        [field]: validate({ ...values, [field]: value })[field],
      }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return; // no double submit
    const found = validate(values);
    setErrors(found);
    const invalid = FIELDS.filter((field) => found[field.name]);
    if (invalid.length) {
      setStatus("idle");
      setResult("");
      // One error: focus that field. Several: focus the summary, which links to each field.
      if (invalid.length === 1)
        document.getElementById(fieldId(invalid[0].name))?.focus();
      else requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus("submitting");
    setResult("");
    const email = values.email.trim();
    try {
      const response = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email,
          message: `Subject: ${values.subject.trim()}\n\n${values.message.trim()}`,
        }),
      });
      const body = await response.json();
      if (!response.ok || body.success !== true) throw new Error("send-failed");
      setStatus("success");
      setResult(
        `Thanks, your message has been sent. I'll reply to ${email} soon.`,
      );
      setValues(EMPTY);
    } catch (error) {
      setStatus("error");
      setResult(
        error instanceof Error && error.name === "TimeoutError"
          ? `The request took too long. Please try again, or email me directly at ${profile.email}.`
          : `Your message couldn't be sent. Please try again, or email me directly at ${profile.email}.`,
      );
    }
  }

  const invalid = FIELDS.filter((field) => errors[field.name]);

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-6"
    >
      <h2 id={`${id}-title`} className="font-heading text-headline text-ink">
        Send a message
      </h2>

      {invalid.length > 0 && (
        <div
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
          className="flex flex-col gap-2 rounded-(--card-radius) border border-(color:--field-border-error) p-4"
        >
          <p className="flex items-center gap-2 text-small font-medium text-danger">
            <TriangleAlert aria-hidden="true" className="size-(--icon-sm)" />
            Please fix {invalid.length}{" "}
            {invalid.length === 1 ? "field" : "fields"} before sending.
          </p>
          <ul className="flex flex-col gap-1 pl-6 text-small">
            {invalid.map((field) => (
              <li key={field.name}>
                <a
                  href={`#${fieldId(field.name)}`}
                  className="text-ink underline underline-offset-(--link-underline-offset)"
                >
                  {field.label}: {errors[field.name]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {(["name", "email"] as const).map((field) => (
          <div key={field} className="flex flex-col gap-2">
            <Label htmlFor={fieldId(field)} required>
              {field === "name" ? "Name" : "Email"}
            </Label>
            <Input
              id={fieldId(field)}
              name={field}
              type={field === "email" ? "email" : "text"}
              autoComplete={field === "email" ? "email" : "name"}
              placeholder={
                field === "email" ? "you@company.com" : "Your full name"
              }
              value={values[field]}
              onChange={(event) => set(field, event.target.value)}
              aria-invalid={Boolean(errors[field])}
              aria-describedby={
                errors[field] ? `${fieldId(field)}-error` : undefined
              }
              required
            />
            <FieldError id={`${fieldId(field)}-error`}>
              {errors[field]}
            </FieldError>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={fieldId("subject")} required>
          Subject
        </Label>
        <Input
          id={fieldId("subject")}
          name="subject"
          placeholder="e.g. Frontend role at Acme"
          value={values.subject}
          onChange={(event) => set("subject", event.target.value)}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={
            errors.subject ? `${fieldId("subject")}-error` : undefined
          }
          required
        />
        <FieldError id={`${fieldId("subject")}-error`}>
          {errors.subject}
        </FieldError>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={fieldId("message")} required>
          Message
        </Label>
        <Textarea
          id={fieldId("message")}
          name="message"
          rows={7}
          placeholder="What are you working on, and how can I help?"
          value={values.message}
          onChange={(event) => set("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? `${fieldId("message")}-error` : undefined
          }
          required
        />
        <FieldError id={`${fieldId("message")}-error`}>
          {errors.message}
        </FieldError>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-small text-muted">All fields are required.</p>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Sending…" : "Send message"}
        </Button>
      </div>

      {/* Success is announced politely; a failed send is assertive. Both regions stay mounted. */}
      <div role="status" className="min-h-6">
        {status === "success" && (
          <p className="flex items-start gap-2 transition-[opacity,translate] duration-(--duration-base) ease-enter starting:translate-y-1 starting:opacity-0 motion-reduce:starting:translate-y-0 text-copy text-success">
            <CircleCheck
              aria-hidden="true"
              className="mt-1 size-(--icon-sm) shrink-0"
            />
            {result}
          </p>
        )}
      </div>
      <div role="alert">
        {status === "error" && (
          <p className="flex items-start gap-2 transition-[opacity,translate] duration-(--duration-base) ease-enter starting:translate-y-1 starting:opacity-0 motion-reduce:starting:translate-y-0 text-copy text-danger">
            <TriangleAlert
              aria-hidden="true"
              className="mt-1 size-(--icon-sm) shrink-0"
            />
            {result}
          </p>
        )}
      </div>
    </form>
  );
}
