"use client";

import { useQuery } from "convex/react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { PricingSet } from "@/lib/country-pricing";
import { PricingCard } from "@/app/components/pricing-card";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";
import type { AppLocale } from "@/lib/i18n";

const AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

type PlanKey = "starter" | "growth" | "dominant";

type PricingClientProps = {
  countryCode: string;
  fallbackPricing: PricingSet;
};

export default function PricingClient({ countryCode, fallbackPricing }: PricingClientProps) {
  const router = useRouter();
  const convexPricing = useQuery(api.stripeAdmin.getCountryPricing, { countryCode });
  const { locale, t } = useLocale();

  const prices = buildPrices(convexPricing, fallbackPricing);

  return (
    <main className="min-h-screen relative pt-8 pb-16 px-4 md:pt-16 md:pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">{t("العودة", "Back")}</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-center">
            {t("اختر خطتك —", "Choose your plan -")} <span className="text-gradient">{t("الشهر الأول مخفض", "first month discounted")}</span>
          </h1>
          <p className="text-muted text-lg text-center">
            {t("جميع الخطط مع ضمان استرجاع الأموال 30 يوم", "All plans include a 30-day money-back guarantee")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {(["starter", "growth", "dominant"] as const).map((planKey) => (
            <PricingCard
              key={planKey}
              planKey={planKey}
              monthlyPrice={prices[planKey].monthly}
              firstMonthPrice={prices[planKey].firstMonth}
              isPopular={planKey === "growth"}
              locale={locale}
              ctaButton={
                AUTH_ENABLED ? (
                  <PlanCTAWithAuth planKey={planKey} isPopular={planKey === "growth"} router={router} locale={locale} />
                ) : (
                  <PlanCTANoAuth isPopular={planKey === "growth"} locale={locale} />
                )
              }
            />
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black mb-6 text-center">{t("أرصدة إضافية", "Extra credits")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AddonCard
              title={t("5 أرصدة", "5 credits")}
              price="$3"
              addonKey="addon_5"
              router={router}
              locale={locale}
            />
            <AddonCard
              title={t("10 أرصدة", "10 credits")}
              price="$7"
              addonKey="addon_10"
              router={router}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function buildPrices(
  convexPricing: Array<{
    planKey: string;
    monthlyAmountCents: number;
    firstMonthAmountCents: number;
    currencySymbol: string;
  }> | undefined,
  fallback: PricingSet
): {
  starter: { monthly: number; firstMonth: number };
  growth: { monthly: number; firstMonth: number };
  dominant: { monthly: number; firstMonth: number };
} {
  if (!convexPricing || convexPricing.length === 0) {
    return {
      starter: fallback.starter,
      growth: fallback.growth,
      dominant: fallback.dominant,
    };
  }

  const result = {
    starter: fallback.starter,
    growth: fallback.growth,
    dominant: fallback.dominant,
  };

  for (const row of convexPricing) {
    const key = row.planKey as PlanKey;
    if (key in result) {
      result[key] = {
        monthly: row.monthlyAmountCents / 100,
        firstMonth: row.firstMonthAmountCents / 100,
      };
    }
  }

  return result;
}

function PlanCTAWithAuth({
  planKey,
  isPopular,
  router,
  locale,
}: {
  planKey: PlanKey;
  isPopular: boolean;
  router: ReturnType<typeof useRouter>;
  locale: AppLocale;
}) {
  const { isSignedIn } = useAuth();
  const checkoutUrl = `/checkout?plan=${planKey}`;

  if (isSignedIn) {
    return (
      <button
        onClick={() => router.push(checkoutUrl)}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          isPopular
            ? "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
            : "border border-card-border text-foreground hover:bg-surface-2"
        }`}
      >
        {locale === "ar" ? "اشترك الآن" : "Subscribe now"}
      </button>
    );
  }

  return (
    <SignInButton forceRedirectUrl={checkoutUrl}>
      <button
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          isPopular
            ? "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
            : "border border-card-border text-foreground hover:bg-surface-2"
        }`}
      >
        {locale === "ar" ? "سجل دخول للاشتراك" : "Sign in to subscribe"}
      </button>
    </SignInButton>
  );
}

function PlanCTANoAuth({
  isPopular,
  locale,
}: {
  isPopular: boolean;
  locale: AppLocale;
}) {
  return (
    <Link
      href="/sign-in"
      className={`block w-full py-3 rounded-xl font-bold text-center transition-all ${
        isPopular
          ? "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
          : "border border-card-border text-foreground hover:bg-surface-2"
      }`}
    >
      {locale === "ar" ? "سجل دخول للاشتراك" : "Sign in to subscribe"}
    </Link>
  );
}

function AddonCard({
  title,
  price,
  addonKey,
  router,
  locale,
}: {
  title: string;
  price: string;
  addonKey: "addon_5" | "addon_10";
  router: ReturnType<typeof useRouter>;
  locale: AppLocale;
}) {
  if (AUTH_ENABLED) {
    return (
      <AddonCardWithAuth
        title={title}
        price={price}
        addonKey={addonKey}
        router={router}
        locale={locale}
      />
    );
  }

  return (
    <AddonCardNoAuth
      title={title}
      price={price}
      locale={locale}
    />
  );
}

function AddonCardWithAuth({
  title,
  price,
  addonKey,
  router,
  locale,
}: {
  title: string;
  price: string;
  addonKey: "addon_5" | "addon_10";
  router: ReturnType<typeof useRouter>;
  locale: AppLocale;
}) {
  const { isSignedIn } = useAuth();
  const checkoutUrl = `/checkout?addon=${addonKey}`;

  return (
    <div className="bg-surface-1 border border-card-border rounded-2xl p-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={16} className="text-accent" />
          <span className="font-bold">{title}</span>
        </div>
        <span className="text-2xl font-black" dir="ltr">{price}</span>
        <span className={`text-sm text-muted ${locale === "ar" ? "mr-1" : "ml-1"}`}>{locale === "ar" ? "دفعة واحدة" : "One-time"}</span>
      </div>
      {isSignedIn ? (
        <button
          onClick={() => router.push(checkoutUrl)}
          className="px-5 py-2.5 bg-accent/10 text-accent border border-accent/20 rounded-xl font-bold text-sm hover:bg-accent/20 transition-colors"
        >
          {locale === "ar" ? "شراء" : "Buy"}
        </button>
      ) : (
        <SignInButton forceRedirectUrl={checkoutUrl}>
          <button className="px-5 py-2.5 bg-accent/10 text-accent border border-accent/20 rounded-xl font-bold text-sm hover:bg-accent/20 transition-colors">
            {locale === "ar" ? "شراء" : "Buy"}
          </button>
        </SignInButton>
      )}
    </div>
  );
}

function AddonCardNoAuth({
  title,
  price,
  locale,
}: {
  title: string;
  price: string;
  locale: AppLocale;
}) {
  return (
    <div className="bg-surface-1 border border-card-border rounded-2xl p-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={16} className="text-accent" />
          <span className="font-bold">{title}</span>
        </div>
        <span className="text-2xl font-black" dir="ltr">{price}</span>
        <span className={`text-sm text-muted ${locale === "ar" ? "mr-1" : "ml-1"}`}>{locale === "ar" ? "دفعة واحدة" : "One-time"}</span>
      </div>
      <Link
        href="/sign-in"
        className="px-5 py-2.5 bg-accent/10 text-accent border border-accent/20 rounded-xl font-bold text-sm hover:bg-accent/20 transition-colors"
      >
        {locale === "ar" ? "شراء" : "Buy"}
      </Link>
    </div>
  );
}
