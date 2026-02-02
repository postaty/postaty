"use client";

import { useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Category, PostFormData, GenerationResult } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/constants";
import { CategorySelector } from "./components/category-selector";
import { RestaurantForm } from "./components/forms/restaurant-form";
import { SupermarketForm } from "./components/forms/supermarket-form";
import { OnlineForm } from "./components/forms/online-form";
import { GenerationView } from "./components/generation-view";
import { generatePoster } from "./actions";
import { ArrowRight, Sparkles } from "lucide-react";

type AppStep = "select-category" | "fill-form" | "generating" | "results";

export default function Home() {
  const [step, setStep] = useState<AppStep>("select-category");
  const [category, setCategory] = useState<Category | null>(null);
  const [genStep, setGenStep] = useState<
    "crafting-prompt" | "generating-images" | "complete" | "error"
  >("crafting-prompt");
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const saveGeneration = useMutation(api.generations.save);

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setStep("fill-form");
  };

  const handleBack = () => {
    if (step === "fill-form") {
      setCategory(null);
      setStep("select-category");
    } else if (step === "results") {
      setResults([]);
      setError(undefined);
      setStep("fill-form");
    }
  };

  const handleSubmit = (data: PostFormData) => {
    setStep("generating");
    setGenStep("crafting-prompt");
    setResults([]);
    setError(undefined);

    startTransition(async () => {
      try {
        setGenStep("generating-images");

        const result = await generatePoster(data);

        setResults(result.results);
        setGenStep("complete");
        setStep("results");

        // Save to Convex
        const successfulOutputs = result.results
          .filter((r) => r.status === "complete")
          .map((r) => ({
            format: r.format,
            imageUrl: `generated-${r.format}`,
          }));

        if (successfulOutputs.length > 0) {
          await saveGeneration({
            category: data.category,
            businessName: result.businessName,
            productName: result.productName,
            inputs: JSON.stringify({
              ...data,
              logo: "[image]",
              mealImage: "[image]",
              productImage: "[image]",
              productImages: "[images]",
            }),
            outputs: successfulOutputs,
          });
        }
      } catch (err) {
        setGenStep("error");
        setError(
          err instanceof Error ? err.message : "حدث خطأ غير متوقع"
        );
        setStep("results");
      }
    });
  };

  return (
    <main className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20 shadow-sm">
            <Sparkles size={24} className="text-primary" />
            <span className="text-primary font-semibold tracking-wide text-sm">أدوات الذكاء الاصطناعي</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient bg-[length:200%_auto]">
            مولد بوسترات السوشيال ميديا
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            أنشئ بوسترات احترافية وجذابة لعروضك في ثوانٍ معدودة باستخدام أحدث تقنيات الذكاء الاصطناعي
          </p>
        </div>

        {/* Back button */}
        {step !== "select-category" && step !== "generating" && (
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 mb-8 text-muted hover:text-primary transition-colors font-medium px-4 py-2 hover:bg-primary/5 rounded-lg w-fit"
          >
            <div className="p-1 rounded-full bg-card border border-card-border group-hover:border-primary/30 transition-colors">
              <ArrowRight size={16} />
            </div>
            {step === "fill-form" ? "اختيار الفئة" : "عودة للنموذج"}
          </button>
        )}

        {/* Category label */}
        {category && step !== "select-category" && (
          <div className="mb-8 flex justify-center">
            <span className="inline-block bg-white shadow-sm border border-primary/20 text-primary px-6 py-2 rounded-full text-base font-semibold">
              {CATEGORY_LABELS[category]}
            </span>
          </div>
        )}

        {/* Step content */}
        <div className="transition-all duration-300 ease-in-out">
          {step === "select-category" && (
            <CategorySelector onSelect={handleCategorySelect} />
          )}

          {step === "fill-form" && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-6 md:p-8">
               {category === "restaurant" && (
                <RestaurantForm onSubmit={handleSubmit} isLoading={isPending} />
              )}

              {category === "supermarket" && (
                <SupermarketForm onSubmit={handleSubmit} isLoading={isPending} />
              )}

              {category === "online" && (
                <OnlineForm onSubmit={handleSubmit} isLoading={isPending} />
              )}
            </div>
          )}

          {(step === "generating" || step === "results") && (
            <GenerationView step={genStep} results={results} error={error} />
          )}
        </div>

        {/* New poster button */}
        {step === "results" && genStep === "complete" && (
          <div className="text-center mt-12">
            <button
              onClick={() => {
                setCategory(null);
                setStep("select-category");
                setResults([]);
              }}
              className="px-8 py-3.5 bg-white border border-primary/20 text-primary rounded-xl hover:bg-primary hover:text-white shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all font-bold text-lg transform hover:-translate-y-1"
            >
              إنشاء بوستر جديد
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
