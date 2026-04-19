"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generatePoster, generateMarketingContent } from "@/lib/generate-designs";
import { getInspirationImages } from "@/lib/inspiration-images";
import { removeBackgroundWithFallback } from "@/lib/gift-editor/remove-background";
import { postFormDataSchema } from "@/lib/validation";
import { persistExactAiUsageEvent } from "@/lib/ai-cost";
import type { PostFormData, OutputFormat, GeneratePostersResult, MarketingContentHub, Category, CampaignType } from "@/lib/types";
import type { BrandKitPromptData } from "@/lib/prompts";
import type { GenerationUsage } from "@/lib/generate-designs";
import { checkRateLimit } from "@/lib/rate-limit";
import { POSTER_CONFIG } from "@/lib/constants";

function extractUsageFromUnknown(value: unknown): GenerationUsage | undefined {
  if (!value || typeof value !== "object") return undefined;
  const maybeUsage = (value as { usage?: unknown }).usage;
  if (!maybeUsage || typeof maybeUsage !== "object") return undefined;

  const usage = maybeUsage as Partial<GenerationUsage>;
  if (
    (usage.route === "poster" || usage.route === "gift" || usage.route === "marketing-content" || usage.route === "menu" || usage.route === "edit") &&
    typeof usage.model === "string" &&
    (usage.provider === "google_direct" || usage.provider === "vercel_gateway") &&
    typeof usage.providerModelId === "string" &&
    typeof usage.inputTokens === "number" &&
    typeof usage.outputTokens === "number" &&
    typeof usage.imagesGenerated === "number" &&
    typeof usage.durationMs === "number" &&
    typeof usage.success === "boolean"
  ) {
    return usage as GenerationUsage;
  }
  return undefined;
}

/** Generate main poster (marketing content is generated separately after poster completes) */
export async function generatePosters(
  data: PostFormData,
  brandKit?: BrandKitPromptData,
  generationId?: string
): Promise<GeneratePostersResult & { usages: GenerationUsage[] }> {
  // Server-side auth gate — block unauthenticated requests
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) {
    throw new Error("يجب تسجيل الدخول لإنشاء تصاميم");
  }

  const { allowed } = await checkRateLimit(userId, "generate", 60, 5);
  if (!allowed) {
    throw new Error("لقد تجاوزت الحد المسموح. حاول مرة أخرى بعد دقيقة.");
  }

  // Sanitize: React server action serialization can convert undefined → null
  const sanitized = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === null ? undefined : v])
  ) as PostFormData;

  const validation = postFormDataSchema.safeParse(sanitized);
  if (!validation.success) {
    console.error("[generatePosters] validation_failed", {
      issues: validation.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        received: (i as { received?: unknown }).received,
      })),
    });
    throw new Error(
      `Validation failed: ${validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`
    );
  }

  const format: OutputFormat = sanitized.format;

  console.info("[generatePosters] start", { category: sanitized.category, userId });

  // Server-side credit charge BEFORE calling the AI.
  // This is the authoritative gate — the previous client-side post-hoc call
  // was bypassable (users could block it and generate unlimited content).
  const admin = createAdminClient();
  const creditIdempotencyKey = `poster_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const creditAmount = POSTER_CONFIG.creditsPerPoster;

  const { data: consumeResult, error: consumeErr } = await admin.rpc("consume_credits", {
    p_user_auth_id: userId,
    p_idempotency_key: creditIdempotencyKey,
    p_amount: creditAmount,
  });

  if (consumeErr) {
    console.error("[generatePosters] consume_credits RPC error", consumeErr);
    throw new Error("فشل التحقق من الأرصدة. حاول مرة أخرى.");
  }

  if (!consumeResult?.ok) {
    const code = consumeResult?.error_code;
    if (code === 402) {
      throw new Error("انتهت صلاحية الأرصدة المجانية. قم بالترقية للاستمرار.");
    }
    if (code === 403) {
      throw new Error("لا يوجد رصيد كافٍ. قم بشراء أرصدة أو الترقية للاستمرار.");
    }
    if (code === 404) {
      throw new Error("لم يتم تهيئة الأرصدة. حاول تسجيل الخروج والدخول مجدداً.");
    }
    throw new Error(consumeResult?.error ?? "تعذّر خصم الرصيد.");
  }

  const refundOnFailure = async () => {
    try {
      const { error: refundErr } = await admin.rpc("refund_credits", {
        p_user_auth_id: userId,
        p_consume_idempotency_key: creditIdempotencyKey,
        p_amount: creditAmount,
      });
      if (refundErr) {
        console.error("[generatePosters] refund_credits RPC error", refundErr);
      }
    } catch (err) {
      console.error("[generatePosters] refund threw", err);
    }
  };

  const usages: GenerationUsage[] = [];

  // Generate main poster only (gift removed, marketing content generated separately)
  try {
    const design = await generatePoster(sanitized, brandKit);
    usages.push(design.usage);
    try {
      await persistExactAiUsageEvent({
        userAuthId: userId,
        generationId,
        generationType: "poster",
        route: design.usage.route,
        model: design.usage.model,
        provider: design.usage.provider,
        providerModelId: design.usage.providerModelId,
        inputTokens: design.usage.inputTokens,
        outputTokens: design.usage.outputTokens,
        imagesGenerated: design.usage.imagesGenerated,
        durationMs: design.usage.durationMs,
        success: design.usage.success,
        error: design.usage.error ?? null,
      });
    } catch (usageErr) {
      console.error("[generatePosters] failed to persist exact usage", usageErr);
    }
    console.info("[generatePosters] main success");

    const main: GeneratePostersResult["main"] = {
      designIndex: 0,
      format,
      html: "",
      imageBase64: design.imageBase64,
      status: "complete" as const,
      designName: design.name,
      designNameAr: design.nameAr,
    };

    return { main, usages };
  } catch (err) {
    console.error("[generatePosters] main failed", err);
    // Refund: generation failed, user should not lose credit
    await refundOnFailure();
    const errUsage = extractUsageFromUnknown(err);
    if (errUsage) {
      usages.push(errUsage);
      try {
        await persistExactAiUsageEvent({
          userAuthId: userId,
          generationId,
          generationType: "poster",
          route: errUsage.route,
          model: errUsage.model,
          provider: errUsage.provider,
          providerModelId: errUsage.providerModelId,
          inputTokens: errUsage.inputTokens,
          outputTokens: errUsage.outputTokens,
          imagesGenerated: errUsage.imagesGenerated,
          durationMs: errUsage.durationMs,
          success: errUsage.success,
          error: errUsage.error ?? null,
        });
      } catch (usageErr) {
        console.error("[generatePosters] failed to persist exact usage", usageErr);
      }
    }

    const errorMessage = err instanceof Error ? err.message : "Generation failed";
    let errorType: "quota" | "capacity" | "generation" = "generation";
    if (/quota|exceeded.*quota|429|resource exhausted/i.test(errorMessage)) {
      errorType = "quota";
    } else if (/capacity|overloaded|503|high demand/i.test(errorMessage)) {
      errorType = "capacity";
    }

    const main: GeneratePostersResult["main"] = {
      designIndex: 0,
      format,
      html: "",
      status: "error",
      error: errorMessage,
      errorType,
      designName: "AI Design",
      designNameAr: "تصميم بالذكاء الاصطناعي",
    };

    return { main, usages };
  }
}

/** Generate marketing content for all social platforms (called AFTER poster is ready, no credit cost) */
export async function generateMarketingContentAction(
  data: PostFormData,
  language: string = "auto",
  generationId?: string
): Promise<{ content: MarketingContentHub; usage: GenerationUsage } | { error: string }> {
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
    if (!userId) {
      return { error: "Authentication required" };
    }

    const result = await generateMarketingContent(data, language);
    try {
      await persistExactAiUsageEvent({
        userAuthId: userId,
        generationId,
        generationType: "marketing-content",
        route: result.usage.route,
        model: result.usage.model,
        provider: result.usage.provider,
        providerModelId: result.usage.providerModelId,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        imagesGenerated: result.usage.imagesGenerated,
        durationMs: result.usage.durationMs,
        success: result.usage.success,
        error: result.usage.error ?? null,
      });
    } catch (usageErr) {
      console.error("[generateMarketingContentAction] failed to persist exact usage", usageErr);
    }
    const { usage, ...content } = result;
    return { content, usage };
  } catch (err) {
    console.warn("[generateMarketingContentAction] failed (non-blocking)", err);
    const usage = extractUsageFromUnknown(err);
    if (userId && usage) {
      try {
        await persistExactAiUsageEvent({
          userAuthId: userId,
          generationId,
          generationType: "marketing-content",
          route: usage.route,
          model: usage.model,
          provider: usage.provider,
          providerModelId: usage.providerModelId,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          imagesGenerated: usage.imagesGenerated,
          durationMs: usage.durationMs,
          success: usage.success,
          error: usage.error ?? null,
        });
      } catch (usageErr) {
        console.error("[generateMarketingContentAction] failed to persist exact usage", usageErr);
      }
    }
    return { error: err instanceof Error ? err.message : "Marketing content generation failed" };
  }
}

export async function removeOverlayBackground(
  base64: string
): Promise<{ imageBase64: string; method: "ai" | "fallback"; warning?: string }> {
  if (!base64 || typeof base64 !== "string") {
    throw new Error("Overlay image is required");
  }

  return removeBackgroundWithFallback(base64);
}

export async function prewarmGenerationAssets(input: {
  category: Category;
  campaignType: CampaignType;
  subType?: string;
}): Promise<{ ok: true }> {
  try {
    const subType = input.category === "services" ? input.subType : undefined;
    await getInspirationImages(input.category, 1, input.campaignType, subType);
  } catch (err) {
    console.warn("[prewarmGenerationAssets] non-blocking failure", err);
  }
  return { ok: true };
}
