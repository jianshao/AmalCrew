"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

const resourceRoutes = ["projects", "workers"];
const pricingPlans = new Set(["basic", "advanced", "professional"]);
const marketingLanguages = new Set(["en", "ar"]);

function redactAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);

  // Auth callbacks may contain one-time authorization codes and are not useful
  // as product analytics page views.
  if (url.pathname === "/auth/callback") return null;

  // Hobby Analytics does not support custom events. Pricing CTA arrivals are
  // therefore recorded as distinct, anonymous virtual page views so each plan
  // and marketing language can be compared in the Pages report.
  if (url.pathname === "/login" && url.searchParams.get("source") === "pricing") {
    const plan = url.searchParams.get("plan");
    const language = url.searchParams.get("lang");
    if (plan && language && pricingPlans.has(plan) && marketingLanguages.has(language)) {
      url.pathname = `/conversion/pricing/${language}/${plan}`;
    }
  }

  // Feedback, invitation and authentication values can appear in query strings.
  url.search = "";
  url.hash = "";

  for (const resource of resourceRoutes) {
    const pattern = new RegExp(`^/${resource}/[^/]+$`);
    if (pattern.test(url.pathname)) {
      url.pathname = `/${resource}/[id]`;
      break;
    }
  }

  return { ...event, url: url.toString() };
}

export function VercelAnalytics() {
  return <Analytics beforeSend={redactAnalyticsEvent} />;
}
