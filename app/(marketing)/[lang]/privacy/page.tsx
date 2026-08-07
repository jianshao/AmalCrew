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
  const canonical = `${siteUrl}/${lang}/privacy`;
  const isArabic = lang === "ar";
  return {
    title: isArabic ? "سياسة خصوصية AmalCrew" : "AmalCrew Privacy Policy",
    description: isArabic ? "سياسة خصوصية AmalCrew لزوار الموقع وفرق المواقع في الإمارات والخليج." : "How AmalCrew handles website, account, workforce and Telegram data for UAE and GCC field teams.",
    alternates: { canonical, languages: { "en-AE": `${siteUrl}/en/privacy`, "ar-AE": `${siteUrl}/ar/privacy`, "x-default": `${siteUrl}/en/privacy` } },
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyRoute({ params }: Props) {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) notFound();
  const username = getTelegramContactUsername();
  return <LegalPage lang={lang} document="privacy" telegramContactUrl={username ? `https://t.me/${username}` : null} />;
}
