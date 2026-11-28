"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

const STAGES = [
  { n: "01", name: "Foundations", tools: ["Linux", "Git", "Networking"], from: "#14532d", to: "#22c55e", ink: "#dcfce7" },
  { n: "02", name: "Containers", tools: ["Docker", "Kubernetes"], from: "#0c2d63", to: "#2f86e6", ink: "#dbeafe" },
  { n: "03", name: "Automation", tools: ["CI/CD", "Jenkins", "Ansible"], from: "#7c2d12", to: "#f97316", ink: "#ffedd5" },
  { n: "04", name: "Infra as Code", tools: ["Terraform"], from: "#3b0764", to: "#8b5cf6", ink: "#ede9fe" },
  { n: "05", name: "Cloud", tools: ["AWS", "Azure", "GCP"], from: "#713f12", to: "#eab308", ink: "#fef9c3" },
];

const QUOTE = "A command is more than syntax. It's how great teams ship.";

function BigWord({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  return (
    <span ref={ref} className="flex overflow-hidden" aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ y: "110%" }}
          animate={inView ? { y: "0%" } : undefined}
          transition={{ duration: 0.7, delay: delay + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

/** "THE ROADMAP" — big type, colourful stage cards, and a quote revealed word by word. */
export function TheRoadmap() {
  const reduce = useReducedMotion();
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: quoteRef, offset: ["start 85%", "end 45%"] });
  const words = QUOTE.split(" ");

  return (
    <section className="relative mx-auto mb-24 max-w-site px-5 sm:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display font-black uppercase leading-[0.85] tracking-tighter">
          <span className="block text-[32px] text-brand-teal sm:text-[44px]">
            <BigWord text="The" />
          </span>
          <span className="block text-[64px] sm:text-[120px] lg:text-[150px]">
            <BigWord text="Roadmap" delay={0.15} />
          </span>
        </h2>
        <p className="max-w-sm text-text-muted">Five stages from your first terminal command to running real infrastructure in the cloud. Follow them in order.</p>
      </div>

      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {STAGES.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 60, rotate: reduce ? 0 : i % 2 ? 3 : -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: i * 0.08 }}
            whileHover={reduce ? undefined : { y: -10, rotate: i % 2 ? 1.5 : -1.5 }}
            className="w-[78%] shrink-0 snap-start sm:w-auto"
          >
            <Link
              href="/roadmap"
              className="group relative flex h-[340px] flex-col overflow-hidden rounded-[26px] p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
              style={{ background: `linear-gradient(160deg, ${s.to} 0%, ${s.from} 100%)`, color: s.ink }}
            >
              <span className="pointer-events-none absolute -right-4 -top-6 font-display text-[140px] font-black leading-none opacity-20">{s.n}</span>
              <span className="font-mono text-xs tracking-[0.2em] opacity-80">STAGE {s.n}</span>
              <span className="mt-2 font-display text-[28px] font-bold leading-tight text-white">{s.name}</span>
              <span className="mt-auto flex flex-wrap gap-2">
                {s.tools.map((t) => (
                  <span key={t} className="rounded-full bg-black/25 px-3 py-1 text-sm font-medium backdrop-blur">
                    {t}
                  </span>
                ))}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
                View steps <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <p ref={quoteRef} className="mx-auto mt-24 max-w-4xl text-center font-display text-[32px] font-semibold italic leading-tight sm:text-[48px]">
        {words.map((w, i) => (
          <Word key={i} word={w} i={i} total={words.length} progress={scrollYProgress} reduce={!!reduce} />
        ))}
      </p>
    </section>
  );
}

function Word({ word, i, total, progress, reduce }: { word: string; i: number; total: number; progress: ReturnType<typeof useScroll>["scrollYProgress"]; reduce: boolean }) {
  const start = i / total;
  const opacity = useTransform(progress, [start, start + 1 / total], [0.15, 1]);
  return (
    <motion.span style={{ opacity: reduce ? 1 : opacity }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  );
}
