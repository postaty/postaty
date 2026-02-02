import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    category: v.union(
      v.literal("restaurant"),
      v.literal("supermarket"),
      v.literal("online")
    ),
    businessName: v.string(),
    productName: v.string(),
    inputs: v.string(),
    outputs: v.array(
      v.object({
        format: v.string(),
        imageUrl: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generations", args);
  },
});

export const list = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("restaurant"),
        v.literal("supermarket"),
        v.literal("online")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("generations")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(20);
    }
    return await ctx.db.query("generations").order("desc").take(20);
  },
});
