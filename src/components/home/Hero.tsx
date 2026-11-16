"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
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

  return (
    <section id="top" className="relative overflow-x-clip">
      {/* ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-64 left-1/2 h-[700px] w-[1100px] -translate-x-[20%] bg-[radial-gradient(closest-side,rgba(34,211,238,0.14),rgba(59,79,216,0.08)_55%,transparent)]"
      />

      <div className="relative mx-auto flex max-w-site flex-wrap items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:pt-16">
        {/* ---- text ---- */}
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-7">
          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.05}
            className="inline-flex items-center gap-2.5 self-start rounded-full border border-brand-teal/30 bg-brand-teal/5 px-3.5 py-2 font-mono text-[13px] text-teal-200"
          >
            <span className="anim-pulse block h-2 w-2 rounded-full bg-brand-green" />
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
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="text-shine block" variants={line} initial="hidden" animate="show" custom={0.44}>
                Build the Future.
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
              className="gl-btn gl-glow inline-flex items-center gap-2.5 rounded-xl bg-brand-teal px-[26px] py-4 font-semibold text-ink-900"
            >
              Explore Learning Paths <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
            </Link>
            <a
              href={site.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="gl-btn inline-flex items-center gap-2.5 rounded-xl border border-slate-400/30 bg-white/[0.03] px-6 py-4 font-semibold"
            >
              <Youtube size={20} aria-hidden="true" /> Watch on YouTube
            </a>
          </motion.div>

          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.95}
            className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm text-text-faint"
          >
            {["Docker", "Kubernetes", "Terraform", "AWS", "CI/CD"].map((t, i, a) => (
              <span key={t} className="flex gap-5">
                {t}
                {i < a.length - 1 && <span aria-hidden="true">·</span>}
              </span>
            ))}
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

          <TypingChip cmd="docker compose up -d" delay={1.4} className="left-0 top-14 anim-bob-slow" />
          <TypingChip cmd="kubectl get pods" delay={2.4} className="right-0 top-[150px] anim-bob" />
          <TypingChip cmd="terraform apply" delay={3.3} className="bottom-12 left-7 anim-bob-slow" caret />
        </motion.div>
      </div>
    </section>
  );
}
