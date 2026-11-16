import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. Track progress, save playlists and bookmark notes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-brand-teal hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
