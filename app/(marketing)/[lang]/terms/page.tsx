import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/marketing/legal-page";
import { isMarketingLanguage, marketingLanguages } from "@/lib/marketing";
import { getSiteUrl } from "@/lib/site-url";
import { getTelegramContactUsername } from "@/lib/telegram-config";

type Props = { params: Promise<{ lang: string }> };

export function generateStaticParams() { return marketingLanguages.map((lang) => ({ lang })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) notFound();
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/${lang}/terms`;
  const isArabic = lang === "ar";
  return {
    title: isArabic ? "شروط استخدام AmalCrew" : "AmalCrew Terms of Use",
    description: isArabic ? "شروط استخدام AmalCrew للمقاولين وفرق المواقع في الإمارات والخليج." : "Terms of use for AmalCrew’s UAE and GCC workforce timesheet and Telegram workflow service.",
    alternates: { canonical, languages: { "en-AE": `${siteUrl}/en/terms`, "ar-AE": `${siteUrl}/ar/terms`, "x-default": `${siteUrl}/en/terms` } },
    robots: { index: true, follow: true },
  };
}

export default async function TermsRoute({ params }: Props) {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) notFound();
  const username = getTelegramContactUsername();
  return <LegalPage lang={lang} document="terms" telegramContactUrl={username ? `https://t.me/${username}` : null} />;
}
