"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { UserMenu } from "./UserMenu";
import { navAlso, navLinks } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const user = session?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "border-slate-400/15 bg-ink-900/80 backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
    >
      <nav aria-label="Main" className="mx-auto flex max-w-site items-center gap-8 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Generate Logic home">
          <Image
            src="/logo-mark.png"
            alt=""
            width={44}
            height={44}
            priority
            className="rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_24px_rgba(34,211,238,0.35)]"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-bold tracking-[0.08em]">GENERATE</span>
            <span className="mt-1 font-display text-[11px] font-medium tracking-[0.42em] text-brand-teal">
              LOGIC
            </span>
          </span>
        </Link>

        <ul className="hidden flex-1 items-center gap-6 lg:flex">
          {navLinks.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : [l.href, ...(navAlso[l.href] ?? [])].some((h) => pathname.startsWith(h));
            return (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className={cn(
                    "group relative py-2 text-[15px] transition-colors hover:text-brand-teal",
                    active ? "text-text" : "text-text-muted",
                  )}
                >
                  {l.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-brand-teal transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto hidden items-center gap-3 sm:flex lg:ml-0">
          {isPending ? (
            <span className="h-11 w-40 animate-pulse rounded-[10px] bg-white/[0.05]" aria-hidden="true" />
          ) : user ? (
            <UserMenu name={user.name} email={user.email} image={user.image} isAdmin={user.role === "ADMIN"} />
          ) : (
          <>
          <Link
            href="/sign-in"
            className="gl-btn rounded-[10px] border border-slate-400/30 px-[18px] py-[11px] text-[15px] font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="gl-btn rounded-[10px] bg-brand-teal px-5 py-3 text-[15px] font-semibold text-ink-900"
          >
            Sign Up
          </Link>
          </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg border border-slate-400/25 sm:ml-0 lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-slate-400/15 bg-ink-900/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col px-5 py-3">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link href={l.href} className="block py-3 text-base text-text-muted hover:text-brand-teal">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
              <li className="mt-2 flex gap-3 pb-2 sm:hidden">
                {user ? (
                  <>
                    <Link href="/dashboard" className="flex-1 rounded-lg bg-brand-teal py-3 text-center font-semibold text-ink-900">
                      Dashboard
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link href="/admin" className="flex-1 rounded-lg border border-slate-400/30 py-3 text-center">
                        Admin
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/sign-in" className="flex-1 rounded-lg border border-slate-400/30 py-3 text-center">
                      Sign In
                    </Link>
                    <Link href="/sign-up" className="flex-1 rounded-lg bg-brand-teal py-3 text-center font-semibold text-ink-900">
                      Sign Up
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
