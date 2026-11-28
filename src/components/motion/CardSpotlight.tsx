"use client";

import { useEffect } from "react";

/** Lets every .gl-card show a soft light that follows the mouse (pure CSS variables, no re-renders). */
export function CardSpotlight() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let last: HTMLElement | null = null;
    const move = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.(".gl-card") as HTMLElement | null;
      if (last && last !== card) last.style.removeProperty("--spot-o");
      last = card;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
      card.style.setProperty("--spot-o", "1");
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return null;
}
