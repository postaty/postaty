export type PlanPricing = {
  monthly: number;
  firstMonth: number;
};

export type PricingSet = {
  currency: "USD";
  symbol: "$";
  starter: PlanPricing;
  growth: PlanPricing;
  dominant: PlanPricing;
};

/** Default USD pricing (used when no country-specific override exists) */
const USD_PRICING: PricingSet = {
  currency: "USD",
  symbol: "$",
  starter: { monthly: 7, firstMonth: 5 },
  growth: { monthly: 14, firstMonth: 10 },
  dominant: { monthly: 27, firstMonth: 19 },
};

export function normalizeCountry(country?: string | null) {
  if (!country) return "US";
  return country.toUpperCase();
}

/** Static fallback — always USD. Admin overrides come from Convex. */
export function getPricingForCountry(_country?: string | null): PricingSet {
  return USD_PRICING;
}

export function formatPrice(value: number) {
  if (Number.isInteger(value)) return `$${value}`;
  return `$${value.toFixed(1)}`;
}
