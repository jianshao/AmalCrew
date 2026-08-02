import "server-only";

import type { Json } from "@/lib/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTelegramConfig } from "@/lib/telegram-config";

type TelegramReplyMarkup = {
  inline_keyboard?: { text: string; callback_data?: string; url?: string }[][];
  keyboard?: ({ text: string; request_contact?: boolean } | string)[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  remove_keyboard?: boolean;
};

type TelegramMessageResult = { message_id: number };

export async function telegramRequest<T>(method: string, body: Record<string, unknown>) {
  const { botToken } = getTelegramConfig();
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const result = (await response.json()) as {
    ok: boolean;
    result?: T;
    description?: string;
    error_code?: number;
  };
  if (!response.ok || !result.ok || result.result === undefined) {
    throw new Error(result.description || `Telegram ${method} failed (${result.error_code || response.status}).`);
  }
  return result.result;
}

export function sendTelegramMessage(
  chatId: string,
  text: string,
  options?: { replyMarkup?: TelegramReplyMarkup; parseMode?: "HTML" },
) {
  return telegramRequest<TelegramMessageResult>("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options?.parseMode,
    reply_markup: options?.replyMarkup,
    disable_web_page_preview: true,
  });
}

export function answerTelegramCallback(callbackQueryId: string, text?: string) {
  return telegramRequest<boolean>("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

function jsonObject(value: Json): Record<string, Json> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};
}

function textValue(value: Json | undefined) {
  return typeof value === "string" ? value : "";
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

const labels = {
  en: {
    approved: "Timesheet approved",
    rejected: "Timesheet rejected",
    confirmation: "Timesheet changed — confirmation required",
    project: "Project",
    date: "Date",
    regular: "Regular",
    overtime: "Overtime",
    confirm: "Confirm hours",
    submit: "Submit timesheet",
    joined: "You have been approved and added to the project",
    joinRejected: "Your request to join the project was not approved",
  },
  ar: {
    approved: "تم اعتماد سجل الدوام",
    rejected: "تم رفض سجل الدوام",
    confirmation: "تم تعديل سجل الدوام — يرجى التأكيد",
    project: "المشروع",
    date: "التاريخ",
    regular: "الساعات العادية",
    overtime: "العمل الإضافي",
    confirm: "تأكيد الساعات",
    submit: "إرسال سجل الدوام",
    joined: "تمت الموافقة على انضمامك إلى المشروع",
    joinRejected: "لم تتم الموافقة على طلب انضمامك إلى المشروع",
  },
  ur: {
    approved: "ٹائم شیٹ منظور ہو گئی",
    rejected: "ٹائم شیٹ مسترد ہو گئی",
    confirmation: "ٹائم شیٹ تبدیل ہوئی — تصدیق درکار ہے",
    project: "پروجیکٹ",
    date: "تاریخ",
    regular: "عام وقت",
    overtime: "اوور ٹائم",
    confirm: "اوقات کی تصدیق",
    submit: "ٹائم شیٹ جمع کریں",
    joined: "آپ کو پروجیکٹ میں شامل کر لیا گیا ہے",
    joinRejected: "پروجیکٹ میں شامل ہونے کی درخواست منظور نہیں ہوئی",
  },
  hi: {
    approved: "टाइमशीट स्वीकृत हुई",
    rejected: "टाइमशीट अस्वीकृत हुई",
    confirmation: "टाइमशीट बदली गई — पुष्टि आवश्यक है",
    project: "प्रोजेक्ट",
    date: "तारीख",
    regular: "नियमित समय",
    overtime: "ओवरटाइम",
    confirm: "समय की पुष्टि करें",
    submit: "टाइमशीट जमा करें",
    joined: "आपको प्रोजेक्ट में शामिल कर लिया गया है",
    joinRejected: "प्रोजेक्ट में शामिल होने का अनुरोध स्वीकृत नहीं हुआ",
  },
} as const;

type SupportedLanguage = keyof typeof labels;

function supportedLanguage(language: string): SupportedLanguage {
  return language in labels ? (language as SupportedLanguage) : "en";
}

async function renderNotification(notification: {
  template_key: string;
  language: string;
  payload: Json;
  worker_id: string | null;
}) {
  let language = supportedLanguage(notification.language);
  if (notification.worker_id && notification.template_key.startsWith("timesheet.")) {
    const { data: worker } = await createAdminClient()
      .from("workers")
      .select("preferred_language")
      .eq("id", notification.worker_id)
      .maybeSingle();
    language = supportedLanguage(worker?.preferred_language || notification.language);
  }
  const label = labels[language];
  const payload = jsonObject(notification.payload);

  if (notification.template_key === "project.join_approved") {
    const projectName = escapeHtml(textValue(payload.project_name) || "Project");
    return {
      text: `<b>${label.joined}</b>\n\n${label.project}: ${projectName}`,
      replyMarkup: { inline_keyboard: [[{ text: label.submit, callback_data: "timesheet:new" }]] },
    };
  }

  if (notification.template_key === "project.join_rejected") {
    const projectName = escapeHtml(textValue(payload.project_name) || "Project");
    return {
      text: `<b>${label.joinRejected}</b>\n\n${label.project}: ${projectName}`,
    };
  }

  const timesheetId = textValue(payload.timesheet_id);
  if (!timesheetId) throw new Error("Timesheet notification is missing timesheet_id.");
  const admin = createAdminClient();
  const { data: timesheet, error } = await admin
    .from("timesheets")
    .select("id, project_id, work_date, regular_minutes, overtime_minutes, version")
    .eq("id", timesheetId)
    .single();
  if (error) throw error;
  const { data: project } = await admin.from("projects").select("name").eq("id", timesheet.project_id).single();
  const title = notification.template_key === "timesheet.rejected"
    ? label.rejected
    : notification.template_key === "timesheet.confirmation_required"
      ? label.confirmation
      : label.approved;
  const text = [
    `<b>${title}</b>`,
    "",
    `${label.project}: ${escapeHtml(project?.name || "Project")}`,
    `${label.date}: ${timesheet.work_date}`,
    `${label.regular}: ${formatHours(timesheet.regular_minutes)}`,
    `${label.overtime}: ${formatHours(timesheet.overtime_minutes)}`,
  ].join("\n");

  return {
    text,
    replyMarkup: notification.template_key === "timesheet.confirmation_required"
      ? {
          inline_keyboard: [[{
            text: label.confirm,
            callback_data: `timesheet:confirm:${timesheet.id}:${timesheet.version}`,
          }]],
        }
      : undefined,
  };
}

async function resolveNotificationChat(notification: {
  recipient_external_id: string | null;
  worker_id: string | null;
}) {
  if (notification.recipient_external_id) return notification.recipient_external_id;
  if (!notification.worker_id) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("worker_channel_identities")
    .select("external_chat_id")
    .eq("worker_id", notification.worker_id)
    .eq("channel", "TELEGRAM")
    .eq("is_enabled", true)
    .eq("is_verified", true)
    .maybeSingle();
  return data?.external_chat_id || null;
}

export async function dispatchPendingTelegramNotifications(options?: {
  organizationId?: string;
  notificationId?: string;
  limit?: number;
}) {
  const admin = createAdminClient();
  let query = admin
    .from("notifications")
    .select("*")
    .eq("channel", "TELEGRAM")
    .in("status", ["PENDING", "FAILED"])
    .lte("run_after", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(options?.limit ?? 20);
  if (options?.organizationId) query = query.eq("organization_id", options.organizationId);
  if (options?.notificationId) query = query.eq("id", options.notificationId);
  const { data: notifications, error } = await query;
  if (error) throw error;

  let sent = 0;
  let failed = 0;
  for (const notification of notifications ?? []) {
    const attempts = notification.attempts + 1;
    const { data: claimed } = await admin
      .from("notifications")
      .update({ status: "PROCESSING", attempts })
      .eq("id", notification.id)
      .in("status", ["PENDING", "FAILED"])
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    try {
      const chatId = await resolveNotificationChat(notification);
      if (!chatId) throw new Error("Worker has no verified Telegram chat.");
      const rendered = await renderNotification(notification);
      const message = await sendTelegramMessage(chatId, rendered.text, {
        parseMode: "HTML",
        replyMarkup: rendered.replyMarkup,
      });
      await admin.from("notifications").update({
        status: "SENT",
        provider_message_id: String(message.message_id),
        last_error: null,
        sent_at: new Date().toISOString(),
      }).eq("id", notification.id);
      sent += 1;
    } catch (notificationError) {
      const message = notificationError instanceof Error ? notificationError.message : "Unknown Telegram error";
      const retryMinutes = Math.min(60, 2 ** Math.min(attempts, 5));
      await admin.from("notifications").update({
        status: "FAILED",
        last_error: message.slice(0, 1000),
        run_after: new Date(Date.now() + retryMinutes * 60_000).toISOString(),
      }).eq("id", notification.id);
      failed += 1;
    }
  }
  return { processed: (notifications ?? []).length, sent, failed };
}
