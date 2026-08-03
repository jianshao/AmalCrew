import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingSite } from "@/components/marketing/marketing-site";
import { isMarketingLanguage, marketingContent, marketingLanguages } from "@/lib/marketing";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return marketingLanguages.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) notFound();
  const content = marketingContent[lang];
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/${lang}`;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    keywords: lang === "en"
      ? ["construction timesheet software UAE", "employee time tracking Dubai", "contractor workforce management", "site timesheet app", "GCC workforce software"]
      : ["برنامج دوام الموظفين الإمارات", "برنامج إدارة العمال دبي", "سجل ساعات العمل للمقاولين", "إدارة فرق البناء"],
    alternates: {
      canonical,
      languages: {
        "en-AE": `${siteUrl}/en`,
        "ar-AE": `${siteUrl}/ar`,
        "x-default": `${siteUrl}/en`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "AmalCrew",
      title: content.metadata.title,
      description: content.metadata.ogDescription,
      locale: content.locale.replace("-", "_"),
      alternateLocale: lang === "en" ? ["ar_AE"] : ["en_AE"],
      images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "AmalCrew workforce operations" }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metadata.title,
      description: content.metadata.ogDescription,
      images: [`${siteUrl}/og.png`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function MarketingPage({ params }: Props) {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) notFound();
  const content = marketingContent[lang];
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "AmalCrew",
        url: `${siteUrl}/${lang}`,
        logo: `${siteUrl}/og.png`,
        areaServed: ["AE", "SA", "QA", "BH", "KW", "OM"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "AmalCrew",
        url: `${siteUrl}/${lang}`,
        inLanguage: content.locale,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebApplication",
        name: "AmalCrew",
        url: `${siteUrl}/${lang}`,
        description: content.metadata.description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: content.locale,
        featureList: content.product.items.map((item) => item.title),
        offers: content.pricing.plans.map((plan) => ({
          "@type": "Offer",
          name: plan.name,
          price: plan.price,
          priceCurrency: "USD",
          url: `${siteUrl}/login?mode=signup&plan=${plan.id}`,
        })),
        provider: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MarketingSite lang={lang} />
    </>
  );
}
