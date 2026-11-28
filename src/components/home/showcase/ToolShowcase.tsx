"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Box, Brain, Cloud, Cpu, GitBranch, GitMerge, Hexagon, Layers, Play, Server, Terminal, Workflow, type LucideIcon } from "lucide-react";
import { AwsArt, DockerArt, GitArt, KubernetesArt, LinuxArt, TerraformArt } from "./art";
import { cn } from "@/lib/cn";

export type ShowcaseCounts = Record<string, { questions: number }>;

type Slide = {
  slug: string;
  name: string;
  word: string; // giant background word
  tagline: string;
  blurb: string;
  bg: [string, string]; // gradient
  accent: [string, string, string];
  Art: ComponentType<{ a: string; b: string; c: string }>;
  floaters: LucideIcon[];
  commands: string[];
};

const SLIDES: Slide[] = [
  {
    slug: "docker",
    name: "Docker",
    word: "DOCKER",
    tagline: "Ship it anywhere.",
    blurb: "Package your app once and run it the same way on every laptop, server and cloud.",
    bg: ["#06244a", "#1662c4"],
    accent: ["#7cc4ff", "#2f86e6", "#174f9c"],
    Art: DockerArt,
    floaters: [Box, Box, Layers, Server],
    commands: ["docker build -t app .", "docker run -p 80:80 app"],
  },
  {
    slug: "kubernetes",
    name: "Kubernetes",
    word: "K8S",
    tagline: "Scale without sweat.",
    blurb: "Run containers at scale with self-healing pods, rolling updates and auto-scaling.",
    bg: ["#12175a", "#3c4ee0"],
    accent: ["#a5b4fc", "#6366f1", "#2a33a8"],
    Art: KubernetesArt,
    floaters: [Hexagon, Hexagon, Cpu, Workflow],
    commands: ["kubectl apply -f app.yaml", "kubectl scale deploy web --replicas=5"],
  },
  {
    slug: "terraform",
    name: "Terraform",
    word: "IAC",
    tagline: "Infra as code.",
    blurb: "Write your cloud as code, review the plan, and apply it the same way every time.",
    bg: ["#2a0f57", "#7a3fe0"],
    accent: ["#c4b5fd", "#8b5cf6", "#5b21b6"],
    Art: TerraformArt,
    floaters: [Layers, Box, Cloud, Layers],
    commands: ["terraform plan", "terraform apply"],
  },
  {
    slug: "aws",
    name: "AWS",
    word: "CLOUD",
    tagline: "The cloud, demystified.",
    blurb: "EC2, S3, IAM, VPC and more — the most popular cloud, explained step by step.",
    bg: ["#5a2104", "#ea7a12"],
    accent: ["#ffd29a", "#f59e0b", "#b45309"],
    Art: AwsArt,
    floaters: [Cloud, Server, Cloud, Cpu],
    commands: ["aws s3 ls", "aws ec2 describe-instances"],
  },
  {
    slug: "linux",
    name: "Linux",
    word: "LINUX",
    tagline: "Own the terminal.",
    blurb: "Every server, container and pipeline runs on Linux. Get fast and fearless in the shell.",
    bg: ["#0b3b2a", "#16a36b"],
    accent: ["#86efac", "#22c55e", "#15803d"],
    Art: LinuxArt,
    floaters: [Terminal, Terminal, Cpu, Server],
    commands: ["grep -i error app.log", "chmod +x deploy.sh"],
  },
  {
    slug: "git",
    name: "Git & GitHub",
    word: "GIT",
    tagline: "Branch. Merge. Repeat.",
    blurb: "Track every change, work in branches and ship with pull requests like a real team.",
    bg: ["#5e140c", "#e2492d"],
    accent: ["#ffb4a3", "#f97316", "#b91c1c"],
    Art: GitArt,
    floaters: [GitBranch, GitMerge, GitBranch, Terminal],
    commands: ["git checkout -b feature", "git push origin feature"],
  },
];

const FLOAT_SPOTS = [
  { x: "8%", y: "18%", s: 46, d: 0 },
  { x: "86%", y: "14%", s: 38, d: 0.6 },
  { x: "82%", y: "74%", s: 52, d: 1.1 },
  { x: "14%", y: "78%", s: 34, d: 1.7 },
];

const AUTOPLAY_MS = 6500;

export function ToolShowcase({ counts }: { counts: ShowcaseCounts }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const slide = SLIDES[index]!;

  // Mouse parallax for the art and floaters.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const artX = useTransform(sx, (v) => v * 18);
  const artY = useTransform(sy, (v) => v * 14);
  const floatX = useTransform(sx, (v) => v * -36);
  const floatY = useTransform(sy, (v) => v * -28);
  const wordX = useTransform(sx, (v) => v * -24);

  const go = useCallback((next: number, d?: number) => {
    setDir(d ?? 1);
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  // Autoplay while visible and not hovered.
  useEffect(() => {
    if (paused || !inView || reduce) return;
    const t = setTimeout(() => go(index + 1, 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, inView, reduce, go]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") go(index + 1, 1);
    if (e.key === "ArrowLeft") go(index - 1, -1);
  }

  const q = counts[slide.slug]?.questions ?? 0;

  return (
    <motion.section
      ref={ref}
      aria-roledescription="carousel"
      aria-label="DevOps tools"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        mx.set(0);
        my.set(0);
      }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      animate={{ background: `radial-gradient(120% 90% at 65% 40%, ${slide.bg[1]} 0%, ${slide.bg[0]} 62%, #05070d 100%)` }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      className="relative isolate mb-[72px] min-h-[100svh] overflow-hidden outline-none md:min-h-[760px]"
    >
      {/* grain + vignette */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_50%,transparent,rgba(0,0,0,0.55))]" />

      {/* giant background word */}
      <AnimatePresence mode="popLayout" custom={dir}>
        <motion.div
          key={slide.word}
          custom={dir}
          initial={{ x: `${dir * 30}%`, opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          exit={{ x: `${dir * -30}%`, opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none text-center"
          aria-hidden="true"
        >
          <motion.span style={{ x: wordX }} className="block whitespace-nowrap font-display text-[30vw] font-black leading-none tracking-tighter text-white/[0.09] md:text-[22vw]">
            {slide.word}
          </motion.span>
        </motion.div>
      </AnimatePresence>

      <div className="mx-auto grid min-h-[inherit] max-w-site grid-rows-[auto_1fr_auto] px-5 pb-8 pt-10 sm:px-8 md:pt-14">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span className="font-mono tracking-[0.18em]">LEARN THE STACK</span>
          <span className="font-mono">
            {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        <div className="grid items-center gap-6 py-6 md:grid-cols-[1fr_1.15fr] md:gap-10">
          {/* text */}
          <div className="relative z-10 order-2 md:order-1">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-display text-[44px] font-semibold italic leading-[0.95] text-white sm:text-[64px] lg:text-[80px]">{slide.name}</h2>
                <p className="mt-3 font-mono text-sm uppercase tracking-[0.2em]" style={{ color: slide.accent[0] }}>
                  {slide.tagline}
                </p>
                <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/80">{slide.blurb}</p>
                <div className="mt-5 flex flex-col gap-1.5 font-mono text-[13px]">
                  {slide.commands.map((c, i) => (
                    <motion.span
                      key={c}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.12 }}
                      className="w-fit rounded-md bg-black/30 px-3 py-1.5 text-white/90 backdrop-blur"
                    >
                      <span style={{ color: slide.accent[0] }}>$</span> {c}
                    </motion.span>
                  ))}
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href={`/learn/${slide.slug}`} className="gl-btn inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-ink-900">
                    <Play size={17} aria-hidden="true" /> Start learning
                  </Link>
                  {q > 0 && (
                    <Link href={`/quiz/${slide.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur hover:bg-white/20">
                      <Brain size={17} aria-hidden="true" /> {q} quiz questions
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* art */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(index + 1, 1);
              else if (info.offset.x > 60) go(index - 1, -1);
            }}
            className="relative order-1 mx-auto aspect-square w-full max-w-[300px] cursor-grab touch-pan-y active:cursor-grabbing sm:max-w-[420px] md:order-2 md:max-w-[560px]"
          >
            <motion.div className="absolute inset-0" style={{ x: floatX, y: floatY }} aria-hidden="true">
              <AnimatePresence>
                {FLOAT_SPOTS.map((p, i) => {
                  const Icon = slide.floaters[i % slide.floaters.length]!;
                  return (
                    <motion.span
                      key={`${slide.slug}-${i}`}
                      initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.3 }}
                      transition={{ delay: 0.2 + p.d * 0.15, type: "spring", stiffness: 160, damping: 14 }}
                      className="absolute"
                      style={{ left: p.x, top: p.y }}
                    >
                      <motion.span
                        animate={reduce ? undefined : { y: [0, -14, 0], rotate: [0, 8, 0] }}
                        transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: p.d }}
                        className="flex items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-xl backdrop-blur-md"
                        style={{ width: p.s, height: p.s, color: slide.accent[0] }}
                      >
                        <Icon size={p.s * 0.5} />
                      </motion.span>
                    </motion.span>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            <motion.div className="absolute inset-[8%]" style={{ x: artX, y: artY }}>
              <div className="absolute inset-[12%] -z-10 rounded-full blur-3xl" style={{ background: slide.accent[1], opacity: 0.45 }} />
              <AnimatePresence mode="popLayout" custom={dir}>
                <motion.div
                  key={slide.slug}
                  custom={dir}
                  initial={{ opacity: 0, scale: 0.6, x: dir * 160, rotate: dir * 18 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, x: dir * -160, rotate: dir * -14 }}
                  transition={{ type: "spring", stiffness: 90, damping: 16 }}
                  className="h-full w-full"
                >
                  <motion.div
                    animate={reduce ? undefined : { y: [0, -16, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.45)]"
                  >
                    <slide.Art a={slide.accent[0]} b={slide.accent[1]} c={slide.accent[2]} />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        {/* selector */}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => go(index - 1, -1)} aria-label="Previous tool" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/15">
            <ArrowLeft size={18} />
          </button>
          <div role="tablist" aria-label="Choose a tool" className="flex flex-1 flex-wrap gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => go(i, i > index ? 1 : -1)}
                className={cn(
                  "relative overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  i === index ? "border-white bg-white text-ink-900" : "border-white/25 bg-black/20 text-white/80 hover:bg-white/10",
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.accent[1] }} />
                  {s.name}
                </span>
                {i === index && !paused && inView && !reduce && (
                  <motion.span
                    key={`bar-${index}`}
                    className="absolute bottom-0 left-0 h-[3px]"
                    style={{ background: s.accent[1] }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => go(index + 1, 1)} aria-label="Next tool" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/15">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

    </motion.section>
  );
}
