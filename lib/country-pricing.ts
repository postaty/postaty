export type PlanPricing = {
  monthly: number;
};

export type PricingSet = {
  currency: string;
  symbol: string;
  starter: PlanPricing;
  growth: PlanPricing;
  dominant: PlanPricing;
};

/** Default USD pricing (used when no country-specific override exists) */
const USD_PRICING: PricingSet = {
  currency: "USD",
  symbol: "$",
  starter: { monthly: 9.99 },
  growth: { monthly: 16.99 },
  dominant: { monthly: 29.99 },
};

/**
 * Regional pricing overrides by country group.
 * Each group maps a set of country codes to custom prices.
 * Easy to extend — just add another entry.
 */
const REGIONAL_PRICING: Record<
  string,
  { countries: string[]; pricing: PricingSet }
> = {
  mena_local: {
    countries: ["JO", "PS", "IL"],
    pricing: {
      currency: "USD",
      symbol: "$",
      starter: { monthly: 13 },
      growth: { monthly: 22 },
      dominant: { monthly: 37 },
    },
  },
  egypt: {
    countries: ["EG"],
    pricing: {
      currency: "EGP",
      symbol: "EGP",
      starter: { monthly: 499 },
      growth: { monthly: 999 },
      dominant: { monthly: 1930 },
    },
  },
};

export function normalizeCountry(country?: string | null) {
  if (!country) return "US";
  return country.toUpperCase();
}

/**
 * Returns the region key (e.g. "mena_local") for a country code,
 * or null if the country uses default pricing.
 */
export function getRegionForCountry(
  country?: string | null
): string | null {
  if (!country) return null;
  const code = country.toUpperCase();
  for (const [regionKey, config] of Object.entries(REGIONAL_PRICING)) {
    if (config.countries.includes(code)) return regionKey;
  }
  return null;
}

/** Returns the pricing set for a given country code. */
export function getPricingForCountry(country?: string | null): PricingSet {
  const region = getRegionForCountry(country);
  if (region) return REGIONAL_PRICING[region].pricing;
  return USD_PRICING;
}

export function formatPrice(value: number, symbol = "$") {
  const formatted = Number.isInteger(value) ? `${value}` : `${value.toFixed(2)}`;
  if (symbol === "$") return `$${formatted}`;
  return `${formatted} ${symbol}`;
}
