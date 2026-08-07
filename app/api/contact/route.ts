import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import { getTelegramAdminChatId } from "@/lib/telegram-config";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

const requestTypes = new Set(["PRODUCT_QUESTION", "PRICING", "DEMO", "SUPPORT"]);
const languages = new Set(["en", "ar"]);
const plans = new Set(["BASIC", "ADVANCED", "PROFESSIONAL"]);

function value(input: unknown, maxLength: number) {
  return typeof input === "string" ? input.trim().slice(0, maxLength) : "";
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(input: string) {
  return input.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function originIsAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(getSiteUrl()).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!originIsAllowed(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // A hidden field that real visitors never fill in. Return success to avoid helping bots tune their requests.
  if (value(body.website, 200)) return Response.json({ ok: true });

  const fullName = value(body.fullName, 160);
  const email = value(body.email, 254).toLowerCase();
  const company = value(body.company, 160) || null;
  const teamSize = value(body.teamSize, 64) || null;
  const requestType = value(body.requestType, 32) || "PRODUCT_QUESTION";
  const selectedPlan = value(body.selectedPlan, 32).toUpperCase() || null;
  const preferredLanguage = value(body.preferredLanguage || body.language, 8) || "en";
  const message = value(body.message, 2000);
  const sourcePath = value(body.sourcePath, 200) || "/contact";
  const referrer = value(body.referrer, 500) || null;

  if (fullName.length < 2 || !validEmail(email) || message.length < 10 || !requestTypes.has(requestType) || !languages.has(preferredLanguage) || (selectedPlan && !plans.has(selectedPlan))) {
    return Response.json({ error: "Please complete the required fields." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return Response.json({ error: "Contact service is not configured." }, { status: 503 });
  }

  const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await admin
    .from("contact_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", lastDay);
  if (countError) return Response.json({ error: "Unable to submit request." }, { status: 500 });
  if ((count ?? 0) >= 3) return Response.json({ error: "Please try again tomorrow, or contact us on Telegram." }, { status: 429 });

  const { data: inquiry, error: insertError } = await admin
    .from("contact_inquiries")
    .insert({
      full_name: fullName,
      email,
      company,
      team_size: teamSize,
      request_type: requestType,
      selected_plan: selectedPlan,
      preferred_language: preferredLanguage,
      message,
      source_path: sourcePath,
      referrer,
    })
    .select("id")
    .single();
  if (insertError || !inquiry) return Response.json({ error: "Unable to submit request." }, { status: 500 });

  const adminChatId = getTelegramAdminChatId();
  if (adminChatId) {
    const notification = [
      "<b>New AmalCrew website enquiry</b>",
      "",
      `<b>Name:</b> ${escapeHtml(fullName)}`,
      `<b>Email:</b> ${escapeHtml(email)}`,
      company ? `<b>Company:</b> ${escapeHtml(company)}` : null,
      teamSize ? `<b>Active workers:</b> ${escapeHtml(teamSize)}` : null,
      `<b>Request:</b> ${escapeHtml(requestType.replaceAll("_", " "))}`,
      selectedPlan ? `<b>Selected plan:</b> ${escapeHtml(selectedPlan)}` : null,
      `<b>Reply language:</b> ${escapeHtml(preferredLanguage)}`,
      `<b>Source:</b> ${escapeHtml(sourcePath)}`,
      "",
      `<b>Message:</b>\n${escapeHtml(message)}`,
    ].filter(Boolean).join("\n");

    try {
      await sendTelegramMessage(adminChatId, notification, { parseMode: "HTML" });
      await admin.from("contact_inquiries").update({ telegram_notified_at: new Date().toISOString() }).eq("id", inquiry.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Telegram notification failed";
      await admin.from("contact_inquiries").update({ notification_error: errorMessage.slice(0, 500) }).eq("id", inquiry.id);
    }
  }

  return Response.json({ ok: true }, { status: 201 });
}
