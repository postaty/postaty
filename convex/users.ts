import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const roleValidator = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member")
);

export const getOrCreate = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    orgId: v.id("organizations"),
    role: v.optional(roleValidator),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Update name/email if changed
      if (existing.email !== args.email || existing.name !== args.name) {
        await ctx.db.patch(existing._id, {
          email: args.email,
          name: args.name,
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      orgId: args.orgId,
      role: args.role ?? "member",
      createdAt: Date.now(),
    });
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const completeOnboarding = mutation({
  args: {
    businessName: v.string(),
    businessCategory: v.string(),
    brandColors: v.array(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      onboarded: true,
      businessName: args.businessName,
      businessCategory: args.businessCategory,
      brandColors: args.brandColors,
      logoStorageId: args.logoStorageId,
    });

    return user._id;
  },
});
