import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPage } from "@/components/marketing/contact-page";
import { isMarketingLanguage, marketingLanguages } from "@/lib/marketing";
import { getSiteUrl } from "@/lib/site-url";
import { getTelegramContactUsername } from "@/lib/telegram-config";

type Props = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return marketingLanguages.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) notFound();
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/${lang}/contact`;
  const isArabic = lang === "ar";
  const title = isArabic ? "تواصل مع AmalCrew لفرق المواقع في الإمارات" : "Contact AmalCrew | UAE Construction Timesheet Software";
  const description = isArabic
    ? "تواصل مع AmalCrew للاستفسار عن الباقات وإعداد تيليجرام ولغات العمال ومسار سجل الدوام للمشاريع في الإمارات."
    : "Contact AmalCrew for UAE contractor pricing, Telegram setup, worker language support and a construction timesheet workflow walkthrough.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-AE": `${siteUrl}/en/contact`,
        "ar-AE": `${siteUrl}/ar/contact`,
        "x-default": `${siteUrl}/en/contact`,
      },
    },
    robots: { index: true, follow: true },
  };
}

export default async function ContactRoute({ params }: Props) {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) notFound();
  const username = getTelegramContactUsername();
  return <ContactPage lang={lang} telegramContactUrl={username ? `https://t.me/${username}` : null} />;
}
