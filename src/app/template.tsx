"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Every page fades and rises in when you navigate to it.
 * No filter, and the transform is cleared at the end, so fixed-position children (confetti, dialogs) still use the viewport.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0, transitionEnd: { transform: "none" } }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
