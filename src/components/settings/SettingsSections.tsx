"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, KeyRound, LogOut, Trash2, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Alert, Field, SubmitButton } from "@/components/auth/FormBits";

function Card({
  icon: Icon,
  title,
  description,
  danger,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-[20px] border p-6 sm:p-8 ${danger ? "border-red-400/30 bg-red-400/[0.04]" : "border-slate-400/15 bg-white/[0.03]"}`}
    >
      <div className="mb-6 flex items-start gap-3">
        <Icon size={22} className={danger ? "mt-0.5 text-red-300" : "mt-0.5 text-brand-teal"} />
        <div>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

type Msg = { kind: "error" | "success"; text: string } | null;

/* ───────────────────────── Profile ───────────────────────── */

export function ProfileSection({
  name,
  email,
  image,
  hasGoogle,
}: {
  name: string;
  email: string;
  image: string | null;
  hasGoogle: boolean;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(image);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newName = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    if (newName.length < 2 || newName.length > 80) {
      setMsg({ kind: "error", text: "Name must be 2–80 characters." });
      return;
    }
    setLoading(true);
    const { error } = await authClient.updateUser({ name: newName });
    setLoading(false);
    setMsg(error ? { kind: "error", text: error.message ?? "Could not save." } : { kind: "success", text: "Profile updated." });
    if (!error) router.refresh();
  }

  async function removePhoto() {
    const { error } = await authClient.updateUser({ image: null });
    if (error) setMsg({ kind: "error", text: error.message ?? "Could not remove photo." });
    else {
      setPhoto(null);
      setMsg({ kind: "success", text: "Photo removed." });
      router.refresh();
    }
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

  return (
    <Card icon={UserRound} title="Profile" description="Your name is shown on your dashboard.">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={64} height={64} referrerPolicy="no-referrer" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-green to-brand-blue font-display text-xl font-bold text-ink-900">
            {initials || "U"}
          </span>
        )}
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-text-muted">
            {photo ? (hasGoogle ? "Photo from your Google account." : "Profile photo.") : "Showing your initials."}
          </span>
          {photo && (
            <button type="button" onClick={removePhoto} className="self-start text-red-300 hover:underline">
              Remove photo
            </button>
          )}
          <span className="text-xs text-text-faint">Photo upload will be added together with notes storage.</span>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
        <Field label="Full name" name="name" defaultValue={name} autoComplete="name" required />
        <Field label="Email address" name="email" defaultValue={email} disabled hint="Your email can't be changed here." />
        <div className="sm:w-48">
          <SubmitButton loading={loading}>Save changes</SubmitButton>
        </div>
      </form>
    </Card>
  );
}

/* ───────────────────────── Password ───────────────────────── */

export function PasswordSection({ hasPassword }: { hasPassword: boolean }) {
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  if (!hasPassword) {
    return (
      <Card icon={KeyRound} title="Password">
        <p className="text-sm text-text-muted">
          You sign in with Google, so there is no password to manage here. Your Google account keeps your sign-in secure.
        </p>
      </Card>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const currentPassword = String(f.get("current") ?? "");
    const newPassword = String(f.get("new") ?? "");
    const confirm = String(f.get("confirm") ?? "");
    if (!currentPassword) return setMsg({ kind: "error", text: "Enter your current password." });
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return setMsg({ kind: "error", text: "New password: at least 8 characters, with a letter and a number." });
    }
    if (newPassword !== confirm) return setMsg({ kind: "error", text: "New passwords do not match." });
    if (newPassword === currentPassword) return setMsg({ kind: "error", text: "Choose a password different from the current one." });

    setLoading(true);
    const { error } = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
    setLoading(false);
    if (error) {
      setMsg({ kind: "error", text: error.status === 400 || error.status === 401 ? "Current password is incorrect." : error.message ?? "Could not change password." });
      return;
    }
    form.reset();
    setMsg({ kind: "success", text: "Password changed. Other devices have been signed out." });
  }

  return (
    <Card icon={KeyRound} title="Change password" description="Changing your password signs you out on all other devices.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
        <Field label="Current password" name="current" type="password" autoComplete="current-password" required />
        <Field label="New password" name="new" type="password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number." required />
        <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required />
        <div className="sm:w-56">
          <SubmitButton loading={loading}>Update password</SubmitButton>
        </div>
      </form>
    </Card>
  );
}

/* ───────────────────────── Sessions ───────────────────────── */

export function SessionsSection() {
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  async function signOutOthers() {
    setLoading(true);
    const { error } = await authClient.revokeOtherSessions();
    setLoading(false);
    setMsg(error ? { kind: "error", text: "Could not sign out other devices." } : { kind: "success", text: "Signed out of all other devices." });
  }

  return (
    <Card icon={LogOut} title="Devices" description="Signed in on a shared or lost device? Sign out everywhere except here.">
      {msg && (
        <div className="mb-4">
          <Alert kind={msg.kind}>{msg.text}</Alert>
        </div>
      )}
      <button
        type="button"
        onClick={signOutOthers}
        disabled={loading}
        className="gl-btn rounded-xl border border-slate-400/30 px-5 py-3 text-sm font-medium disabled:opacity-60"
      >
        {loading ? "Signing out…" : "Sign out of other devices"}
      </button>
    </Card>
  );
}

/* ───────────────────────── Delete account ───────────────────────── */

export function DeleteAccountSection({ hasPassword, email }: { hasPassword: boolean; email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);

  async function onDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (String(f.get("confirm") ?? "").trim() !== "DELETE") {
      setMsg({ kind: "error", text: 'Type DELETE in capital letters to confirm.' });
      return;
    }
    const password = String(f.get("password") ?? "");
    if (hasPassword && !password) {
      setMsg({ kind: "error", text: "Enter your password to confirm." });
      return;
    }
    setLoading(true);
    setMsg(null);
    const { error } = await authClient.deleteUser(hasPassword ? { password } : {});
    setLoading(false);
    if (error) {
      const text = (error.code ?? "").toUpperCase();
      if (text.includes("SESSION") || (error.status === 401 && !hasPassword)) {
        setNeedsReauth(true);
        setMsg({ kind: "error", text: "For your security, please sign in again, then delete your account." });
      } else if (hasPassword && (error.status === 400 || error.status === 401)) {
        setMsg({ kind: "error", text: "Password is incorrect." });
      } else {
        setMsg({ kind: "error", text: error.message ?? "Could not delete account." });
      }
      return;
    }
    router.push("/sign-in?notice=deleted");
    router.refresh();
  }

  async function reauth() {
    await authClient.signOut();
    router.push(`/sign-in?next=${encodeURIComponent("/dashboard/settings")}`);
  }

  return (
    <Card icon={Trash2} title="Delete account" danger description="Permanently delete your account and all your data. This cannot be undone.">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-red-400/50 px-5 py-3 text-sm font-medium text-red-200 transition-colors hover:bg-red-400/10"
        >
          Delete my account
        </button>
      ) : (
        <form onSubmit={onDelete} noValidate className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              This deletes <strong>{email}</strong> and everything linked to it: your progress, saved playlists, bookmarks,
              history and sessions. You can sign up again later, but your data cannot be restored.
            </div>
          </div>
          {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
          {needsReauth ? (
            <button type="button" onClick={reauth} className="gl-btn self-start rounded-xl bg-brand-teal px-5 py-3 text-sm font-semibold text-ink-900">
              Sign in again
            </button>
          ) : (
            <>
              {hasPassword && <Field label="Your password" name="password" type="password" autoComplete="current-password" required />}
              <Field label='Type "DELETE" to confirm' name="confirm" autoComplete="off" required />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                >
                  {loading ? "Deleting…" : "Permanently delete account"}
                </button>
                <button type="button" onClick={() => { setOpen(false); setMsg(null); }} className="rounded-xl border border-slate-400/30 px-5 py-3 text-sm">
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </Card>
  );
}
