"use client";

import { motion } from "framer-motion";
import { FADE_UP, STAGGER_CONTAINER } from "@/lib/animation";

export function AnimateOnScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      // Keep content visible by default to avoid first-paint blanking on Safari/mobile.
      initial={false}
      animate={FADE_UP.animate}
      transition={FADE_UP.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerOnScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      // Avoid hiding sections before IntersectionObserver settles.
      initial={false}
      animate="animate"
      variants={STAGGER_CONTAINER}
      className={className}
    >
      {children}
    </motion.div>
  );
}
