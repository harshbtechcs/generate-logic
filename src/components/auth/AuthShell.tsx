"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemedBackdrop } from "@/components/motion/AnimatedHeader";

/** Centered glass card used by every sign-in / sign-up / password page. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-5 py-16">
      <ThemedBackdrop theme="teal" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.14),rgba(74,222,128,0.06)_55%,transparent)]"
      />
      <div aria-hidden="true" className="grid-bg pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(closest-side,#000,transparent)]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative w-full max-w-[440px] rounded-[24px] border border-slate-400/15 bg-ink-800/70 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-10"
      >
        <Link href="/" className="mx-auto mb-6 flex w-fit" aria-label="Generate Logic home">
          <Image
            src="/logo-mark.png"
            alt=""
            width={56}
            height={56}
            className="rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_30px_rgba(34,211,238,0.35)]"
          />
        </Link>
        <h1 className="text-center font-display text-[28px] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-[15px] text-text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-7 text-center text-sm text-text-muted">{footer}</div>}
      </motion.div>
    </div>
  );
}
