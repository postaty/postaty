import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser } from "./auth";

// ── Save a design as a reusable template ────────────────────────────

export const save = mutation({
  args: {
    name: v.string(),
    nameAr: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("restaurant"),
      v.literal("supermarket"),
      v.literal("ecommerce"),
      v.literal("services"),
      v.literal("fashion"),
      v.literal("beauty"),
      v.literal("online") // legacy
    ),
    style: v.string(),
    designJson: v.string(),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);
    const templateId = await ctx.db.insert("poster_templates", {
      orgId: currentUser.orgId,
      userId: currentUser._id,
      name: args.name,
      nameAr: args.nameAr,
      description: args.description,
      category: args.category,
      style: args.style,
      designJson: args.designJson,
      isPublic: args.isPublic ?? false,
      usageCount: 0,
      createdAt: Date.now(),
    });
    return templateId;
  },
});

// ── List templates by category ──────────────────────────────────────

export const list = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("restaurant"),
        v.literal("supermarket"),
        v.literal("ecommerce"),
        v.literal("services"),
        v.literal("fashion"),
        v.literal("beauty"),
        v.literal("online") // legacy
      )
    ),
    orgId: v.optional(v.id("organizations")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, orgId, limit }) => {
    let q;
    if (category) {
      q = ctx.db
        .query("poster_templates")
        .withIndex("by_category", (idx) => idx.eq("category", category));
    } else if (orgId) {
      q = ctx.db
        .query("poster_templates")
        .withIndex("by_orgId", (idx) => idx.eq("orgId", orgId));
    } else {
      q = ctx.db.query("poster_templates");
    }

    const templates = await q.order("desc").take(limit ?? 30);

    return Promise.all(
      templates.map(async (t) => ({
        ...t,
        previewUrl: t.previewStorageId
          ? await ctx.storage.getUrl(t.previewStorageId)
          : undefined,
      }))
    );
  },
});

// ── Get a single template ───────────────────────────────────────────

export const get = query({
  args: { templateId: v.id("poster_templates") },
  handler: async (ctx, { templateId }) => {
    const template = await ctx.db.get(templateId);
    if (!template) return null;

    return {
      ...template,
      previewUrl: template.previewStorageId
        ? await ctx.storage.getUrl(template.previewStorageId)
        : undefined,
    };
  },
});

// ── Increment usage count ───────────────────────────────────────────

export const incrementUsage = mutation({
  args: { templateId: v.id("poster_templates") },
  handler: async (ctx, { templateId }) => {
    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");
    await ctx.db.patch(templateId, {
      usageCount: template.usageCount + 1,
    });
  },
});

// ── Delete a template ───────────────────────────────────────────────

export const remove = mutation({
  args: {
    templateId: v.id("poster_templates"),
  },
  handler: async (ctx, { templateId }) => {
    const currentUser = await requireCurrentUser(ctx);
    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");
    if (template.orgId !== currentUser.orgId) throw new Error("Unauthorized");

    if (template.previewStorageId) {
      await ctx.storage.delete(template.previewStorageId);
    }
    await ctx.db.delete(templateId);
  },
});
