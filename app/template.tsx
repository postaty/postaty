"use client";

import { motion } from "framer-motion";
import { PAGE_TRANSITION } from "@/lib/animation";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={PAGE_TRANSITION.initial}
      animate={PAGE_TRANSITION.animate}
      exit={PAGE_TRANSITION.exit}
      transition={PAGE_TRANSITION.transition}
    >
      {children}
    </motion.div>
  );
}
