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
  return [
    { url: `${siteUrl}/en`, changeFrequency: "weekly", priority: 1, alternates },
    { url: `${siteUrl}/ar`, changeFrequency: "weekly", priority: 1, alternates },
  ];
}
