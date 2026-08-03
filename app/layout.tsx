import type { Metadata } from "next";
import { headers } from "next/headers";
import { LocaleProvider } from "@/components/locale-provider";
import { VercelAnalytics } from "@/components/vercel-analytics";
import { isRtl } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host") || "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

  return {
    metadataBase,
    title: {
      default: "AmalCrew · Workforce operations",
      template: "%s · AmalCrew",
    },
    description:
      "Simple workforce time tracking and confirmation for GCC field service teams.",
    openGraph: {
      title: "AmalCrew",
      description: "Every hour. Clearly confirmed.",
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "AmalCrew workforce operations" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "AmalCrew",
      description: "Every hour. Clearly confirmed.",
      images: ["/og.png"],
    },
    verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"} className="h-full antialiased">
      <body className="min-h-full">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}
