"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";
import { CategorySelector } from "./category-selector";
import { RestaurantForm } from "./forms/restaurant-form";
import { SupermarketForm } from "./forms/supermarket-form";
import { EcommerceForm } from "./forms/ecommerce-form";
import { ServicesForm } from "./forms/services-form";
import { FashionForm } from "./forms/fashion-form";
import { BeautyForm } from "./forms/beauty-form";
import type { Category, PostFormData } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/constants";
import { useLocale } from "@/hooks/use-locale";

interface CreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostFormData) => void;
  isLoading: boolean;
}

export function CreateSheet({ isOpen, onClose, onSubmit, isLoading }: CreateSheetProps) {
  const { locale, t } = useLocale();
  const [category, setCategory] = useState<Category | null>(null);
  const categoryLabelsEn: Record<Category, string> = {
    restaurant: "Restaurants & Cafes",
    supermarket: "Supermarkets",
    ecommerce: "E-commerce",
    services: "Services",
    fashion: "Fashion",
    beauty: "Beauty & Care",
  };

  const handleBack = () => {
    if (category) {
      setCategory(null);
    } else {
      onClose();
    }
  };

  const renderForm = () => {
    switch (category) {
      case "restaurant":
        return <RestaurantForm onSubmit={onSubmit} isLoading={isLoading} />;
      case "supermarket":
        return <SupermarketForm onSubmit={onSubmit} isLoading={isLoading} />;
      case "ecommerce":
        return <EcommerceForm onSubmit={onSubmit} isLoading={isLoading} />;
      case "services":
        return <ServicesForm onSubmit={onSubmit} isLoading={isLoading} />;
      case "fashion":
        return <FashionForm onSubmit={onSubmit} isLoading={isLoading} />;
      case "beauty":
        return <BeautyForm onSubmit={onSubmit} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[70] bg-background rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-[600px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:h-[85vh] md:max-h-[800px] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-card-border bg-surface-1 sticky top-0 z-10">
               <div className="flex items-center gap-2">
                 {(category || (category === null && isOpen)) && (
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 rounded-full hover:bg-surface-2 transition-colors"
                    >
                        {category ? <ArrowLeft size={20} className="text-muted" /> : <X size={20} className="text-muted" />}
                    </button>
                 )}
                 <h2 className="text-lg font-bold text-foreground">
                    {category ? t("أدخل التفاصيل", "Enter details") : t("ماذا تريد أن تصمم؟", "What do you want to create?")}
                 </h2>
               </div>
               {category && (
                 <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {locale === "ar" ? CATEGORY_LABELS[category] : categoryLabelsEn[category]}
                 </span>
               )}
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain bg-background p-4 pb-24 md:pb-4 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {!category ? (
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="py-4"
                        >
                            <CategorySelector onSelect={setCategory} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="bg-surface-1 rounded-2xl p-1 shadow-sm border border-card-border">
                                {renderForm()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile safe area spacer if needed */}
            <div className="md:hidden h-[env(safe-area-inset-bottom)] bg-surface-1" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
