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
  return [
    { url: `${siteUrl}/en`, changeFrequency: "weekly", priority: 1, alternates },
    { url: `${siteUrl}/ar`, changeFrequency: "weekly", priority: 1, alternates },
    { url: `${siteUrl}/en/contact`, changeFrequency: "monthly", priority: 0.8, alternates: contactAlternates },
    { url: `${siteUrl}/ar/contact`, changeFrequency: "monthly", priority: 0.8, alternates: contactAlternates },
    {
      url: `${siteUrl}/en/construction-timesheet-software-uae`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
