import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Save a design as a reusable template ────────────────────────────

export const save = mutation({
  args: {
    orgId: v.id("organizations"),
    userId: v.id("users"),
    name: v.string(),
    nameAr: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("restaurant"),
      v.literal("supermarket"),
      v.literal("online")
    ),
    style: v.string(),
    designJson: v.string(),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const templateId = await ctx.db.insert("poster_templates", {
      orgId: args.orgId,
      userId: args.userId,
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
        v.literal("online")
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
    orgId: v.id("organizations"),
  },
  handler: async (ctx, { templateId, orgId }) => {
    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");
    if (template.orgId !== orgId) throw new Error("Unauthorized");

    if (template.previewStorageId) {
      await ctx.storage.delete(template.previewStorageId);
    }
    await ctx.db.delete(templateId);
  },
});
