"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "framer-motion";
import { THEMES, type ThemeName } from "@/lib/themes";
import { ArrowRight, Youtube } from "lucide-react";
import { site } from "@/lib/site";
import { techBySlug } from "@/lib/data";
import { TechBadge } from "@/components/ui/TechBadge";

// Three.js only runs in the browser and is heavy, so load it after the page.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <SceneFallback />,
});

function SceneFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-40 w-40 animate-pulse rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.25),transparent)]" />
    </div>
  );
}

const ease = [0.2, 0.7, 0.2, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: (d: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, delay: d, ease } }),
};

const line: Variants = {
  hidden: { y: "105%", rotate: 2, opacity: 0 },
  show: (d: number) => ({ y: 0, rotate: 0, opacity: 1, transition: { duration: 1, delay: d, ease: [0.2, 0.8, 0.2, 1] } }),
};

const ORBIT = ["docker", "terraform", "aws", "jenkins", "git", "ansible"] as const;

/**
 * The hero cycles through these looks. `hue` turns the green/cyan 3D model
 * into the tool's colour (degrees of CSS hue-rotate from the original cyan).
 */
const LOOKS: { theme: ThemeName; word: string; line: string; tool: string | null; hue: number }[] = [
  { theme: "teal", word: "DEVOPS", line: "Build the Future.", tool: null, hue: 0 },
  { theme: "docker", word: "DOCKER", line: "Ship with Docker.", tool: "Docker", hue: 22 },
  { theme: "kubernetes", word: "K8S", line: "Scale with Kubernetes.", tool: "Kubernetes", hue: 50 },
  { theme: "terraform", word: "IAC", line: "Automate with Terraform.", tool: "Terraform", hue: 70 },
  { theme: "aws", word: "CLOUD", line: "Deploy on AWS.", tool: "AWS", hue: -151 },
  { theme: "linux", word: "LINUX", line: "Own the Linux shell.", tool: "Linux", hue: -47 },
  { theme: "git", word: "GIT", line: "Branch with Git.", tool: "Git", hue: -164 },
];
const LOOK_MS = 3800;

function TypingChip({ cmd, delay, className, caret }: { cmd: string; delay: number; className: string; caret?: boolean }) {
  return (
    <div className={`absolute z-10 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay - 0.3, duration: 0.5 }}
        className="rounded-[10px] border border-slate-400/25 bg-slate-900/80 px-3.5 py-2.5 font-mono text-[13px] text-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur"
      >
        <span className="text-brand-green">$</span>{" "}
        <motion.span
          className="inline-block overflow-hidden whitespace-nowrap align-bottom"
          initial={{ width: 0 }}
          animate={{ width: `${cmd.length}ch` }}
          transition={{ delay, duration: cmd.length * 0.07, ease: "linear" }}
        >
          {cmd}
        </motion.span>
        {caret && <span className="anim-blink text-brand-teal">▍</span>}
      </motion.div>
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion() ?? false;
  const sceneRef = useRef<HTMLDivElement>(null);
  const sceneVisible = useInView(sceneRef, { margin: "100px" });
  const [look, setLook] = useState(0);
  const [hold, setHold] = useState(false);
  const L = LOOKS[look]!;
  const t = THEMES[L.theme];

  // Cycle the colours while the hero is on screen.
  useEffect(() => {
    if (reduce || hold || !sceneVisible) return;
    const id = setTimeout(() => setLook((i) => (i + 1) % LOOKS.length), look === 0 ? 2600 : LOOK_MS);
    return () => clearTimeout(id);
  }, [look, reduce, hold, sceneVisible]);

  // Mouse parallax for the giant background word.
  const mx = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const wordX = useTransform(sx, (v) => v * -40);

  return (
    <section
      id="top"
      className="relative isolate overflow-x-clip"
      onMouseMove={(e) => mx.set(e.clientX / window.innerWidth - 0.5)}
      onMouseLeave={() => mx.set(0)}
    >
      {/* colour that follows the current tool */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20"
        animate={{ background: `radial-gradient(85% 95% at 72% 38%, ${t.bg[1]}cc 0%, ${t.bg[0]}aa 50%, #060B19 100%)` }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-[#060B19]" />

      {/* giant background word */}
      <motion.div aria-hidden="true" style={{ x: wordX }} className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={L.word}
            initial={{ y: "35%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-35%", opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="block whitespace-nowrap text-center font-display text-[28vw] font-black leading-none tracking-tighter text-white/[0.06] md:text-[20vw]"
          >
            {L.word}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      <div className="relative mx-auto flex max-w-site flex-wrap items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:pt-16">
        {/* ---- text ---- */}
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-7">
          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.05}
            className="inline-flex items-center gap-2.5 self-start rounded-full border bg-white/5 px-3.5 py-2 font-mono text-[13px] backdrop-blur transition-colors duration-700"
            style={{ borderColor: `${t.accent[1]}66`, color: t.accent[0] }}
          >
            <span className="anim-pulse block h-2 w-2 rounded-full transition-colors duration-700" style={{ background: t.accent[1] }} />
            {site.tagline}
          </motion.div>

          <h1 className="font-display text-[44px] font-bold leading-[1.04] tracking-tight sm:text-[56px] lg:text-[64px]">
            {[
              { text: "Learn Cloud.", d: 0.2 },
              { text: "Master DevOps.", d: 0.32 },
            ].map((l) => (
              <span key={l.text} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" variants={line} initial="hidden" animate="show" custom={l.d}>
                  {l.text}
                </motion.span>
              </span>
            ))}
            <span className="relative block overflow-hidden pb-[0.08em]">
              <motion.span className="block" variants={line} initial="hidden" animate="show" custom={0.44}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={L.line}
                    className="block bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(90deg, ${t.accent[0]}, ${t.accent[1]})` }}
                    initial={{ y: "100%", rotateX: -60, opacity: 0 }}
                    animate={{ y: "0%", rotateX: 0, opacity: 1 }}
                    exit={{ y: "-100%", rotateX: 60, opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {L.line}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.65}
            className="max-w-[540px] text-[17px] leading-relaxed text-text-muted sm:text-[19px]"
          >
            {site.description}
          </motion.p>

          <motion.div variants={rise} initial="hidden" animate="show" custom={0.8} className="flex flex-wrap gap-3.5">
            <Link
              href="/#paths"
              className="gl-btn inline-flex items-center gap-2.5 rounded-xl px-[26px] py-4 font-semibold text-ink-900 shadow-[0_12px_40px_-10px_var(--hero-glow)] transition-colors duration-700"
              style={{ background: t.accent[0], "--hero-glow": t.accent[1] } as React.CSSProperties}
            >
              Explore Learning Paths <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <a
              href={site.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="gl-btn inline-flex items-center gap-2.5 rounded-xl border border-white/25 bg-white/[0.06] px-6 py-4 font-semibold backdrop-blur"
            >
              <Youtube size={20} aria-hidden="true" /> Watch on YouTube
            </a>
          </motion.div>

          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.95}
            className="flex flex-wrap gap-2"
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
          >
            {LOOKS.filter((l) => l.tool).map((l) => {
              const i = LOOKS.indexOf(l);
              const on = i === look;
              const lt = THEMES[l.theme];
              return (
                <button
                  key={l.word}
                  type="button"
                  onClick={() => setLook(i)}
                  aria-pressed={on}
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[13px] transition-all duration-500"
                  style={on ? { borderColor: lt.accent[1], background: `${lt.accent[1]}26`, color: lt.accent[0] } : { borderColor: "rgba(148,163,184,0.2)", color: "rgba(148,163,184,0.8)" }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: lt.accent[1] }} />
                  {l.tool}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* ---- 3D scene ---- */}
        <motion.div
          ref={sceneRef}
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.82, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease }}
          className="relative h-[420px] min-w-0 flex-[1_1_480px] sm:h-[560px]"
        >
          <div className="absolute inset-0 transition-[filter] duration-1000 ease-in-out" style={{ filter: `hue-rotate(${L.hue}deg) saturate(${L.hue ? 1.25 : 1})` }}>
          {/* data flowing toward the model */}
          <svg viewBox="0 0 560 560" preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute inset-0 h-full w-full" fill="none" strokeLinecap="round">
            <path className="anim-flow" d="M20 120 C140 120 160 260 280 280" stroke="rgba(74,222,128,0.55)" strokeWidth="1.5" strokeDasharray="6 14" />
            <path className="anim-flow" d="M540 200 C430 200 400 300 280 280" stroke="rgba(34,211,238,0.55)" strokeWidth="1.5" strokeDasharray="6 14" />
            <path className="anim-flow" d="M60 500 C160 470 200 360 280 280" stroke="rgba(96,165,250,0.55)" strokeWidth="1.5" strokeDasharray="6 14" />
            <path className="anim-flow" d="M520 480 C430 440 380 360 280 280" stroke="rgba(74,222,128,0.4)" strokeWidth="1.5" strokeDasharray="4 16" />
            <circle cx="20" cy="120" r="4" fill="#4ADE80" />
            <circle cx="540" cy="200" r="4" fill="#22D3EE" />
            <circle cx="60" cy="500" r="4" fill="#60A5FA" />
            <circle cx="520" cy="480" r="4" fill="#4ADE80" />
          </svg>

          {/* orbiting technology badges */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 sm:h-[470px] sm:w-[470px]">
            <div className="anim-orbit absolute inset-0 rounded-full border border-dashed border-slate-400/20">
              {ORBIT.map((slug, i) => {
                const a = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
                return (
                  <div
                    key={slug}
                    className="absolute -ml-[23px] -mt-[23px]"
                    style={{ left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%` }}
                  >
                    <div className="anim-counter rounded-xl bg-ink-900/90">
                      <TechBadge tech={techBySlug[slug]} size={46} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute inset-0">
            <HeroScene animate={!reduce} visible={sceneVisible} />
          </div>
          </div>

          <TypingChip cmd="docker compose up -d" delay={1.4} className="left-0 top-14 anim-bob-slow" />
          <TypingChip cmd="kubectl get pods" delay={2.4} className="right-0 top-[150px] anim-bob" />
          <TypingChip cmd="terraform apply" delay={3.3} className="bottom-12 left-7 anim-bob-slow" caret />
        </motion.div>
      </div>
    </section>
  );
}
