import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const alternates = {
    languages: {
      "en-AE": `${siteUrl}/en`,
      "ar-AE": `${siteUrl}/ar`,
      "x-default": `${siteUrl}/en`,
    },
  };
  const contactAlternates = {
    languages: {
      "en-AE": `${siteUrl}/en/contact`,
      "ar-AE": `${siteUrl}/ar/contact`,
      "x-default": `${siteUrl}/en/contact`,
    },
  };
  const pricingAlternates = {
    languages: {
      "en-AE": `${siteUrl}/en/pricing`,
      "ar-AE": `${siteUrl}/ar/pricing`,
      "x-default": `${siteUrl}/en/pricing`,
    },
  };
  const privacyAlternates = {
    languages: {
      "en-AE": `${siteUrl}/en/privacy`,
      "ar-AE": `${siteUrl}/ar/privacy`,
      "x-default": `${siteUrl}/en/privacy`,
    },
  };
  const termsAlternates = {
    languages: {
      "en-AE": `${siteUrl}/en/terms`,
      "ar-AE": `${siteUrl}/ar/terms`,
      "x-default": `${siteUrl}/en/terms`,
    },
  };
  return [
    { url: `${siteUrl}/en`, changeFrequency: "weekly", priority: 1, alternates },
    { url: `${siteUrl}/ar`, changeFrequency: "weekly", priority: 1, alternates },
    { url: `${siteUrl}/en/contact`, changeFrequency: "monthly", priority: 0.8, alternates: contactAlternates },
    { url: `${siteUrl}/ar/contact`, changeFrequency: "monthly", priority: 0.8, alternates: contactAlternates },
    { url: `${siteUrl}/en/pricing`, changeFrequency: "monthly", priority: 0.85, alternates: pricingAlternates },
    { url: `${siteUrl}/ar/pricing`, changeFrequency: "monthly", priority: 0.85, alternates: pricingAlternates },
    { url: `${siteUrl}/en/privacy`, changeFrequency: "yearly", priority: 0.3, alternates: privacyAlternates },
    { url: `${siteUrl}/ar/privacy`, changeFrequency: "yearly", priority: 0.3, alternates: privacyAlternates },
    { url: `${siteUrl}/en/terms`, changeFrequency: "yearly", priority: 0.3, alternates: termsAlternates },
    { url: `${siteUrl}/ar/terms`, changeFrequency: "yearly", priority: 0.3, alternates: termsAlternates },
    {
      url: `${siteUrl}/en/construction-timesheet-software-uae`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
