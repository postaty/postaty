"use client";

import { UtensilsCrossed, ShoppingCart, Package } from "lucide-react";
import type { Category } from "@/lib/types";

interface CategorySelectorProps {
  onSelect: (category: Category) => void;
}

const categories: { id: Category; label: string; icon: typeof UtensilsCrossed; description: string }[] = [
  {
    id: "restaurant",
    label: "مطاعم",
    icon: UtensilsCrossed,
    description: "أنشئ بوستر لعروض المطاعم والوجبات",
  },
  {
    id: "supermarket",
    label: "سوبر ماركت",
    icon: ShoppingCart,
    description: "أنشئ بوستر لعروض السوبر ماركت والمنتجات",
  },
  {
    id: "online",
    label: "منتجات أونلاين",
    icon: Package,
    description: "أنشئ بوستر لمنتجاتك على الإنترنت",
  },
];

export function CategorySelector({ onSelect }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="group relative bg-white border border-card-border rounded-3xl p-8 text-center hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110">
                <Icon size={36} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{cat.label}</h3>
              <p className="text-base text-muted leading-relaxed">{cat.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
