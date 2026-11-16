"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert, Divider, Field, SubmitButton } from "./FormBits";
import { GoogleButton } from "./GoogleButton";

const initialMessages: Record<string, { kind: "error" | "success"; text: string }> = {
  google: { kind: "error", text: "Google sign-in did not complete. Please try again." },
  reset: { kind: "success", text: "Password updated. Sign in with your new password." },
  verified: { kind: "success", text: "Email verified. You can sign in now." },
  deleted: { kind: "success", text: "Your account and all its data have been deleted." },
};

export function SignInForm({ next, notice }: { next: string; notice?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const initial = notice ? initialMessages[notice] : undefined;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError(null);
    setUnverifiedEmail(null);
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password, callbackURL: next });
    if (error) {
      setLoading(false);
      if (error.code === "EMAIL_NOT_VERIFIED" || error.status === 403) {
        if (error.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(email);
          setError("Please verify your email first — check your inbox for the link.");
        } else {
          setError(error.message ?? "You cannot sign in with this account.");
        }
      } else if (error.status === 429) {
        setError("Too many attempts. Please wait a minute and try again.");
      } else {
        // Same message for wrong email or wrong password, so accounts can't be guessed.
        setError("Incorrect email or password.");
      }
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function resend() {
    if (!unverifiedEmail) return;
    await authClient.sendVerificationEmail({ email: unverifiedEmail, callbackURL: next });
    setResent(true);
  }

  return (
    <>
      <GoogleButton next={next} />
      <Divider />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {initial && !error && <Alert kind={initial.kind}>{initial.text}</Alert>}
        {error && (
          <Alert kind="error">
            {error}
            {unverifiedEmail && !resent && (
              <>
                {" "}
                <button type="button" onClick={resend} className="font-medium underline">
                  Resend link
                </button>
              </>
            )}
            {resent && " A new link has been sent."}
          </Alert>
        )}
        <Field label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        <div className="flex flex-col gap-2">
          <Field label="Password" name="password" type="password" autoComplete="current-password" required />
          <Link href="/forgot-password" className="self-end text-sm text-brand-teal hover:underline">
            Forgot password?
          </Link>
        </div>
        <SubmitButton loading={loading}>Sign in</SubmitButton>
      </form>
    </>
  );
}
