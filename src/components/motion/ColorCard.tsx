"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { THEMES, type IconName, type ThemeName } from "@/lib/themes";
import { ICONS } from "./icons";
import { cn } from "@/lib/cn";

type Props = {
  theme: ThemeName;
  href?: string;
  word?: string; // giant faded word in the corner
  icon?: IconName;
  index?: number; // for the staggered entrance
  className?: string;
  children: ReactNode;
};

/**
 * Bold colour block like the video's menu cards: full gradient, giant corner word,
 * floating icon, springy entrance and a 3D tilt that follows the mouse.
 */
export function ColorCard({ theme, href, word, icon, index = 0, className, children }: Props) {
  const t = THEMES[theme];
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-11, 11]), { stiffness: 200, damping: 18 });
  const glareX = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(py, [-0.5, 0.5], ["0%", "100%"]);
  const glare = useTransform([glareX, glareY], ([x, y]: string[]) => `radial-gradient(400px circle at ${x} ${y}, rgba(255,255,255,0.22), transparent 55%)`);
  const Icon = icon ? ICONS[icon] : null;

  const body = (
    <>
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />
      {word && (
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-4 -right-2 select-none font-display text-[96px] font-black leading-none tracking-tighter text-white/[0.13] transition-transform duration-500 group-hover:-translate-x-2 group-hover:-translate-y-1 sm:text-[112px]">
          {word}
        </span>
      )}
      {Icon && (
        <motion.span
          aria-hidden="true"
          className="absolute right-5 top-5 z-[2] flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-lg backdrop-blur"
          style={{ color: t.accent[0] }}
          animate={reduce ? undefined : { y: [0, -6, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 4 + (index % 3), repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={21} />
        </motion.span>
      )}
      <span className="relative z-[2] flex h-full flex-col">{children}</span>
    </>
  );

  const cls = cn(
    "group relative flex h-full overflow-hidden rounded-[24px] p-6 text-white shadow-[0_28px_60px_-28px_rgba(0,0,0,0.85)] ring-1 ring-white/10 [transform-style:preserve-3d]",
    className,
  );
  const bg = { background: `linear-gradient(155deg, ${t.bg[1]} 0%, ${t.bg[0]} 85%)` };

  return (
    <motion.div
      ref={ref}
      className="h-full [perspective:900px]"
      initial={reduce ? false : { opacity: 0, y: 50, rotate: index % 2 ? 3 : -3, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: "spring", stiffness: 90, damping: 15, delay: (index % 4) * 0.07 }}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      <motion.div className="h-full" style={reduce ? undefined : { rotateX: rx, rotateY: ry }} whileHover={reduce ? undefined : { y: -6 }}>
        {href ? (
          <Link href={href} className={cls} style={bg}>
            {body}
          </Link>
        ) : (
          <div className={cls} style={bg}>
            {body}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Big section title: kicker + giant letters revealed on scroll (video "THE MENU" style). */
export { LetterReveal } from "./AnimatedHeader";
