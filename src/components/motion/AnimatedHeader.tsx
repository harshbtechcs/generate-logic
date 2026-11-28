"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { THEMES, type ThemeName } from "@/lib/themes";
import { ICONS } from "./icons";
import { AwsArt, DockerArt, GitArt, KubernetesArt, LinuxArt, TerraformArt } from "@/components/home/showcase/art";

const ART = { docker: DockerArt, kubernetes: KubernetesArt, terraform: TerraformArt, aws: AwsArt, linux: LinuxArt, git: GitArt } as const;
export type ArtName = keyof typeof ART;

const SPOTS = [
  { x: "62%", y: "14%", s: 44, d: 0 },
  { x: "88%", y: "22%", s: 54, d: 0.5 },
  { x: "74%", y: "62%", s: 38, d: 1 },
  { x: "93%", y: "70%", s: 46, d: 1.5 },
  { x: "54%", y: "78%", s: 32, d: 2 },
];

/** Splits text into words, each word's letters rising out of a mask. */
export function LetterReveal({ text, delay = 0, className, onView = false }: { text: string; delay?: number; className?: string; onView?: boolean }) {
  const reduce = useReducedMotion();
  let n = 0;
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, wi) => (
        <span key={wi} aria-hidden="true" className="mr-[0.25em] inline-flex overflow-hidden pb-[0.08em] align-bottom">
          {word.split("").map((ch, ci) => {
            const i = n++;
            return (
              <motion.span
                key={ci}
                className="inline-block"
                initial={reduce ? false : { y: "110%", rotate: 8 }}
                {...(onView ? { whileInView: { y: "0%", rotate: 0 }, viewport: { once: true, amount: 0.8 } } : { animate: { y: "0%", rotate: 0 } })}
                transition={{ duration: 0.75, delay: delay + i * 0.028, ease: [0.22, 1, 0.36, 1] }}
              >
                {ch}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

type Props = {
  kicker: string;
  title: string;
  intro?: string;
  theme: ThemeName;
  word?: string;
  art?: ArtName;
  side?: ReactNode; // e.g. a logo badge when there is no illustration
  children?: ReactNode; // buttons under the intro
};

/** Full-width, colour-themed page header: giant background word, letter reveal, floating icons, parallax. */
export function AnimatedHeader({ kicker, title, intro, theme, word, art, side, children }: Props) {
  const t = THEMES[theme];
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const iconX = useTransform(sx, (v) => v * -30);
  const iconY = useTransform(sy, (v) => v * -22);
  const wordX = useTransform(sx, (v) => v * -20);
  const artX = useTransform(sx, (v) => v * 16);
  const artY = useTransform(sy, (v) => v * 12);
  const Art = art ? ART[art] : null;
  const big = (word ?? kicker.split(/[\s·/]+/).filter(Boolean).pop() ?? "").toUpperCase();

  return (
    <header
      ref={ref}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative isolate mb-12 overflow-hidden"
    >
      {/* themed background that melts into the page */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        style={{ background: `radial-gradient(90% 120% at 75% 0%, ${t.bg[1]} 0%, ${t.bg[0]} 55%, transparent 100%)` }}
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-[#060B19]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.1] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full blur-3xl"
          style={{ background: t.accent[1], opacity: 0.25 }}
          animate={{ x: [0, 80, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* giant word */}
      <motion.div aria-hidden="true" style={{ y: wordY, opacity: fade }} className="pointer-events-none absolute inset-x-0 top-[8%] -z-10 select-none">
        <motion.span style={{ x: wordX }} className="block">
          <motion.span
            initial={reduce ? false : { x: "12%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="block whitespace-nowrap pl-4 font-display text-[26vw] font-black leading-none tracking-tighter text-white/[0.07] md:text-[17vw]"
          >
            {big}
          </motion.span>
        </motion.span>
      </motion.div>

      {/* floating icons */}
      {!Art && !side && (
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden md:block" style={{ x: iconX, y: iconY }}>
          {SPOTS.map((p, i) => {
            const Icon = ICONS[t.icons[i % t.icons.length]!];
            return (
              <motion.span
                key={i}
                className="absolute"
                style={{ left: p.x, top: p.y }}
                initial={reduce ? false : { opacity: 0, scale: 0.3, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.35 + p.d * 0.15, type: "spring", stiffness: 140, damping: 14 }}
              >
                <motion.span
                  animate={reduce ? undefined : { y: [0, -14, 0], rotate: [0, 7, 0] }}
                  transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: p.d }}
                  className="flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 shadow-xl backdrop-blur-md"
                  style={{ width: p.s, height: p.s, color: t.accent[0] }}
                >
                  <Icon size={p.s * 0.5} />
                </motion.span>
              </motion.span>
            );
          })}
        </motion.div>
      )}

      <div className="mx-auto grid max-w-site items-center gap-8 px-5 pb-14 pt-16 sm:px-8 md:grid-cols-[1.3fr_1fr] md:pt-20">
        <div className="relative flex flex-col gap-4">
          <motion.span
            initial={reduce ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 font-mono text-[13px] tracking-[0.18em]"
            style={{ color: t.accent[0] }}
          >
            <motion.span
              className="inline-block h-px bg-current"
              initial={reduce ? false : { width: 0 }}
              animate={{ width: 36 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            {kicker}
          </motion.span>
          <h1 className="font-display text-[42px] font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-[60px] lg:text-[76px]">
            <LetterReveal text={title} delay={0.1} />
          </h1>
          {intro && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="max-w-[640px] text-lg leading-relaxed text-white/75"
            >
              {intro}
            </motion.p>
          )}
          {children && (
            <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }} className="mt-2 flex flex-wrap gap-3">
              {children}
            </motion.div>
          )}
        </div>

        {(Art || side) && (
          <motion.div className="relative mx-auto aspect-square w-full max-w-[260px] md:max-w-[340px]" style={{ x: artX, y: artY }}>
          <motion.div
            className="relative h-full w-full"
            initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: 14, x: 80 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, x: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
          >
            <div aria-hidden="true" className="absolute inset-[15%] -z-10 rounded-full blur-3xl" style={{ background: t.accent[1], opacity: 0.45 }} />
            <motion.div
              animate={reduce ? undefined : { y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-full w-full items-center justify-center drop-shadow-[0_30px_50px_rgba(0,0,0,0.45)]"
            >
              {Art ? <Art a={t.accent[0]} b={t.accent[1]} c={t.accent[2]} /> : side}
            </motion.div>
          </motion.div>
          </motion.div>
        )}
      </div>
    </header>
  );
}

/** Soft themed glow + drifting icons behind pages that have no big header (quiz, auth, dashboard…). */
export function ThemedBackdrop({ theme, icons = true }: { theme: ThemeName; icons?: boolean }) {
  const t = THEMES[theme];
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[720px] w-screen -translate-x-1/2 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ background: `radial-gradient(70% 80% at 70% 0%, ${t.bg[1]}88 0%, ${t.bg[0]}66 45%, transparent 100%)` }}
      />
      {icons &&
        !reduce &&
        SPOTS.slice(0, 4).map((p, i) => {
          const Icon = ICONS[t.icons[i % t.icons.length]!];
          return (
            <motion.span
              key={i}
              className="absolute hidden items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur md:flex"
              style={{ left: i % 2 ? "6%" : p.x, top: p.y, width: p.s, height: p.s, color: t.accent[0] }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 0.8, scale: 1, y: [0, -16, 0] }}
              transition={{ opacity: { delay: 0.3 + i * 0.15 }, scale: { delay: 0.3 + i * 0.15 }, y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" } }}
            >
              <Icon size={p.s * 0.48} />
            </motion.span>
          );
        })}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#060B19]" />
    </div>
  );
}
