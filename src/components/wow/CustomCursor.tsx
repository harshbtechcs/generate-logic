"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * A glowing ring that trails the mouse and grows over anything clickable.
 * Desktop mice only; the normal cursor stays, so nothing is harder to use.
 */
export function CustomCursor() {
  const [on, setOn] = useState(false);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setOn(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as Element | null;
      setHover(!!el?.closest?.("a, button, [role=button], input, select, textarea, label, summary"));
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  if (!on) return null;
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[150] rounded-full border-2 border-brand-teal/70 mix-blend-screen"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: hover ? 54 : 30, height: hover ? 54 : 30, scale: down ? 0.8 : 1, backgroundColor: hover ? "rgba(34,211,238,0.12)" : "rgba(34,211,238,0)", boxShadow: hover ? "0 0 24px rgba(34,211,238,0.55)" : "0 0 10px rgba(34,211,238,0.3)" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[150] h-1.5 w-1.5 rounded-full bg-brand-teal shadow-[0_0_8px_#22d3ee]"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
    </>
  );
}
