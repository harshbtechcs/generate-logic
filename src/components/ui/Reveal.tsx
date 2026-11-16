"use client";

import { motion, type Variants } from "framer-motion";

type Variant = "up" | "blur" | "left" | "right" | "zoom";

const variants: Record<Variant, Variants> = {
  up: { hidden: { opacity: 0, y: 56, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1 } },
  blur: { hidden: { opacity: 0, y: 40, filter: "blur(10px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } },
  left: { hidden: { opacity: 0, x: -48 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 56 }, show: { opacity: 1, x: 0 } },
  zoom: { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } },
};

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  delay?: number;
  as?: "div" | "li" | "article" | "section" | "span" | "h1" | "h2" | "p";
};

/** Animates its children into view as the user scrolls down to them. */
export function Reveal({ children, className, variant = "up", delay = 0, as = "div" }: Props) {
  // Cast keeps TypeScript from building a huge union of every motion element type.
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      variants={variants[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Tag>
  );
}
