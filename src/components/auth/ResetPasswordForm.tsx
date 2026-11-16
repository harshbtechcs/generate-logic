"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert, Field, SubmitButton } from "./FormBits";

export function ResetPasswordForm({ token, invalid }: { token?: string; invalid?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (invalid || !token) {
    return (
      <div className="flex flex-col gap-4">
        <Alert kind="error">This reset link is invalid or has expired.</Alert>
        <Link href="/forgot-password" className="text-center text-sm text-brand-teal hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Use at least 8 characters, with a letter and a number.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Could not reset password. The link may have expired.");
      return;
    }
    router.push("/sign-in?notice=reset");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error && <Alert kind="error">{error}</Alert>}
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
        required
      />
      <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required />
      <SubmitButton loading={loading}>Update password</SubmitButton>
    </form>
  );
}
