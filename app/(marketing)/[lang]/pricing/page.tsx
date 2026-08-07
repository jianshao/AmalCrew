import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PricingPage } from "@/components/marketing/pricing-page";
import { isMarketingLanguage, marketingLanguages } from "@/lib/marketing";
import { getSiteUrl } from "@/lib/site-url";
import { getTelegramContactUsername } from "@/lib/telegram-config";

type Props = { params: Promise<{ lang: string }> };

export function generateStaticParams() { return marketingLanguages.map((lang) => ({ lang })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) notFound();
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/${lang}/pricing`;
  const isArabic = lang === "ar";
  return {
    title: isArabic ? "أسعار AmalCrew لفرق المواقع في الإمارات" : "AmalCrew Pricing | UAE Construction Timesheet Software",
    description: isArabic ? "باقات AmalCrew الشهرية للمقاولين وفرق المواقع في الإمارات، تبدأ من 29 دولاراً لكل مؤسسة." : "AmalCrew pricing for UAE contractors: project timesheets, Telegram worker submissions and approvals from USD 29 per organization per month.",
    alternates: { canonical, languages: { "en-AE": `${siteUrl}/en/pricing`, "ar-AE": `${siteUrl}/ar/pricing`, "x-default": `${siteUrl}/en/pricing` } },
    robots: { index: true, follow: true },
  };
}

export default async function PricingRoute({ params }: Props) {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) notFound();
  const username = getTelegramContactUsername();
  return <PricingPage lang={lang} telegramContactUrl={username ? `https://t.me/${username}` : null} />;
}
