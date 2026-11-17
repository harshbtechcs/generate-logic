"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Ban, Loader2, RotateCcw, ShieldCheck, Undo2 } from "lucide-react";
import { resetPlaylistProgress, setUserDisabled, undoLessonCompletion } from "@/app/actions/admin";
import { cn } from "@/lib/cn";

type Action = () => Promise<{ ok: true } | { ok: false; error: string }>;

/** Button that asks "Are you sure?" inline, runs a server action, then refreshes the page. */
function ConfirmButton({
  label,
  confirmLabel,
  icon: Icon,
  danger,
  small,
  action,
}: {
  label: string;
  confirmLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  danger?: boolean;
  small?: boolean;
  action: Action;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run() {
    setError(null);
    start(async () => {
      const res = await action();
      if (!res.ok) setError(res.error);
      setConfirming(false);
      router.refresh();
    });
  }

  const base = small ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  const tone = danger
    ? "border-red-400/50 text-red-200 hover:bg-red-400/10"
    : "border-slate-400/30 text-text hover:bg-white/[0.05]";

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {confirming ? (
        <>
          <button
            type="button"
            onClick={run}
            disabled={pending}
            className={cn("inline-flex items-center gap-1.5 rounded-lg font-semibold", base, danger ? "bg-red-500 text-white" : "bg-brand-teal text-ink-900")}
          >
            {pending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
          <button type="button" onClick={() => setConfirming(false)} disabled={pending} className={cn("rounded-lg border border-slate-400/30", base)}>
            Cancel
          </button>
        </>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className={cn("inline-flex items-center gap-1.5 rounded-lg border transition-colors", base, tone)}>
          <Icon size={small ? 13 : 16} aria-hidden="true" />
          {label}
        </button>
      )}
      {error && (
        <span role="alert" className="text-xs text-red-300">
          {error}
        </span>
      )}
    </span>
  );
}

export function RestrictButton({ userId, disabled }: { userId: string; disabled: boolean }) {
  return disabled ? (
    <ConfirmButton label="Restore access" confirmLabel="Yes, restore" icon={ShieldCheck} action={() => setUserDisabled(userId, false)} />
  ) : (
    <ConfirmButton
      label="Restrict account"
      confirmLabel="Yes, restrict and sign out"
      icon={Ban}
      danger
      action={() => setUserDisabled(userId, true)}
    />
  );
}

export function UndoLessonButton({ userId, lessonId }: { userId: string; lessonId: string }) {
  return <ConfirmButton small label="Undo" confirmLabel="Undo complete" icon={Undo2} action={() => undoLessonCompletion(userId, lessonId)} />;
}

export function ResetPlaylistButton({ userId, playlistId }: { userId: string; playlistId: string }) {
  return (
    <ConfirmButton
      small
      danger
      label="Reset playlist"
      confirmLabel="Reset all lessons"
      icon={RotateCcw}
      action={() => resetPlaylistProgress(userId, playlistId)}
    />
  );
}
