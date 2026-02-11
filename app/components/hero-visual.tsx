"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Palette, Smartphone } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative w-full max-w-sm aspect-[3/4] mx-auto lg:mx-0">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent rounded-full blur-[60px] md:blur-[80px] motion-safe:animate-pulse" />

      {/* Phone Frame */}
      <motion.div
        className="absolute inset-x-6 top-4 bottom-4 bg-surface-1 border border-card-border rounded-[2.5rem] shadow-2xl overflow-hidden motion-safe:animate-float"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Phone Notch */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-20 h-5 bg-background rounded-full" />
        </div>

        {/* Screen Content - Simulated poster */}
        <div className="px-4 pb-4 space-y-3">
          {/* Poster Preview Area */}
          <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-violet-500/20 via-cyan-400/10 to-violet-500/20 border border-card-border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] motion-safe:animate-[shimmer_3s_infinite]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="text-white" size={28} />
              </div>
              <div className="space-y-2 w-full">
                <div className="h-3 w-3/4 mx-auto bg-foreground/10 rounded-full" />
                <div className="h-2 w-1/2 mx-auto bg-foreground/8 rounded-full" />
              </div>
            </div>
          </div>

          {/* Simulated action buttons */}
          <div className="flex gap-2">
            <div className="flex-1 h-10 rounded-xl bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center">
              <div className="w-16 h-2 bg-white/40 rounded-full" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-card-border flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-foreground/10" />
            </div>
          </div>

          {/* Simulated format pills */}
          <div className="flex gap-2 justify-center pt-1">
            <div className="h-6 w-16 rounded-full bg-surface-2 border border-card-border" />
            <div className="h-6 w-16 rounded-full bg-primary/10 border border-primary/20" />
            <div className="h-6 w-16 rounded-full bg-surface-2 border border-card-border" />
          </div>
        </div>
      </motion.div>

      {/* Floating Badge: Speed */}
      <motion.div
        className="absolute -right-2 top-16 bg-surface-1/90 backdrop-blur-sm border border-card-border p-2.5 rounded-xl shadow-lg"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/15 rounded-lg">
            <Zap size={14} className="text-primary" />
          </div>
          <span className="text-xs font-bold text-foreground">30 ثانية</span>
        </div>
      </motion.div>

      {/* Floating Badge: Styles */}
      <motion.div
        className="absolute -left-4 top-36 bg-surface-1/90 backdrop-blur-sm border border-card-border p-2.5 rounded-xl shadow-lg motion-safe:animate-float"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ animationDelay: "2s" }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent/15 rounded-lg">
            <Palette size={14} className="text-accent" />
          </div>
          <span className="text-xs font-bold text-foreground">+28 ستايل</span>
        </div>
      </motion.div>

      {/* Floating Badge: Formats */}
      <motion.div
        className="absolute -right-4 bottom-24 bg-surface-1/90 backdrop-blur-sm border border-card-border p-2.5 rounded-xl shadow-lg motion-safe:animate-float"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ animationDelay: "1.5s" }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-success/15 rounded-lg">
            <Smartphone size={14} className="text-success" />
          </div>
          <span className="text-xs font-bold text-foreground">6 أحجام</span>
        </div>
      </motion.div>
    </div>
  );
}
