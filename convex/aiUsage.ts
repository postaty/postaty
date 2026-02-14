import { v } from "convex/values";
import { mutation, internalMutation, query } from "./_generated/server";

// ── Record a usage event (called from server actions) ──────────────

export const recordUsageEvent = internalMutation({
  args: {
    clerkUserId: v.string(),
    model: v.string(),
    route: v.union(v.literal("poster"), v.literal("gift")),
    inputTokens: v.number(),
    outputTokens: v.number(),
    imagesGenerated: v.number(),
    durationMs: v.number(),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Look up current pricing for cost estimation
    const pricing = await ctx.db
      .query("aiPricingConfig")
      .withIndex("by_model", (q) => q.eq("model", args.model))
      .order("desc")
      .first();

    let estimatedCostUsd = 0;
    if (pricing) {
      const inputCost = (args.inputTokens / 1000) * pricing.inputTokenCostPer1k;
      const outputCost = (args.outputTokens / 1000) * pricing.outputTokenCostPer1k;
      const imageCost = args.imagesGenerated * pricing.imageGenerationCost;
      estimatedCostUsd = inputCost + outputCost + imageCost;
    }

    return await ctx.db.insert("aiUsageEvents", {
      clerkUserId: args.clerkUserId,
      model: args.model,
      route: args.route,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      imagesGenerated: args.imagesGenerated,
      durationMs: args.durationMs,
      success: args.success,
      error: args.error,
      estimatedCostUsd,
      createdAt: Date.now(),
    });
  },
});

export const recordUsageBatch = mutation({
  args: {
    events: v.array(
      v.object({
        route: v.union(v.literal("poster"), v.literal("gift")),
        model: v.string(),
        inputTokens: v.number(),
        outputTokens: v.number(),
        imagesGenerated: v.number(),
        durationMs: v.number(),
        success: v.boolean(),
        error: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) {
      throw new Error("Not authenticated");
    }

    const pricingByModel = new Map<
      string,
      {
        inputTokenCostPer1k: number;
        outputTokenCostPer1k: number;
        imageGenerationCost: number;
      }
    >();

    const distinctModels = [...new Set(args.events.map((event) => event.model))];
    for (const model of distinctModels) {
      const pricing = await ctx.db
        .query("aiPricingConfig")
        .withIndex("by_model", (q) => q.eq("model", model))
        .order("desc")
        .first();
      if (pricing) {
        pricingByModel.set(model, {
          inputTokenCostPer1k: pricing.inputTokenCostPer1k,
          outputTokenCostPer1k: pricing.outputTokenCostPer1k,
          imageGenerationCost: pricing.imageGenerationCost,
        });
      }
    }

    const now = Date.now();
    const insertedIds = [];

    for (const event of args.events) {
      const pricing = pricingByModel.get(event.model);
      let estimatedCostUsd = 0;
      if (pricing) {
        const inputCost = (event.inputTokens / 1000) * pricing.inputTokenCostPer1k;
        const outputCost = (event.outputTokens / 1000) * pricing.outputTokenCostPer1k;
        const imageCost = event.imagesGenerated * pricing.imageGenerationCost;
        estimatedCostUsd = inputCost + outputCost + imageCost;
      }

      const id = await ctx.db.insert("aiUsageEvents", {
        clerkUserId: identity.subject,
        model: event.model,
        route: event.route,
        inputTokens: event.inputTokens,
        outputTokens: event.outputTokens,
        imagesGenerated: event.imagesGenerated,
        durationMs: event.durationMs,
        success: event.success,
        error: event.error,
        estimatedCostUsd,
        createdAt: now,
      });
      insertedIds.push(id);
    }

    return { count: insertedIds.length };
  },
});

// ── Seed initial pricing config ────────────────────────────────────

export const seedPricingConfig = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("aiPricingConfig").first();
    if (existing) return; // already seeded

    const now = Date.now();

    // Gemini 3 Pro Image (paid) — pricing from Google docs
    await ctx.db.insert("aiPricingConfig", {
      model: "gemini-3-pro-image-preview",
      effectiveFrom: now,
      effectiveTo: undefined,
      inputTokenCostPer1k: 0.00125, // $1.25/M input tokens
      outputTokenCostPer1k: 0.005, // $5.00/M output tokens
      imageGenerationCost: 0.039, // per image generated
      notes: "Gemini 3 Pro Image Preview — paid model. Prices from Google AI Studio (Feb 2026).",
      createdAt: now,
    });

    // Gemini 2.5 Flash Image (free tier)
    await ctx.db.insert("aiPricingConfig", {
      model: "gemini-2.5-flash-image",
      effectiveFrom: now,
      effectiveTo: undefined,
      inputTokenCostPer1k: 0,
      outputTokenCostPer1k: 0,
      imageGenerationCost: 0,
      notes: "Gemini 2.5 Flash Image — free tier model. No cost.",
      createdAt: now,
    });
  },
});

// ── Get usage summary for a user ───────────────────────────────────

export const getUserUsageSummary = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("aiUsageEvents")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .collect();

    let totalCost = 0;
    let totalImages = 0;
    let totalRequests = 0;
    let successCount = 0;
    let failureCount = 0;

    for (const e of events) {
      totalCost += e.estimatedCostUsd;
      totalImages += e.imagesGenerated;
      totalRequests++;
      if (e.success) successCount++;
      else failureCount++;
    }

    return {
      totalCost,
      totalImages,
      totalRequests,
      successCount,
      failureCount,
    };
  },
});
