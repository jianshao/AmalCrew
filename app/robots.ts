import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/en", "/ar", "/og.png"],
      disallow: ["/api/", "/auth/", "/dashboard", "/help", "/login", "/onboarding", "/projects", "/reports", "/settings", "/timesheets", "/workers"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
