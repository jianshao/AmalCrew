export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const value = configured || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return value.replace(/\/$/, "");
}
