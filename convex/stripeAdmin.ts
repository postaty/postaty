import Stripe from "stripe";
import { v } from "convex/values";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";

// ── Helpers ────────────────────────────────────────────────────────

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

// ── Admin guard for actions (ActionCtx cannot use db directly) ─────

export const requireAdminCheck = internalQuery({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      throw new Error("Admin access required");
    }
    return { clerkUserId: identity.subject };
  },
});

// Same guard but for QueryCtx (used in queries)
async function requireAdminQuery(ctx: { auth: { getUserIdentity: () => Promise<{ subject?: string | null } | null> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .first();
  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    throw new Error("Admin access required");
  }
  return { clerkUserId: identity.subject };
}

// ── Stripe Products ────────────────────────────────────────────────

export const listProducts = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});
    const stripe = getStripe();

    const [products, prices] = await Promise.all([
      stripe.products.list({ limit: 100 }),
      stripe.prices.list({ limit: 100 }),
    ]);

    const pricesByProduct = new Map<string, typeof prices.data>();
    for (const price of prices.data) {
      const productId =
        typeof price.product === "string" ? price.product : undefined;
      if (!productId) continue;
      if (!pricesByProduct.has(productId)) pricesByProduct.set(productId, []);
      pricesByProduct.get(productId)!.push(price);
    }

    return {
      products: products.data.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        active: p.active,
        metadata: p.metadata,
        defaultPriceId:
          typeof p.default_price === "string"
            ? p.default_price
            : p.default_price?.id ?? null,
        prices: (pricesByProduct.get(p.id) ?? []).map((pr) => ({
          id: pr.id,
          unitAmount: pr.unit_amount,
          currency: pr.currency,
          recurring: pr.recurring
            ? { interval: pr.recurring.interval }
            : null,
          lookupKey: pr.lookup_key,
          active: pr.active,
        })),
      })),
    };
  },
});

export const createProduct = action({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    priceAmountCents: v.number(),
    currency: v.string(),
    billingType: v.union(v.literal("recurring"), v.literal("one_time")),
    interval: v.optional(
      v.union(v.literal("month"), v.literal("year"))
    ),
    lookupKey: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});
    const stripe = getStripe();

    const product = await stripe.products.create({
      name: args.name,
      description: args.description ?? undefined,
      metadata: args.metadata ?? {},
    });

    const priceParams: Stripe.PriceCreateParams = {
      product: product.id,
      unit_amount: args.priceAmountCents,
      currency: args.currency,
      lookup_key: args.lookupKey,
      transfer_lookup_key: true,
    };

    if (args.billingType === "recurring" && args.interval) {
      priceParams.recurring = { interval: args.interval };
    }

    const price = await stripe.prices.create(priceParams);

    await stripe.products.update(product.id, {
      default_price: price.id,
    });

    return { productId: product.id, priceId: price.id };
  },
});

export const updateProduct = action({
  args: {
    productId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});
    const stripe = getStripe();

    const update: Stripe.ProductUpdateParams = {};
    if (args.name !== undefined) update.name = args.name;
    if (args.description !== undefined) update.description = args.description;
    if (args.metadata !== undefined) update.metadata = args.metadata;

    await stripe.products.update(args.productId, update);
    return { success: true };
  },
});

export const createPrice = action({
  args: {
    productId: v.string(),
    amountCents: v.number(),
    currency: v.string(),
    billingType: v.union(v.literal("recurring"), v.literal("one_time")),
    interval: v.optional(
      v.union(v.literal("month"), v.literal("year"))
    ),
    lookupKey: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});
    const stripe = getStripe();

    const priceParams: Stripe.PriceCreateParams = {
      product: args.productId,
      unit_amount: args.amountCents,
      currency: args.currency,
      lookup_key: args.lookupKey,
      transfer_lookup_key: true,
    };

    if (args.billingType === "recurring" && args.interval) {
      priceParams.recurring = { interval: args.interval };
    }

    const price = await stripe.prices.create(priceParams);

    // Update default_price on the product
    await stripe.products.update(args.productId, {
      default_price: price.id,
    });

    return { priceId: price.id };
  },
});

export const archiveProduct = action({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});
    const stripe = getStripe();

    const prices = await stripe.prices.list({
      product: args.productId,
      active: true,
    });
    for (const price of prices.data) {
      await stripe.prices.update(price.id, { active: false });
    }

    await stripe.products.update(args.productId, { active: false });
    return { success: true };
  },
});

// ── Coupons ────────────────────────────────────────────────────────

export const listCoupons = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});
    const stripe = getStripe();
    const coupons = await stripe.coupons.list({ limit: 100 });

    return {
      coupons: coupons.data.map((c) => ({
        id: c.id,
        name: c.name,
        amountOff: c.amount_off,
        percentOff: c.percent_off,
        currency: c.currency,
        duration: c.duration,
        durationInMonths: c.duration_in_months,
        maxRedemptions: c.max_redemptions,
        timesRedeemed: c.times_redeemed,
        valid: c.valid,
      })),
    };
  },
});

export const createCoupon = action({
  args: {
    name: v.string(),
    duration: v.union(
      v.literal("once"),
      v.literal("repeating"),
      v.literal("forever")
    ),
    amountOffCents: v.optional(v.number()),
    percentOff: v.optional(v.number()),
    currency: v.optional(v.string()),
    durationInMonths: v.optional(v.number()),
    maxRedemptions: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});
    const stripe = getStripe();

    const params: Stripe.CouponCreateParams = {
      name: args.name,
      duration: args.duration,
    };

    if (args.amountOffCents !== undefined) {
      params.amount_off = args.amountOffCents;
      params.currency = args.currency ?? "usd";
    }
    if (args.percentOff !== undefined) {
      params.percent_off = args.percentOff;
    }
    if (args.durationInMonths !== undefined) {
      params.duration_in_months = args.durationInMonths;
    }
    if (args.maxRedemptions !== undefined) {
      params.max_redemptions = args.maxRedemptions;
    }

    const coupon = await stripe.coupons.create(params);
    return { couponId: coupon.id };
  },
});

export const deleteCoupon = action({
  args: { couponId: v.string() },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});
    const stripe = getStripe();
    await stripe.coupons.del(args.couponId);
    return { success: true };
  },
});

// ── Country Pricing (public query) ─────────────────────────────────

export const getCountryPricing = query({
  args: { countryCode: v.string() },
  handler: async (ctx, args) => {
    const prices = await ctx.db
      .query("countryPricing")
      .withIndex("by_countryCode", (q) => q.eq("countryCode", args.countryCode))
      .collect();

    const activePrices = prices.filter((p) => p.isActive);
    if (activePrices.length > 0) return activePrices;

    // Fallback to US pricing
    const usPrices = await ctx.db
      .query("countryPricing")
      .withIndex("by_countryCode", (q) => q.eq("countryCode", "US"))
      .collect();
    return usPrices.filter((p) => p.isActive);
  },
});

// ── Country Pricing (admin queries/mutations) ──────────────────────

export const listCountryPricing = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminQuery(ctx);
    return await ctx.db.query("countryPricing").collect();
  },
});

export const upsertCountryPricing = internalMutation({
  args: {
    countryCode: v.string(),
    planKey: v.union(
      v.literal("starter"),
      v.literal("growth"),
      v.literal("dominant")
    ),
    currency: v.string(),
    currencySymbol: v.string(),
    monthlyAmountCents: v.number(),
    firstMonthAmountCents: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("countryPricing")
      .withIndex("by_countryCode_planKey", (q) =>
        q.eq("countryCode", args.countryCode).eq("planKey", args.planKey)
      )
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        currency: args.currency,
        currencySymbol: args.currencySymbol,
        monthlyAmountCents: args.monthlyAmountCents,
        firstMonthAmountCents: args.firstMonthAmountCents,
        isActive: args.isActive,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("countryPricing", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCountryPricing = action({
  args: {
    countryCode: v.string(),
    planKey: v.union(
      v.literal("starter"),
      v.literal("growth"),
      v.literal("dominant")
    ),
    currency: v.string(),
    currencySymbol: v.string(),
    monthlyAmountCents: v.number(),
    firstMonthAmountCents: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.stripeAdmin.requireAdminCheck, {});
    await ctx.runMutation(internal.stripeAdmin.upsertCountryPricing, args);
    return { success: true };
  },
});
