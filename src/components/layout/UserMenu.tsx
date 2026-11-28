"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Crown, LayoutDashboard, LogOut, Settings, Shield } from "lucide-react";
import { signOut } from "@/lib/auth-client";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function UserMenu({
  name,
  email,
  image,
  isAdmin,
}: {
  name: string;
  email: string;
  image?: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onSignOut() {
    await signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex h-12 items-center gap-2.5 rounded-full border pl-1 pr-3 transition-colors ${
          isAdmin ? "border-amber-300/40 bg-gradient-to-r from-amber-300/10 to-transparent hover:border-amber-300/70" : "border-slate-400/25 bg-white/[0.03] hover:border-brand-teal/50"
        }`}
      >
        <span className="relative flex h-10 w-10 items-center justify-center">
          {isAdmin && (
            // spinning gold ring around the super admin's avatar
            <span aria-hidden="true" className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#fde68a,#f59e0b,#fb7185,#a78bfa,#22d3ee,#fde68a)]" />
          )}
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" width={36} height={36} referrerPolicy="no-referrer" className="relative h-9 w-9 rounded-full border-2 border-ink-900 object-cover" />
          ) : (
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink-900 bg-gradient-to-br from-brand-green to-brand-blue font-display text-sm font-bold text-ink-900">
              {initials(name) || "U"}
            </span>
          )}
          {isAdmin && (
            <span aria-hidden="true" className="absolute -right-1 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-300 text-ink-900 shadow-[0_0_10px_rgba(252,211,77,0.8)]">
              <Crown size={11} strokeWidth={2.6} />
            </span>
          )}
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="max-w-[120px] truncate text-sm font-semibold">{name.split(" ")[0]}</span>
          {isAdmin && (
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-rose-300 bg-clip-text text-[10px] font-bold uppercase tracking-[0.18em] text-transparent">
              Super Admin
            </span>
          )}
        </span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-slate-400/20 bg-ink-800/95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="border-b border-slate-400/15 px-4 py-3">
              <p className="truncate font-medium">{name}</p>
              <p className="truncate text-sm text-text-faint">{email}</p>
              {isAdmin && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-xs text-amber-200">
                  <Crown size={12} aria-hidden="true" /> Super Admin
                </span>
              )}
            </div>
            <div className="p-1.5">
              <Link role="menuitem" href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/[0.05]">
                <LayoutDashboard size={17} aria-hidden="true" /> My dashboard
              </Link>
              <Link role="menuitem" href="/dashboard/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/[0.05]">
                <Settings size={17} aria-hidden="true" /> Account settings
              </Link>
              {isAdmin && (
                <Link role="menuitem" href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/[0.05]">
                  <Shield size={17} aria-hidden="true" /> Admin dashboard
                </Link>
              )}
              <button role="menuitem" type="button" onClick={onSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-200 hover:bg-red-400/10">
                <LogOut size={17} aria-hidden="true" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
