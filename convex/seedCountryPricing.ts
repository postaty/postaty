import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

type PlanKey = "starter" | "growth" | "dominant";

interface SeedRow {
  countryCode: string;
  planKey: PlanKey;
  currency: string;
  currencySymbol: string;
  monthlyAmountCents: number;
  firstMonthAmountCents: number;
}

// Default pricing: all countries get USD prices, admin can adjust later
const DEFAULT_USD: Omit<SeedRow, "countryCode" | "planKey" | "monthlyAmountCents" | "firstMonthAmountCents"> = {
  currency: "USD",
  currencySymbol: "$",
};

const PLANS: Array<{ planKey: PlanKey; monthlyAmountCents: number; firstMonthAmountCents: number }> = [
  { planKey: "starter", monthlyAmountCents: 700, firstMonthAmountCents: 500 },
  { planKey: "growth", monthlyAmountCents: 1400, firstMonthAmountCents: 1000 },
  { planKey: "dominant", monthlyAmountCents: 2700, firstMonthAmountCents: 1900 },
];

// Countries to seed — add more as needed
const COUNTRIES = [
  "US", "SA", "AE", "KW", "QA", "BH", "OM", "EG", "JO", "LB",
  "IQ", "MA", "TN", "DZ", "LY", "SD", "YE", "SY", "PS",
  "GB", "DE", "FR", "TR", "IN", "PK",
];

export const seedCountryPricing = internalAction({
  args: {},
  handler: async (ctx) => {
    let count = 0;
    for (const countryCode of COUNTRIES) {
      for (const plan of PLANS) {
        await ctx.runMutation(internal.stripeAdmin.upsertCountryPricing, {
          countryCode,
          planKey: plan.planKey,
          ...DEFAULT_USD,
          monthlyAmountCents: plan.monthlyAmountCents,
          firstMonthAmountCents: plan.firstMonthAmountCents,
          isActive: true,
        });
        count++;
      }
    }
    return { seeded: count };
  },
});
