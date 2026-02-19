import { cookies, headers } from "next/headers";
import HomeClient from "./components/home-client";
import { getPricingForCountry, normalizeCountry } from "@/lib/country-pricing";

const COUNTRY_COOKIE = "pst_country";

async function getDetectedCountry() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieCountry = cookieStore.get(COUNTRY_COOKIE)?.value;
  const headerCountry = headerStore.get("x-vercel-ip-country");
  return normalizeCountry(cookieCountry ?? headerCountry);
}

export default async function HomePage() {
  const country = await getDetectedCountry();
  const pricing = getPricingForCountry(country);

  return <HomeClient countryCode={country} pricing={pricing} />;
}
