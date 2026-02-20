"use client";

import { Sparkles, LayoutTemplate } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

interface PathSelectorProps {
  onSelectAI: () => void;
  onSelectTemplates: () => void;
}

export function PathSelector({ onSelectAI, onSelectTemplates }: PathSelectorProps) {
  const { t } = useLocale();
  const paths = [
    {
      id: "ai" as const,
      label: t("توليد بالذكاء الاصطناعي", "AI generation"),
      description: t("أدخل بياناتك واترك الذكاء الاصطناعي يصمم لك بوستر احترافي فريد", "Enter your data and let AI design a unique professional poster."),
      icon: Sparkles,
    },
    {
      id: "templates" as const,
      label: t("قوالب جاهزة", "Ready templates"),
      description: t("اختر قالب جاهز وعدّل عليه مباشرة — بدون انتظار", "Choose a template and edit it instantly, no waiting."),
      icon: LayoutTemplate,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {paths.map((path) => {
        const Icon = path.icon;
        const handleClick = path.id === "ai" ? onSelectAI : onSelectTemplates;
        return (
          <button
            key={path.id}
            onClick={handleClick}
            className="group relative bg-white border border-card-border rounded-3xl p-8 text-center hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110">
                <Icon size={36} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                {path.label}
              </h3>
              <p className="text-base text-muted leading-relaxed">{path.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
