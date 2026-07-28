"use client";

import { motion, useReducedMotion } from "framer-motion";

export function MotionReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export function HeroMotion({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div className="hero-visual" initial={reduced ? false : { opacity: 0, x: 35, rotateY: -6 }} animate={reduced ? undefined : { opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: .85, delay: .15, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
