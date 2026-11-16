import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Set a new password" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : undefined;
  const invalid = typeof sp.error === "string";

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you don't use anywhere else.">
      <ResetPasswordForm token={token} invalid={invalid} />
    </AuthShell>
  );
}
