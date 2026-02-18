export type PlanPricing = {
  monthly: number;
  firstMonth: number;
};

export type PricingSet = {
  currency: "USD" | "SAR" | "AED" | "KWD" | "QAR";
  symbol: string;
  starter: PlanPricing;
  growth: PlanPricing;
  dominant: PlanPricing;
};

const USD_PRICING: PricingSet = {
  currency: "USD",
  symbol: "$",
  starter: { monthly: 7, firstMonth: 5 },
  growth: { monthly: 14, firstMonth: 10 },
  dominant: { monthly: 27, firstMonth: 19 },
};

const PRICING_BY_COUNTRY: Record<string, PricingSet> = {
  SA: {
    currency: "SAR",
    symbol: "ر.س",
    starter: { monthly: 29, firstMonth: 19 },
    growth: { monthly: 59, firstMonth: 39 },
    dominant: { monthly: 109, firstMonth: 79 },
  },
  AE: {
    currency: "AED",
    symbol: "د.إ",
    starter: { monthly: 29, firstMonth: 19 },
    growth: { monthly: 59, firstMonth: 39 },
    dominant: { monthly: 109, firstMonth: 79 },
  },
  KW: {
    currency: "KWD",
    symbol: "د.ك",
    starter: { monthly: 2.2, firstMonth: 1.5 },
    growth: { monthly: 4.3, firstMonth: 2.9 },
    dominant: { monthly: 8.3, firstMonth: 6.0 },
  },
  QA: {
    currency: "QAR",
    symbol: "ر.ق",
    starter: { monthly: 25, firstMonth: 17 },
    growth: { monthly: 51, firstMonth: 36 },
    dominant: { monthly: 98, firstMonth: 69 },
  },
};

export function normalizeCountry(country?: string | null) {
  if (!country) return "US";
  return country.toUpperCase();
}

export function getPricingForCountry(country?: string | null): PricingSet {
  const normalized = normalizeCountry(country);
  return PRICING_BY_COUNTRY[normalized] ?? USD_PRICING;
}

export function formatPrice(value: number, symbol: string) {
  if (Number.isInteger(value)) return `${symbol}${value}`;
  return `${symbol}${value.toFixed(1)}`;
}
