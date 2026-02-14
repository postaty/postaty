import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// ── Admin guard (reused from admin.ts pattern) ─────────────────────

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    throw new Error("Admin access required");
  }

  return { clerkUserId: identity.subject, user };
}

// ── Public query for landing page ──────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db
      .query("showcase_images")
      .withIndex("by_order")
      .order("asc")
      .collect();

    return Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await ctx.storage.getUrl(img.storageId),
      }))
    );
  },
});

// ── Admin: browse completed generations with images ───────────────

export const listGenerations = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 50;

    let generations;
    if (args.category) {
      generations = await ctx.db
        .query("generations")
        .withIndex("by_category", (q) => q.eq("category", args.category as never))
        .order("desc")
        .take(limit);
    } else {
      generations = await ctx.db
        .query("generations")
        .order("desc")
        .take(limit);
    }

    // Only return completed generations that have at least one stored image
    const withImages = generations.filter(
      (g) => (g.status === "complete" || g.status === "partial") &&
        g.outputs.some((o) => o.storageId)
    );

    // Get which storageIds are already in showcase
    const existing = await ctx.db
      .query("showcase_images")
      .collect();
    const showcasedStorageIds = new Set(existing.map((s) => s.storageId));

    return Promise.all(
      withImages.map(async (gen) => {
        const outputsWithUrls = await Promise.all(
          gen.outputs
            .filter((o) => o.storageId)
            .map(async (o) => ({
              format: o.format,
              storageId: o.storageId!,
              url: await ctx.storage.getUrl(o.storageId!),
              alreadyInShowcase: showcasedStorageIds.has(o.storageId!),
            }))
        );

        return {
          _id: gen._id,
          category: gen.category,
          businessName: gen.businessName,
          productName: gen.productName,
          createdAt: gen.createdAt,
          outputs: outputsWithUrls,
        };
      })
    );
  },
});

// ── Admin mutations ────────────────────────────────────────────────

export const add = mutation({
  args: {
    storageId: v.id("_storage"),
    title: v.optional(v.string()),
    category: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const { clerkUserId } = await requireAdmin(ctx);

    // Prevent duplicates
    const existing = await ctx.db
      .query("showcase_images")
      .collect();
    if (existing.some((img) => img.storageId === args.storageId)) {
      throw new Error("Image already in showcase");
    }

    return await ctx.db.insert("showcase_images", {
      storageId: args.storageId,
      title: args.title,
      category: args.category,
      order: args.order,
      addedBy: clerkUserId,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("showcase_images") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    id: v.id("showcase_images"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { order: args.order });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
