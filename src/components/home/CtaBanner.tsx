"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Brain, CalendarCheck, Flame, Map, SquareTerminal, Trophy } from "lucide-react";
import { LetterReveal } from "@/components/motion/AnimatedHeader";

const floaters = [
  { Icon: Flame, x: "8%", y: "18%", d: 0 },
  { Icon: Trophy, x: "86%", y: "14%", d: 0.6 },
  { Icon: SquareTerminal, x: "78%", y: "70%", d: 1.2 },
  { Icon: Brain, x: "14%", y: "72%", d: 1.8 },
  { Icon: Map, x: "48%", y: "8%", d: 2.4 },
  { Icon: CalendarCheck, x: "60%", y: "82%", d: 3 },
];

/** Final call to action: a full colour block with a giant word and floating icons. */
export function CtaBanner() {
  const reduce = useReducedMotion();
  return (
    <section className="relative mx-auto max-w-site px-5 pb-[104px] sm:px-8">
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.94, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: "spring", stiffness: 70, damping: 16 }}
        className="relative isolate overflow-hidden rounded-[32px] px-8 py-20 text-center ring-1 ring-white/15 sm:px-12"
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 -z-20"
          animate={reduce ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          style={{ backgroundImage: "linear-gradient(120deg, #0e7c86, #1662c4, #7a3fe0, #e2492d, #ea7a12, #16a36b, #0e7c86)", backgroundSize: "300% 300%" }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/25" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none font-display text-[26vw] font-black leading-none tracking-tighter text-white/[0.08] lg:text-[16rem]">
          FREE
        </span>
        {floaters.map(({ Icon, x, y, d }, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-white shadow-xl backdrop-blur sm:flex"
            style={{ left: x, top: y }}
            animate={reduce ? undefined : { y: [0, -14, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: d }}
          >
            <Icon size={22} />
          </motion.span>
        ))}
        <h2 className="mx-auto max-w-3xl font-display text-[40px] font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-[64px]">
          <LetterReveal text="Your dashboard. Free." onView />
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-white/85">
          Track lesson progress, keep a daily streak, earn XP and badges, and climb the leaderboard — all free.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/sign-up" className="gl-btn rounded-xl bg-white px-7 py-4 font-semibold text-ink-900 shadow-2xl">
            Create free account
          </Link>
          <Link href="/sign-in" className="gl-btn rounded-xl border border-white/40 bg-white/10 px-6 py-[15px] font-semibold text-white backdrop-blur">
            Sign in
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
