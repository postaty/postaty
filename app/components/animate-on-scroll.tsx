"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FADE_UP, STAGGER_CONTAINER } from "@/lib/animation";

export function AnimateOnScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={FADE_UP.initial}
      animate={isInView ? FADE_UP.animate : FADE_UP.initial}
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={STAGGER_CONTAINER}
      className={className}
    >
      {children}
    </motion.div>
  );
}
