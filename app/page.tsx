import { cookies, headers } from "next/headers";
import HomeClient from "./components/home-client";
import { getPricingForCountry, normalizeCountry } from "@/lib/country-pricing";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n";

const COUNTRY_COOKIE = "pst_country";

async function getDetectedCountry() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieCountry = cookieStore.get(COUNTRY_COOKIE)?.value;
  const headerCountry = headerStore.get("x-vercel-ip-country");
  return normalizeCountry(cookieCountry ?? headerCountry);
}

export default async function HomePage() {
  const [country, cookieStore] = await Promise.all([getDetectedCountry(), cookies()]);
  const pricing = getPricingForCountry(country);
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return <HomeClient countryCode={country} pricing={pricing} locale={locale} />;
}
