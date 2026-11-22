"use client";

import { useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { AuthCard } from "@/components/site/AuthCard";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        router.push(
          data.user?.role === "USER" ? "/dashboard/user" : "/admin/home",
        );
        router.refresh();
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="Admin access"
      footer={
        <>
          Need an account?{" "}
          <Link
            href="/auth/register"
            className="text-ink underline decoration-(color:--link-underline) underline-offset-(--link-underline-offset)"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <p
            role="alert"
            className="rounded-(--radius-control) border border-(color:--field-border-error) px-3.5 py-2.5 text-small text-danger"
          >
            {error}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="pr-12"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-1 inline-flex size-(--hit-area-min) -translate-y-1/2 items-center justify-center rounded-(--radius-control) text-muted hover:text-ink [&_svg]:size-(--icon-sm)"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          aria-busy={loading}
          className="w-full"
        >
          {loading ? (
            <LoaderCircle
              aria-hidden="true"
              className="motion-safe:animate-spin"
            />
          ) : null}
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
