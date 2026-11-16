"use client";

import { MotionConfig } from "framer-motion";

/** Client-side providers. reducedMotion="user" makes all Framer Motion animations respect the OS setting. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
