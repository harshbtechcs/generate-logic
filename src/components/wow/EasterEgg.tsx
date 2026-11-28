"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WORDS = [
  "docker run", "kubectl apply", "terraform plan", "git push", "ansible-playbook", "helm install", "aws s3 ls", "ssh root@",
  "systemctl restart", "chmod +x", "grep -r", "docker compose up", "kubectl get pods", "terraform apply", "git rebase", "curl -I",
  "sudo", "apt install", "jenkins", "ci/cd", "nginx -t", "tail -f", "ps aux", "top", "vim", "yaml", "0", "1",
];
const SECRET = ["s", "u", "d", "o"];
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** Type "sudo" (or the Konami code) anywhere: DevOps commands rain down the screen. */
export function EasterEgg() {
  const [active, setActive] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const keys = useRef<string[]>([]);

  const stop = useCallback(() => setActive(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea, [contenteditable=true]")) return;
      if (active && e.key === "Escape") return stop();
      keys.current = [...keys.current, e.key].slice(-10);
      const tail = (n: number) => keys.current.slice(-n).map((k) => k.toLowerCase());
      if (tail(4).join() === SECRET.join() || keys.current.join() === KONAMI.join()) {
        keys.current = [];
        setActive(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, stop]);

  useEffect(() => {
    if (!active) return;
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const colW = 150;
    const cols = Math.ceil(innerWidth / colW) + 1;
    const drops = Array.from({ length: cols * 2 }, (_, i) => ({
      x: (i % cols) * colW + Math.random() * 40,
      y: -Math.random() * innerHeight,
      v: 2 + Math.random() * 4,
      w: WORDS[Math.floor(Math.random() * WORDS.length)]!,
      hue: [150, 185, 210, 265][i % 4]!,
    }));
    let raf = 0;
    const tick = () => {
      ctx.fillStyle = "rgba(3,6,14,0.18)";
      ctx.fillRect(0, 0, innerWidth, innerHeight);
      ctx.font = "600 15px ui-monospace, SFMono-Regular, Menlo, monospace";
      for (const d of drops) {
        ctx.fillStyle = `hsla(${d.hue}, 90%, 65%, 0.95)`;
        ctx.fillText(d.w, d.x, d.y);
        d.y += reduce ? 0.6 : d.v;
        if (d.y > innerHeight + 20) {
          d.y = -20;
          d.w = WORDS[Math.floor(Math.random() * WORDS.length)]!;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    const t = setTimeout(stop, 6500);
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      removeEventListener("resize", resize);
    };
  }, [active, stop]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div className="fixed inset-0 z-[190] cursor-pointer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={stop}>
          <canvas ref={canvas} className="absolute inset-0 h-full w-full bg-[#03060e]" aria-hidden="true" />
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.3 }}
            className="absolute left-1/2 top-1/2 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-green-400/50 bg-black/80 p-7 text-center font-mono shadow-[0_0_80px_rgba(74,222,128,0.45)] backdrop-blur"
            role="status"
          >
            <div className="text-sm text-green-300">[sudo] password for student: ••••••••</div>
            <div className="mt-3 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">Root access granted 🔓</div>
            <p className="mt-3 text-sm text-slate-300">You found the Generate Logic easter egg. Real DevOps engineers read the docs — and type sudo carefully 😄</p>
            <p className="mt-4 text-[11px] tracking-[0.2em] text-slate-500">CLICK OR PRESS ESC TO EXIT</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
