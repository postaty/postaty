import type { Transition, Variants } from "framer-motion";

// Spring presets
export const SPRING = {
  snappy: { type: "spring", stiffness: 400, damping: 28 } as Transition,
  gentle: { type: "spring", stiffness: 200, damping: 24 } as Transition,
  bouncy: { type: "spring", stiffness: 300, damping: 15 } as Transition,
  rubber: { type: "spring", stiffness: 600, damping: 35 } as Transition,
};

// Durations
export const DURATION = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.35,
  slow: 0.5,
  page: 0.45,
};

// Easing curves
export const EASE = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  overshoot: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};

// Page transitions (RTL: forward = slide from left)
export const PAGE_TRANSITION = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: DURATION.page, ease: EASE.out },
};

// Component enter animations
export const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.normal, ease: EASE.out },
};

// Stagger children
export const STAGGER_CONTAINER: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
};

export const STAGGER_ITEM: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE.out } },
};

// Micro-interactions
export const TAP_SCALE = { scale: 0.96 };
export const HOVER_LIFT = { y: -2, transition: { duration: 0.2 } };
