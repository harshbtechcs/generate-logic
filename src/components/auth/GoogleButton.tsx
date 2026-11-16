"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

/** "Continue with Google" — Google's own sign-in flow; we never see the user's Google password. */
export function GoogleButton({ next }: { next: string }) {
  const [loading, setLoading] = useState(false);
  const [logoMissing, setLogoMissing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setLogoMissing(true);
  }, []);

  async function onClick() {
    setLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
      errorCallbackURL: "/sign-in?error=google",
    });
    // On success the browser is already redirected to Google.
    if (error) setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="gl-btn flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-400/30 bg-white/[0.04] font-medium disabled:opacity-70"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      ) : !logoMissing ? (
        // Official Google "G" mark from /public/logos/google.svg (see Google's sign-in branding guidelines)
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={imgRef} src="/logos/google.svg" alt="" width={20} height={20} onError={() => setLogoMissing(true)} />
      ) : (
        <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-ink-900">
          G
        </span>
      )}
      Continue with Google
    </button>
  );
}
