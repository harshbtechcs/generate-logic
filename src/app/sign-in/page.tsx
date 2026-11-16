import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { getSession } from "@/lib/session";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SignInPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getSession()) redirect(next);

  const notice = typeof sp.notice === "string" ? sp.notice : typeof sp.error === "string" ? sp.error : undefined;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your Cloud & DevOps journey."
      footer={
        <>
          New to Generate Logic?{" "}
          <Link href={`/sign-up${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-brand-teal hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm next={next} notice={notice} />
    </AuthShell>
  );
}
