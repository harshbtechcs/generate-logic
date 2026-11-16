"use client";

import { useState } from "react";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Alert, Divider, Field, SubmitButton } from "./FormBits";
import { GoogleButton } from "./GoogleButton";

const schema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name").max(80, "Name is too long"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(128, "Password is too long")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

type Errors = Partial<Record<"name" | "email" | "password" | "confirm", string>>;

export function SignUpForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      const fe: Errors = {};
      for (const issue of parsed.error.issues) fe[issue.path[0] as keyof Errors] ??= issue.message;
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    const { name, email, password } = parsed.data;
    const { error } = await authClient.signUp.email({ name, email, password, callbackURL: "/dashboard?welcome=1" });
    setLoading(false);
    if (error) {
      setFormError(
        error.code === "USER_ALREADY_EXISTS" || error.status === 422
          ? "An account with this email already exists. Try signing in instead."
          : error.message ?? "Something went wrong. Please try again.",
      );
      return;
    }
    setSentTo(email);
  }

  async function resend() {
    if (!sentTo) return;
    await authClient.sendVerificationEmail({ email: sentTo, callbackURL: "/dashboard?welcome=1" });
    setResent(true);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-teal/40 bg-brand-teal/10 text-brand-teal">
          <MailCheck size={30} aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold">Check your inbox</h2>
        <p className="text-[15px] leading-relaxed text-text-muted">
          We sent a verification link to <span className="font-medium text-text">{sentTo}</span>. Click it to activate
          your account. The link expires in 1 hour.
        </p>
        {resent ? (
          <Alert kind="success">A new link is on its way.</Alert>
        ) : (
          <button type="button" onClick={resend} className="text-sm text-brand-teal hover:underline">
            Didn&apos;t get it? Resend the email
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <GoogleButton next="/dashboard?welcome=1" />
      <Divider />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError && <Alert kind="error">{formError}</Alert>}
        <Field label="Full name" name="name" autoComplete="name" placeholder="Harsh Yadav" error={errors.name} required />
        <Field label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email} required />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          error={errors.password}
          hint="At least 8 characters, with a letter and a number."
          required
        />
        <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" error={errors.confirm} required />
        <SubmitButton loading={loading}>Create account</SubmitButton>
        <p className="text-center text-xs leading-relaxed text-text-faint">
          By creating an account you agree to our{" "}
          <a href="/terms" className="underline hover:text-brand-teal">Terms</a> and{" "}
          <a href="/privacy" className="underline hover:text-brand-teal">Privacy Policy</a>.
        </p>
      </form>
    </>
  );
}
