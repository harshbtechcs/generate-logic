"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&/<>_";

/** Hacker-style text: random characters settle into the real text when it scrolls into view (and again on hover). */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);

  const run = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timer.current) cancelAnimationFrame(timer.current);
    const start = performance.now();
    const dur = 650;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const fixed = Math.floor(p * text.length);
      setOut(
        text
          .split("")
          .map((ch, i) => (i < fixed || ch === " " || ch === "/" ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (p < 1) timer.current = requestAnimationFrame(step);
    };
    timer.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer.current) cancelAnimationFrame(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span ref={ref} className={className} onMouseEnter={run} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}
