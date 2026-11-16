"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert, Field, SubmitButton } from "./FormBits";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setLoading(false);
    if (error?.status === 429) {
      setError("Too many requests. Please wait a few minutes.");
      return;
    }
    // Always show the same message, whether or not the email has an account.
    setDone(true);
  }

  if (done) {
    return (
      <Alert kind="success">
        If an account exists for that email, a reset link is on its way. It expires in 1 hour.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error && <Alert kind="error">{error}</Alert>}
      <Field label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <SubmitButton loading={loading}>Send reset link</SubmitButton>
    </form>
  );
}
