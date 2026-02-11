"use client";

import { UtensilsCrossed, ShoppingCart, Package, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { STAGGER_ITEM, TAP_SCALE } from "@/lib/animation";
import type { Category } from "@/lib/types";

interface CategorySelectorProps {
  onSelect: (category: Category) => void;
}

const categories: {
  id: Category;
  label: string;
  icon: typeof UtensilsCrossed;
  description: string;
  gradient: string;
  glow: string;
  border: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: "restaurant",
    label: "مطاعم وكافيهات",
    icon: UtensilsCrossed,
    description: "صمم بوسترات لوجباتك وعروضك المميزة بلمسة شهية.",
    gradient: "from-orange-500 to-red-500",
    glow: "shadow-orange-500/20",
    border: "border-orange-500/15 hover:border-orange-500/40",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-400",
  },
  {
    id: "supermarket",
    label: "سوبر ماركت",
    icon: ShoppingCart,
    description: "عروض المنتجات والخصومات الأسبوعية بتصاميم ملفتة.",
    gradient: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-500/15 hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    id: "online",
    label: "منتجات أونلاين",
    icon: Package,
    description: "روج لمنتجات متجرك الإلكتروني وزد مبيعاتك.",
    gradient: "from-violet-500 to-fuchsia-500",
    glow: "shadow-violet-500/20",
    border: "border-violet-500/15 hover:border-violet-500/40",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
];

export function CategorySelector({ onSelect }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <motion.button
            key={cat.id}
            variants={STAGGER_ITEM}
            whileTap={TAP_SCALE}
            onClick={() => onSelect(cat.id)}
            className={`group relative bg-surface-1 border ${cat.border} rounded-[2rem] p-8 text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cat.glow} overflow-hidden`}
          >
            {/* Hover Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

            <div className="relative z-10 flex flex-col h-full">
              {/* Icon Container */}
              <div className={`w-14 h-14 ${cat.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                <Icon size={28} className={cat.iconColor} />
              </div>

              {/* Text Content */}
              <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {cat.label}
              </h3>
              <p className="text-muted text-sm leading-relaxed mb-8 flex-grow">
                {cat.description}
              </p>

              {/* CTA Indicator */}
              <div className={`flex items-center text-sm font-bold ${cat.iconColor} group-hover:gap-3 gap-2 transition-all duration-300`}>
                <span>ابدأ التصميم</span>
                <ArrowLeft size={16} />
              </div>
            </div>

            {/* Decorative Circle */}
            <div className={`absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr ${cat.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 group-hover:scale-150 transition-all duration-700`} />
          </motion.button>
        );
      })}
    </div>
  );
}
