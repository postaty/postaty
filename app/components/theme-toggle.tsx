"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { TAP_SCALE } from "@/lib/animation";
import { useLocale } from "@/hooks/use-locale";

type Theme = "dark" | "light";

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useLocale();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved ?? "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.add("theme-transition");
    document.documentElement.setAttribute("data-theme", next);
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 300);
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={TAP_SCALE}
      className={`p-2 rounded-xl bg-surface-2 border border-card-border text-muted hover:text-foreground transition-colors ${className ?? ""}`}
      aria-label={theme === "dark" ? t("تفعيل الوضع الفاتح", "Enable light mode") : t("تفعيل الوضع الداكن", "Enable dark mode")}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </motion.button>
  );
}
