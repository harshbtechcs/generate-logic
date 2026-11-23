"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#4ADE80", "#22D3EE", "#60A5FA", "#FBBF24", "#F472B6", "#A78BFA"];

/** A short burst of confetti. Change `fire` (e.g. a counter) to play it again. */
export function Confetti({ fire, count = 70 }: { fire: number; count?: number }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!fire || reduce) return;
    setActive(fire);
    const t = setTimeout(() => setActive(0), 2200);
    return () => clearTimeout(t);
  }, [fire, reduce]);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 900,
        y: -(220 + Math.random() * 380),
        fall: 380 + Math.random() * 420,
        rotate: Math.random() * 720 - 360,
        size: 6 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.15,
        round: Math.random() > 0.6,
      })),
    // new shapes for every burst
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, count],
  );

  if (!active) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={`${active}-${p.id}`}
          className="absolute left-1/2 top-[60%]"
          style={{ width: p.size, height: p.round ? p.size : p.size * 0.45, background: p.color, borderRadius: p.round ? 999 : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + p.fall], opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: 1.9, delay: p.delay, ease: "easeOut", times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}
