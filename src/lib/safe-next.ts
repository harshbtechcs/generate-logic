/** Only allow redirects back into this site (prevents open-redirect attacks). */
export function safeNext(next: string | string[] | undefined | null, fallback = "/dashboard") {
  const v = Array.isArray(next) ? next[0] : next;
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return fallback;
  return v;
}
