import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Current session (or null). Cached so several calls in one request hit the DB once. */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** For protected pages: returns the signed-in user or sends them to sign-in. */
export async function requireUser(next = "/dashboard") {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return session.user;
}

export function isAdmin(user: { role?: string | null }) {
  return user.role === "ADMIN";
}

/** For admin pages: non-admins get sent to their own dashboard. */
export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (!isAdmin(user)) redirect("/dashboard");
  return user;
}
