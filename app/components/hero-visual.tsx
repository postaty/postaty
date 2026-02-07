"use client";

import { motion } from "framer-motion";
import { ImageIcon, Wand2, Share2, Sparkles, BarChart3 } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative w-full max-w-lg aspect-square mx-auto lg:mx-0 perspective-1000">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-accent/20 to-transparent rounded-full blur-[80px] animate-pulse" />

      {/* Main Floating Interface Card */}
      <div className="absolute inset-x-4 top-10 bottom-10 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-primary/10 flex flex-col overflow-hidden animate-float">
        {/* Header */}
        <div className="h-10 border-b border-white/20 flex items-center px-4 gap-2 bg-white/30">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
          <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/40 text-[10px] font-medium text-foreground/60">
            <Sparkles size={10} className="text-primary" />
            <span>AI Generator</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 space-y-4 relative">
          {/* Simulated Image Placeholder */}
          <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-white/80 to-white/40 border border-white/50 shadow-inner flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />
            <ImageIcon className="text-primary/20 w-12 h-12" />
            
            {/* Floating Badge */}
            <div className="absolute top-3 right-3 bg-white/80 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-foreground/70">Ready</span>
            </div>
          </div>

          {/* Simulated Controls */}
          <div className="space-y-2">
            <div className="h-2 w-3/4 bg-foreground/5 rounded-full" />
            <div className="h-2 w-1/2 bg-foreground/5 rounded-full" />
          </div>

          <div className="flex gap-2 pt-2">
            <div className="flex-1 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center gap-2">
                <Wand2 size={12} className="text-primary" />
                <div className="w-12 h-1.5 bg-primary/20 rounded-full" />
            </div>
             <div className="w-8 h-8 rounded-lg bg-white/50 border border-white/60 flex items-center justify-center">
                <Share2 size={12} className="text-foreground/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements (Decorations) */}
      
      {/* Card 1: Stats */}
      <div className="absolute -right-4 top-20 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 w-32 animate-float" style={{ animationDelay: '1s' }}>
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 rounded-md">
                <BarChart3 size={12} className="text-green-600" />
            </div>
            <span className="text-[10px] font-bold text-foreground/70">Engagement</span>
        </div>
        <div className="text-xl font-black text-foreground">85%</div>
        <div className="w-full bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-green-500 w-[85%] h-full rounded-full" />
        </div>
      </div>

      {/* Card 2: Color Palette */}
      <div className="absolute -left-8 bottom-32 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 animate-float" style={{ animationDelay: '2s' }}>
        <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#4f46e5] shadow-sm ring-2 ring-white" />
            <div className="w-6 h-6 rounded-full bg-[#8b5cf6] shadow-sm ring-2 ring-white" />
            <div className="w-6 h-6 rounded-full bg-[#f43f5e] shadow-sm ring-2 ring-white" />
        </div>
      </div>

    </div>
  );
}
