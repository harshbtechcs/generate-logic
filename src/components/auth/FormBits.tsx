"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Field({ label, error, hint, id, type = "text", className, ...rest }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputId = id ?? rest.name;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && show ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-xl border bg-ink-900/70 px-4 text-[15px] text-text outline-none transition-colors placeholder:text-slate-500 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/25",
            error ? "border-red-400/70" : "border-slate-400/25",
            isPassword && "pr-12",
            className,
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-text"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-[13px] text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[13px] text-text-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="gl-btn flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-teal font-semibold text-ink-900 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        role={kind === "error" ? "alert" : "status"}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
          kind === "error" ? "border-red-400/40 bg-red-400/10 text-red-200" : "border-green-400/40 bg-green-400/10 text-green-200",
        )}
      >
        {kind === "error" ? (
          <AlertCircle size={18} className="mt-px shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 size={18} className="mt-px shrink-0" aria-hidden="true" />
        )}
        <div>{children}</div>
      </motion.div>
    </AnimatePresence>
  );
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-slate-500">
      <span className="h-px flex-1 bg-slate-400/20" />
      or
      <span className="h-px flex-1 bg-slate-400/20" />
    </div>
  );
}
