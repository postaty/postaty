"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Palette,
  Smartphone,
  TrendingUp,
  WandSparkles,
  BadgePercent,
  Megaphone,
  ShoppingBag,
  UtensilsCrossed,
  Store,
} from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative w-full max-w-sm aspect-[3/4] mx-auto lg:mx-0">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 via-accent/20 to-transparent blur-[70px]" />
      <div className="absolute inset-8 rounded-full border border-primary/20 motion-safe:animate-hero-orbit" />
      <div className="absolute inset-14 rounded-full border border-accent/20 motion-safe:animate-hero-orbit-reverse" />
      <div className="absolute top-12 left-10 h-28 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent motion-safe:animate-hero-beam" />
      <div className="absolute bottom-20 right-10 h-24 w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent motion-safe:animate-hero-beam-reverse" />

      <motion.div
        className="absolute inset-x-5 top-4 bottom-5 rounded-[2.4rem] border border-card-border bg-surface-1/90 shadow-2xl overflow-hidden backdrop-blur-sm motion-safe:animate-hero-float"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-5 w-20 rounded-full bg-background/90" />
        </div>

        <div className="px-4 pb-4 space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_38%),radial-gradient(circle_at_80%_72%,rgba(34,211,238,0.26),transparent_35%)] motion-safe:animate-hero-pan" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full motion-safe:animate-[shimmer_3.4s_linear_infinite]" />

            <div className="absolute inset-5">
              <div className="absolute inset-0 rounded-2xl border border-white/10 bg-surface-1/80 backdrop-blur-sm p-3 motion-safe:animate-hero-poster-a">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-2 w-16 rounded-full bg-foreground/15" />
                  <Sparkles size={14} className="text-primary" />
                </div>
                <div className="mb-2 h-24 rounded-xl bg-gradient-to-br from-primary/50 via-accent/30 to-primary/20" />
                <div className="h-2 w-20 rounded-full bg-foreground/20" />
                <div className="mt-2 h-2 w-14 rounded-full bg-foreground/10" />
              </div>

              <div className="absolute inset-0 rounded-2xl border border-white/10 bg-surface-1/80 backdrop-blur-sm p-3 motion-safe:animate-hero-poster-b">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-2 w-14 rounded-full bg-foreground/15" />
                  <Palette size={14} className="text-accent" />
                </div>
                <div className="mb-2 h-24 rounded-xl bg-gradient-to-br from-success/40 via-primary/25 to-accent/25" />
                <div className="h-2 w-20 rounded-full bg-foreground/20" />
                <div className="mt-2 h-2 w-12 rounded-full bg-foreground/10" />
              </div>

              <div className="absolute inset-0 rounded-2xl border border-white/10 bg-surface-1/80 backdrop-blur-sm p-3 motion-safe:animate-hero-poster-c">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-2 w-[4.5rem] rounded-full bg-foreground/15" />
                  <WandSparkles size={14} className="text-warning" />
                </div>
                <div className="mb-2 h-24 rounded-xl bg-gradient-to-br from-warning/50 via-primary/25 to-accent/25" />
                <div className="h-2 w-20 rounded-full bg-foreground/20" />
                <div className="mt-2 h-2 w-16 rounded-full bg-foreground/10" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="h-10 flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25">
              <div className="h-2 w-20 rounded-full bg-white/45" />
            </div>
            <div className="h-10 w-10 rounded-xl border border-card-border bg-surface-2 flex items-center justify-center">
              <Sparkles size={14} className="text-foreground/50" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="h-8 rounded-lg border border-card-border bg-surface-2/80 flex items-center justify-center motion-safe:animate-hero-symbol-float">
              <UtensilsCrossed size={12} className="text-warning" />
            </div>
            <div className="h-8 rounded-lg border border-card-border bg-surface-2/80 flex items-center justify-center motion-safe:animate-hero-symbol-float-delayed">
              <Store size={12} className="text-success" />
            </div>
            <div className="h-8 rounded-lg border border-card-border bg-surface-2/80 flex items-center justify-center motion-safe:animate-hero-symbol-float">
              <ShoppingBag size={12} className="text-accent" />
            </div>
            <div className="h-8 rounded-lg border border-card-border bg-surface-2/80 flex items-center justify-center motion-safe:animate-hero-symbol-float-delayed">
              <BadgePercent size={12} className="text-primary" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-2 top-14 rounded-xl border border-card-border bg-surface-1/90 p-2.5 shadow-lg backdrop-blur-sm motion-safe:animate-hero-chip"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/15 p-1.5">
            <Zap size={14} className="text-primary" />
          </div>
          <span className="text-xs font-bold text-foreground">30 ثانية</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute -left-4 top-36 rounded-xl border border-card-border bg-surface-1/90 p-2.5 shadow-lg backdrop-blur-sm motion-safe:animate-hero-chip-reverse"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-accent/15 p-1.5">
            <TrendingUp size={14} className="text-accent" />
          </div>
          <span className="text-xs font-bold text-foreground">+320% تفاعل</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-3 bottom-24 rounded-xl border border-card-border bg-surface-1/90 p-2.5 shadow-lg backdrop-blur-sm motion-safe:animate-hero-chip"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-success/15 p-1.5">
            <Smartphone size={14} className="text-success" />
          </div>
          <span className="text-xs font-bold text-foreground">6 أحجام</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute left-1 top-16 h-10 w-10 rounded-xl border border-card-border bg-surface-1/85 shadow-lg backdrop-blur-sm flex items-center justify-center motion-safe:animate-hero-symbol-float"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Megaphone size={14} className="text-primary" />
      </motion.div>

      <motion.div
        className="absolute right-1 top-44 h-9 w-9 rounded-lg border border-card-border bg-surface-1/85 shadow-lg backdrop-blur-sm flex items-center justify-center motion-safe:animate-hero-symbol-float-delayed"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <BadgePercent size={13} className="text-warning" />
      </motion.div>

      <motion.div
        className="absolute left-4 bottom-20 h-9 w-9 rounded-lg border border-card-border bg-surface-1/85 shadow-lg backdrop-blur-sm flex items-center justify-center motion-safe:animate-hero-symbol-float"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <ShoppingBag size={13} className="text-accent" />
      </motion.div>
    </div>
  );
}
