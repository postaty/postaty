"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDevIdentity } from "@/hooks/use-dev-identity";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, LayoutGrid } from "lucide-react";

// Components
import { CategorySelector } from "../components/category-selector";
import { RestaurantForm } from "../components/forms/restaurant-form";
import { SupermarketForm } from "../components/forms/supermarket-form";
import { OnlineForm } from "../components/forms/online-form";
import dynamic from "next/dynamic";

// Types & Libs
import type { Category, PostFormData, PosterResult, PosterGenStep } from "@/lib/types";
import type { BrandKitPromptData } from "@/lib/prompts";
import { CATEGORY_LABELS, FORMAT_CONFIGS } from "@/lib/constants";
import { CATEGORY_THEMES } from "@/lib/category-themes";
import { generatePosters } from "../actions-v2";
import { TAP_SCALE } from "@/lib/animation";

const PosterGrid = dynamic(
  () => import("../components/poster-grid").then((mod) => mod.PosterGrid)
);

function getBusinessName(data: PostFormData): string {
  switch (data.category) {
    case "restaurant": return data.restaurantName;
    case "supermarket": return data.supermarketName;
    case "online": return data.shopName;
  }
}

function getProductName(data: PostFormData): string {
  switch (data.category) {
    case "restaurant": return data.mealName;
    case "supermarket": return data.productName;
    case "online": return data.productName;
  }
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-surface-2 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-surface-2 rounded"></div>
        </div>
      </div>
    }>
      <CreatePageContent />
    </Suspense>
  );
}

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { orgId, userId } = useDevIdentity();

  // State
  const [category, setCategory] = useState<Category | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState<PosterGenStep>("idle");
  const [results, setResults] = useState<PosterResult[]>([]);
  const [giftResult, setGiftResult] = useState<PosterResult | null>(null);
  const [error, setError] = useState<string>();
  const generatingRef = useRef(false);

  // Get category theme
  const theme = category ? CATEGORY_THEMES[category] : null;

  // Initialize category from URL if present
  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam && ["restaurant", "supermarket", "online"].includes(catParam)) {
      setCategory(catParam as Category);
    }
  }, [searchParams]);

  // Auth Protection
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Data Fetching
  const createGeneration = useMutation(api.generations.create);
  const updateStatus = useMutation(api.generations.updateStatus);
  const updateOutput = useMutation(api.generations.updateOutput);
  const generateUploadUrl = useMutation(api.generations.generateUploadUrl);
  const savePosterTemplate = useMutation(api.posterTemplates.save);

  const defaultBrandKit = useQuery(
    api.brandKits.getDefault,
    isAuthenticated ? { orgId } : "skip"
  );

  const brandKitPromptData: BrandKitPromptData | undefined = defaultBrandKit
    ? {
        palette: defaultBrandKit.palette,
        styleAdjectives: defaultBrandKit.styleAdjectives,
        doRules: defaultBrandKit.doRules,
        dontRules: defaultBrandKit.dontRules,
        styleSeed: defaultBrandKit.styleSeed ?? undefined,
      }
    : undefined;

  // Handlers
  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    const url = new URL(window.location.href);
    url.searchParams.set("category", cat);
    window.history.pushState({}, "", url);
  };

  const handleBack = () => {
    if (results.length > 0) {
      setResults([]);
      setGiftResult(null);
      setGenStep("idle");
    } else if (category) {
      setCategory(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("category");
      window.history.pushState({}, "", url);
    } else {
      router.push("/");
    }
  };

  const runGeneration = (data: PostFormData) => {
    if (generatingRef.current) return;
    generatingRef.current = true;

    setGenStep("generating-designs");
    setError(undefined);
    setIsGenerating(true);
    setResults([]);
    setGiftResult(null);

    const startTime = Date.now();

    generatePosters(data, brandKitPromptData)
      .then(({ main: posterResult, gift }) => {
        setResults([posterResult]);
        if (gift) setGiftResult(gift);
        setGenStep("complete");
        setIsGenerating(false);
        generatingRef.current = false;

        if (posterResult.status === "complete" && posterResult.imageBase64) {
          saveToConvex(data, posterResult, startTime);
        }
      })
      .catch((err) => {
        const errorResult: PosterResult = {
          designIndex: 0,
          format: data.formats[0],
          html: "",
          status: "error",
          error: err instanceof Error ? err.message : "Generation failed",
          designName: "Design",
          designNameAr: "تصميم",
        };
        setResults([errorResult]);
        setGenStep("error");
        setError(err instanceof Error ? err.message : "Generation failed");
        setIsGenerating(false);
        generatingRef.current = false;
      });
  };

  const saveToConvex = async (data: PostFormData, posterResult: PosterResult, startTime: number) => {
    try {
      const generationId = await createGeneration({
        orgId,
        userId,
        brandKitId: defaultBrandKit?._id,
        category: data.category,
        businessName: getBusinessName(data),
        productName: getProductName(data),
        inputs: JSON.stringify({
          ...data,
          logo: undefined,
          mealImage: undefined,
          productImage: undefined,
          productImages: undefined,
        }),
        formats: data.formats,
        creditsCharged: 1,
      });

      const format = data.formats[0];
      const formatConfig = FORMAT_CONFIGS[format];

      const base64Data = posterResult.imageBase64!.includes(",")
        ? posterResult.imageBase64!.split(",")[1]
        : posterResult.imageBase64!;
      const mimeType = posterResult.imageBase64!.includes(",")
        ? posterResult.imageBase64!.split(",")[0].split(":")[1].split(";")[0]
        : "image/png";

      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });

      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type || "image/png" },
        body: blob,
      });
      const { storageId } = await uploadRes.json();

      await updateOutput({
        generationId,
        format,
        storageId,
        width: formatConfig.width,
        height: formatConfig.height,
      });

      await updateStatus({
        generationId,
        status: "complete",
        durationMs: Date.now() - startTime,
      });
    } catch (saveErr) {
      console.error("Failed to save generation:", saveErr);
    }
  };

  const handleSaveAsTemplate = async (designIndex: number) => {
    const result = results.find((item) => item.designIndex === designIndex);
    if (!result || result.status !== "complete") return;

    try {
      await savePosterTemplate({
        orgId,
        userId,
        name: result.designName,
        nameAr: result.designNameAr,
        description: result.designName,
        category: category!,
        style: "modern",
        designJson: JSON.stringify({
          name: result.designName,
          nameAr: result.designNameAr,
          imageBase64: result.imageBase64,
        }),
      });
    } catch (err) {
      console.error("Failed to save template:", err);
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-surface-2 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-surface-2 rounded"></div>
        </div>
    </div>;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header with category accent */}
      <header className="bg-surface-1 border-b border-card-border sticky top-0 z-40 relative overflow-hidden">
        {/* Category accent line */}
        {theme && (
          <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${theme.gradient}`} />
        )}
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <motion.button
                whileTap={TAP_SCALE}
                onClick={handleBack}
                className="p-2 -mr-2 rounded-full hover:bg-surface-2 text-muted transition-colors"
             >
                <ArrowRight size={20} />
             </motion.button>
             <h1 className="text-lg font-bold text-foreground">
                {results.length > 0 ? "نتائج التصميم" : category ? "تفاصيل الإعلان" : "إنشاء جديد"}
             </h1>
          </div>

          {category && !results.length && (
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: `${CATEGORY_THEMES[category].accent}15`, color: CATEGORY_THEMES[category].accent }}
            >
                <Sparkles size={12} />
                <span>{CATEGORY_LABELS[category]}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!category ? (
            <motion.div
                key="category-selection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-foreground mb-3">ماذا تريد أن تصمم اليوم؟</h2>
                    <p className="text-muted text-lg">اختر نوع نشاطك التجاري للبدء في تصميم إعلانك</p>
                </div>
                <CategorySelector onSelect={handleCategorySelect} />
            </motion.div>
          ) : (results.length > 0 || isGenerating) ? (
            <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
            >
                <div className="bg-surface-1 rounded-3xl p-1 shadow-sm border border-card-border">
                    <PosterGrid
                        results={results}
                        giftResult={giftResult}
                        genStep={genStep}
                        error={error}
                        totalExpected={1}
                        onSaveAsTemplate={handleSaveAsTemplate}
                    />
                </div>

                <div className="flex justify-center">
                    <motion.button
                        whileTap={TAP_SCALE}
                        onClick={() => { setResults([]); setGenStep("idle"); }}
                        className="flex items-center gap-2 px-6 py-3 bg-surface-1 border border-card-border text-foreground rounded-xl hover:bg-surface-2 font-medium transition-colors"
                    >
                        <LayoutGrid size={18} />
                        <span>تصميم آخر</span>
                    </motion.button>
                </div>
            </motion.div>
          ) : (
            <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <div
                  className="bg-surface-1 rounded-3xl p-6 md:p-10 shadow-xl border max-w-3xl mx-auto"
                  style={{ borderColor: theme ? theme.border : "var(--card-border)" }}
                >
                    {category === "restaurant" && (
                        <RestaurantForm onSubmit={runGeneration} isLoading={isGenerating} />
                    )}
                    {category === "supermarket" && (
                        <SupermarketForm onSubmit={runGeneration} isLoading={isGenerating} />
                    )}
                    {category === "online" && (
                        <OnlineForm onSubmit={runGeneration} isLoading={isGenerating} />
                    )}
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
