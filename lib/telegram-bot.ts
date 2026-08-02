import "server-only";

import { createHash } from "node:crypto";
import type { Json } from "@/lib/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { answerTelegramCallback, sendTelegramMessage } from "@/lib/telegram";

type TelegramUser = { id: number; username?: string; first_name?: string; last_name?: string };
type TelegramMessage = {
  chat: { id: number; type: string };
  from?: TelegramUser;
  text?: string;
  contact?: { phone_number: string; user_id?: number };
};
type TelegramCallback = {
  id: string;
  from: TelegramUser;
  data?: string;
  message?: TelegramMessage;
};
export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallback;
};

type SessionData = Record<string, Json>;
type Language = "en" | "ar" | "ur" | "hi";

const copy = {
  en: {
    language: "Choose your preferred language.",
    name: "Please enter your full name.",
    phone: "Share your mobile number or type it below.",
    trade: "What is your trade or job role? For example: Electrician.",
    submitted: "Your request was submitted. The project supervisor will review it.",
    invalidInvite: "This invitation is invalid, expired or has been revoked.",
    alreadyPending: "Your request is already waiting for supervisor approval.",
    alreadyMember: "You are already a member of this project.",
    noMembership: "No active AmalCrew project is connected to this Telegram account.",
    chooseProject: "Choose the project for this timesheet.",
    workDate: "Enter the work date as YYYY-MM-DD, or send today.",
    regular: "Enter regular hours, for example 8 or 7.5.",
    overtime: "Enter overtime hours, or 0 if none.",
    confirmSubmission: "Submit this timesheet?",
    timesheetSubmitted: "Timesheet submitted for supervisor approval.",
    duplicateTimesheet: "A timesheet already exists for that project and date.",
    invalidValue: "That value is not valid. Please try again.",
    cancelled: "Current action cancelled.",
    confirmed: "Hours confirmed. Thank you.",
    unavailable: "This action is no longer available.",
    submit: "Submit timesheet",
    cancel: "Cancel",
    confirm: "Confirm & submit",
  },
  ar: {
    language: "اختر لغتك المفضلة.", name: "يرجى إدخال الاسم الكامل.", phone: "شارك رقم هاتفك أو اكتبه أدناه.",
    trade: "ما هي مهنتك؟ مثال: كهربائي.", submitted: "تم إرسال طلبك وسيقوم مشرف المشروع بمراجعته.",
    invalidInvite: "الدعوة غير صالحة أو منتهية أو ملغاة.", alreadyPending: "طلبك بانتظار موافقة المشرف.", alreadyMember: "أنت عضو بالفعل في هذا المشروع.",
    noMembership: "لا يوجد مشروع AmalCrew مرتبط بهذا الحساب.", chooseProject: "اختر مشروع سجل الدوام.", workDate: "أدخل التاريخ YYYY-MM-DD أو أرسل today.",
    regular: "أدخل الساعات العادية، مثال 8 أو 7.5.", overtime: "أدخل ساعات العمل الإضافي أو 0.", confirmSubmission: "إرسال سجل الدوام؟",
    timesheetSubmitted: "تم إرسال سجل الدوام للموافقة.", duplicateTimesheet: "يوجد سجل دوام لهذا المشروع والتاريخ.", invalidValue: "القيمة غير صالحة. حاول مرة أخرى.",
    cancelled: "تم إلغاء الإجراء.", confirmed: "تم تأكيد الساعات. شكراً.", unavailable: "هذا الإجراء لم يعد متاحاً.", submit: "إرسال سجل الدوام", cancel: "إلغاء", confirm: "تأكيد وإرسال",
  },
  ur: {
    language: "اپنی پسندیدہ زبان منتخب کریں۔", name: "اپنا پورا نام درج کریں۔", phone: "اپنا موبائل نمبر شیئر کریں یا نیچے لکھیں۔",
    trade: "آپ کا کام کیا ہے؟ مثال: الیکٹریشن۔", submitted: "آپ کی درخواست جمع ہو گئی ہے۔ سپروائزر اس کا جائزہ لے گا۔",
    invalidInvite: "یہ دعوت غلط، ختم یا منسوخ ہو چکی ہے۔", alreadyPending: "آپ کی درخواست منظوری کی منتظر ہے۔", alreadyMember: "آپ پہلے ہی اس پروجیکٹ کے رکن ہیں۔",
    noMembership: "اس اکاؤنٹ سے کوئی AmalCrew پروجیکٹ منسلک نہیں۔", chooseProject: "ٹائم شیٹ کے لیے پروجیکٹ منتخب کریں۔", workDate: "تاریخ YYYY-MM-DD لکھیں یا today بھیجیں۔",
    regular: "عام گھنٹے درج کریں، مثال 8 یا 7.5۔", overtime: "اوور ٹائم گھنٹے درج کریں، یا 0۔", confirmSubmission: "ٹائم شیٹ جمع کریں؟",
    timesheetSubmitted: "ٹائم شیٹ منظوری کے لیے جمع ہو گئی۔", duplicateTimesheet: "اس تاریخ کی ٹائم شیٹ پہلے سے موجود ہے۔", invalidValue: "درست قدر درج کریں۔",
    cancelled: "عمل منسوخ ہو گیا۔", confirmed: "اوقات کی تصدیق ہو گئی۔ شکریہ۔", unavailable: "یہ عمل اب دستیاب نہیں۔", submit: "ٹائم شیٹ جمع کریں", cancel: "منسوخ", confirm: "تصدیق اور جمع",
  },
  hi: {
    language: "अपनी पसंदीदा भाषा चुनें।", name: "अपना पूरा नाम दर्ज करें।", phone: "अपना मोबाइल नंबर साझा करें या नीचे लिखें।",
    trade: "आपका काम क्या है? उदाहरण: Electrician.", submitted: "आपका अनुरोध जमा हो गया है। सुपरवाइज़र इसकी समीक्षा करेगा।",
    invalidInvite: "यह आमंत्रण अमान्य, समाप्त या रद्द है।", alreadyPending: "आपका अनुरोध स्वीकृति की प्रतीक्षा में है।", alreadyMember: "आप पहले से इस प्रोजेक्ट के सदस्य हैं।",
    noMembership: "इस Telegram खाते से कोई AmalCrew प्रोजेक्ट जुड़ा नहीं है।", chooseProject: "टाइमशीट का प्रोजेक्ट चुनें।", workDate: "तारीख YYYY-MM-DD में लिखें या today भेजें।",
    regular: "नियमित घंटे लिखें, जैसे 8 या 7.5।", overtime: "ओवरटाइम घंटे लिखें, या 0।", confirmSubmission: "टाइमशीट जमा करें?",
    timesheetSubmitted: "टाइमशीट स्वीकृति के लिए जमा हुई।", duplicateTimesheet: "इस प्रोजेक्ट और तारीख की टाइमशीट पहले से मौजूद है।", invalidValue: "मान सही नहीं है। फिर प्रयास करें।",
    cancelled: "वर्तमान कार्य रद्द किया गया।", confirmed: "समय की पुष्टि हुई। धन्यवाद।", unavailable: "यह कार्य अब उपलब्ध नहीं है।", submit: "टाइमशीट जमा करें", cancel: "रद्द करें", confirm: "पुष्टि और जमा",
  },
} satisfies Record<Language, Record<string, string>>;

function languageOf(value: unknown): Language {
  return value === "ar" || value === "ur" || value === "hi" ? value : "en";
}

function objectData(value: Json): SessionData {
  return value && typeof value === "object" && !Array.isArray(value) ? value as SessionData : {};
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function telegramName(user: TelegramUser) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
}

function parseHours(value: string) {
  const hours = Number(value.trim());
  if (!Number.isFinite(hours) || hours < 0 || hours > 24) return null;
  return Math.round(hours * 60);
}

function dateInTimeZone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function getWorkerLanguage(telegramUserId: string) {
  const admin = createAdminClient();
  const { data: identity } = await admin
    .from("worker_channel_identities")
    .select("worker_id")
    .eq("channel", "TELEGRAM")
    .eq("external_user_id", telegramUserId)
    .eq("is_enabled", true)
    .limit(1)
    .maybeSingle();
  if (!identity) return "en" as Language;
  const { data: worker } = await admin.from("workers").select("preferred_language").eq("id", identity.worker_id).maybeSingle();
  return languageOf(worker?.preferred_language);
}

async function beginJoin(chatId: string, user: TelegramUser, token: string) {
  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("project_invites")
    .select("id, organization_id, project_id, expires_at, revoked_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!invite || invite.revoked_at || new Date(invite.expires_at) <= new Date()) {
    await sendTelegramMessage(chatId, copy.en.invalidInvite);
    return;
  }

  const { data: existing } = await admin
    .from("project_join_requests")
    .select("status")
    .eq("project_id", invite.project_id)
    .eq("telegram_user_id", String(user.id))
    .maybeSingle();
  if (existing?.status === "APPROVED") {
    await sendTelegramMessage(chatId, copy.en.alreadyMember, { replyMarkup: { inline_keyboard: [[{ text: copy.en.submit, callback_data: "timesheet:new" }]] } });
    return;
  }
  if (existing?.status === "PENDING") {
    await sendTelegramMessage(chatId, copy.en.alreadyPending);
    return;
  }

  await admin.from("telegram_sessions").upsert({
    chat_id: chatId,
    telegram_user_id: String(user.id),
    invite_id: invite.id,
    project_id: invite.project_id,
    worker_id: null,
    step: "JOIN_LANGUAGE",
    data: { telegram_username: user.username || null, suggested_name: telegramName(user) },
    expires_at: new Date(Date.now() + 60 * 60_000).toISOString(),
  });
  await sendTelegramMessage(chatId, copy.en.language, {
    replyMarkup: { inline_keyboard: [[
      { text: "English", callback_data: "join:lang:en" },
      { text: "العربية", callback_data: "join:lang:ar" },
    ], [
      { text: "اردو", callback_data: "join:lang:ur" },
      { text: "हिन्दी", callback_data: "join:lang:hi" },
    ]] },
  });
}

async function continueJoin(chatId: string, text: string, contactPhone?: string) {
  const admin = createAdminClient();
  const { data: session } = await admin.from("telegram_sessions").select("*").eq("chat_id", chatId).maybeSingle();
  if (!session || !session.step.startsWith("JOIN_")) return false;
  const data = objectData(session.data);
  const language = languageOf(data.language);
  const t = copy[language];

  if (session.step === "JOIN_NAME") {
    const fullName = text.trim();
    if (fullName.length < 2 || fullName.length > 160) {
      await sendTelegramMessage(chatId, t.invalidValue);
      return true;
    }
    await admin.from("telegram_sessions").update({ step: "JOIN_PHONE", data: { ...data, full_name: fullName } }).eq("chat_id", chatId);
    await sendTelegramMessage(chatId, t.phone, { replyMarkup: { keyboard: [[{ text: "Share mobile number", request_contact: true }]], resize_keyboard: true, one_time_keyboard: true } });
    return true;
  }

  if (session.step === "JOIN_PHONE") {
    const phone = (contactPhone || text).trim();
    if (!/^\+?[0-9 ()-]{7,24}$/.test(phone)) {
      await sendTelegramMessage(chatId, t.invalidValue);
      return true;
    }
    await admin.from("telegram_sessions").update({ step: "JOIN_TRADE", data: { ...data, phone_number: phone } }).eq("chat_id", chatId);
    await sendTelegramMessage(chatId, t.trade, { replyMarkup: { remove_keyboard: true } });
    return true;
  }

  if (session.step === "JOIN_TRADE") {
    const trade = text.trim();
    if (trade.length < 2 || trade.length > 100 || !session.invite_id || !session.project_id) {
      await sendTelegramMessage(chatId, t.invalidValue);
      return true;
    }
    const { data: invite } = await admin.from("project_invites").select("organization_id, expires_at, revoked_at").eq("id", session.invite_id).maybeSingle();
    if (!invite || invite.revoked_at || new Date(invite.expires_at) <= new Date()) {
      await admin.from("telegram_sessions").delete().eq("chat_id", chatId);
      await sendTelegramMessage(chatId, t.invalidInvite);
      return true;
    }
    const { error } = await admin.from("project_join_requests").upsert({
      organization_id: invite.organization_id,
      project_id: session.project_id,
      invite_id: session.invite_id,
      telegram_user_id: session.telegram_user_id,
      telegram_chat_id: chatId,
      telegram_username: typeof data.telegram_username === "string" ? data.telegram_username : null,
      full_name: String(data.full_name || ""),
      phone_number: String(data.phone_number || ""),
      trade,
      preferred_language: language,
      status: "PENDING",
      worker_id: null,
      reviewed_at: null,
      reviewed_by: null,
    }, { onConflict: "project_id,telegram_user_id" });
    if (error) throw error;
    await admin.from("telegram_sessions").delete().eq("chat_id", chatId);
    await sendTelegramMessage(chatId, t.submitted);
    return true;
  }
  return true;
}

async function beginTimesheet(chatId: string, telegramUserId: string) {
  const admin = createAdminClient();
  const language = await getWorkerLanguage(telegramUserId);
  const t = copy[language];
  const { data: identities } = await admin
    .from("worker_channel_identities")
    .select("worker_id")
    .eq("channel", "TELEGRAM")
    .eq("external_user_id", telegramUserId)
    .eq("is_enabled", true)
    .eq("is_verified", true);
  const workerIds = (identities ?? []).map((item) => item.worker_id);
  if (!workerIds.length) {
    await sendTelegramMessage(chatId, t.noMembership);
    return;
  }
  const { data: assignments } = await admin
    .from("project_workers")
    .select("project_id, worker_id")
    .in("worker_id", workerIds);
  if (!assignments?.length) {
    await sendTelegramMessage(chatId, t.noMembership);
    return;
  }
  const projectIds = [...new Set(assignments.map((item) => item.project_id))];
  const { data: projects } = await admin.from("projects").select("id, name, status").in("id", projectIds).in("status", ["ACTIVE", "ON_HOLD"]);
  const available = (projects ?? []).map((project) => ({
    ...project,
    workerId: assignments.find((item) => item.project_id === project.id)!.worker_id,
  }));
  if (!available.length) {
    await sendTelegramMessage(chatId, t.noMembership);
    return;
  }
  if (available.length > 1) {
    await sendTelegramMessage(chatId, t.chooseProject, {
      replyMarkup: { inline_keyboard: available.map((project) => [{ text: project.name, callback_data: `timesheet:project:${project.id}` }]) },
    });
    return;
  }
  await startTimesheetSession(chatId, telegramUserId, available[0].workerId, available[0].id, language);
}

async function startTimesheetSession(chatId: string, telegramUserId: string, workerId: string, projectId: string, language: Language) {
  const admin = createAdminClient();
  await admin.from("telegram_sessions").upsert({
    chat_id: chatId,
    telegram_user_id: telegramUserId,
    worker_id: workerId,
    project_id: projectId,
    invite_id: null,
    step: "TS_DATE",
    data: { language },
    expires_at: new Date(Date.now() + 60 * 60_000).toISOString(),
  });
  await sendTelegramMessage(chatId, copy[language].workDate);
}

async function continueTimesheet(chatId: string, text: string) {
  const admin = createAdminClient();
  const { data: session } = await admin.from("telegram_sessions").select("*").eq("chat_id", chatId).maybeSingle();
  if (!session || !session.step.startsWith("TS_")) return false;
  const data = objectData(session.data);
  const language = languageOf(data.language);
  const t = copy[language];

  if (session.step === "TS_DATE") {
    const { data: worker } = session.worker_id
      ? await admin.from("workers").select("organization_id").eq("id", session.worker_id).maybeSingle()
      : { data: null };
    const { data: organization } = worker
      ? await admin.from("organizations").select("timezone").eq("id", worker.organization_id).maybeSingle()
      : { data: null };
    const today = dateInTimeZone(organization?.timezone || "Asia/Dubai");
    const workDate = text.trim().toLowerCase() === "today" ? today : text.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate) || Number.isNaN(Date.parse(`${workDate}T00:00:00Z`)) || workDate > today) {
      await sendTelegramMessage(chatId, t.invalidValue);
      return true;
    }
    await admin.from("telegram_sessions").update({ step: "TS_REGULAR", data: { ...data, work_date: workDate } }).eq("chat_id", chatId);
    await sendTelegramMessage(chatId, t.regular);
    return true;
  }
  if (session.step === "TS_REGULAR") {
    const minutes = parseHours(text);
    if (minutes === null) { await sendTelegramMessage(chatId, t.invalidValue); return true; }
    await admin.from("telegram_sessions").update({ step: "TS_OVERTIME", data: { ...data, regular_minutes: minutes } }).eq("chat_id", chatId);
    await sendTelegramMessage(chatId, t.overtime);
    return true;
  }
  if (session.step === "TS_OVERTIME") {
    const minutes = parseHours(text);
    if (minutes === null || Number(data.regular_minutes) + minutes > 1440) { await sendTelegramMessage(chatId, t.invalidValue); return true; }
    const nextData = { ...data, overtime_minutes: minutes };
    await admin.from("telegram_sessions").update({ step: "TS_CONFIRM", data: nextData }).eq("chat_id", chatId);
    await sendTelegramMessage(chatId, `${t.confirmSubmission}\n\n${data.work_date} · ${Number(data.regular_minutes) / 60}h + ${minutes / 60}h OT`, {
      replyMarkup: { inline_keyboard: [[{ text: t.confirm, callback_data: "timesheet:save" }, { text: t.cancel, callback_data: "action:cancel" }]] },
    });
    return true;
  }
  await sendTelegramMessage(chatId, t.invalidValue);
  return true;
}

async function saveTimesheet(chatId: string, telegramUserId: string) {
  const admin = createAdminClient();
  const { data: session } = await admin.from("telegram_sessions").select("*").eq("chat_id", chatId).eq("telegram_user_id", telegramUserId).maybeSingle();
  if (!session || session.step !== "TS_CONFIRM" || !session.worker_id || !session.project_id) return false;
  const data = objectData(session.data);
  const language = languageOf(data.language);
  const { data: worker, error: workerError } = await admin.from("workers").select("organization_id").eq("id", session.worker_id).single();
  if (workerError || !worker) throw workerError || new Error("Worker not found.");
  const { error } = await admin.from("timesheets").insert({
    organization_id: worker.organization_id,
    worker_id: session.worker_id,
    project_id: session.project_id,
    work_date: String(data.work_date),
    regular_minutes: Number(data.regular_minutes),
    overtime_minutes: Number(data.overtime_minutes),
    status: "SUBMITTED",
  });
  if (error?.code === "23505") {
    await sendTelegramMessage(chatId, copy[language].duplicateTimesheet);
    return true;
  }
  if (error) throw error;
  await admin.from("telegram_sessions").delete().eq("chat_id", chatId);
  await sendTelegramMessage(chatId, copy[language].timesheetSubmitted, {
    replyMarkup: { inline_keyboard: [[{ text: copy[language].submit, callback_data: "timesheet:new" }]] },
  });
  return true;
}

async function confirmTimesheet(chatId: string, telegramUserId: string, timesheetId: string, version: number) {
  const admin = createAdminClient();
  const language = await getWorkerLanguage(telegramUserId);
  const { data: identities } = await admin.from("worker_channel_identities").select("worker_id").eq("external_user_id", telegramUserId).eq("channel", "TELEGRAM");
  const workerIds = (identities ?? []).map((identity) => identity.worker_id);
  if (!workerIds.length) return false;
  const { data: updated } = await admin.from("timesheets").update({ status: "CONFIRMED", confirmed_at: new Date().toISOString() })
    .eq("id", timesheetId).in("worker_id", workerIds).eq("version", version).eq("status", "WORKER_CONFIRMATION_REQUIRED").select("id").maybeSingle();
  if (!updated) return false;
  await sendTelegramMessage(chatId, copy[language].confirmed);
  return true;
}

async function handleCallback(callback: TelegramCallback) {
  const chatId = callback.message ? String(callback.message.chat.id) : null;
  const data = callback.data || "";
  if (!chatId) { await answerTelegramCallback(callback.id); return; }

  if (data.startsWith("join:lang:")) {
    const language = languageOf(data.slice("join:lang:".length));
    const admin = createAdminClient();
    const { data: session } = await admin.from("telegram_sessions").select("data, step").eq("chat_id", chatId).maybeSingle();
    if (!session || session.step !== "JOIN_LANGUAGE") { await answerTelegramCallback(callback.id, copy[language].unavailable); return; }
    await admin.from("telegram_sessions").update({ step: "JOIN_NAME", data: { ...objectData(session.data), language } }).eq("chat_id", chatId);
    await answerTelegramCallback(callback.id);
    await sendTelegramMessage(chatId, copy[language].name);
    return;
  }
  if (data === "timesheet:new") {
    await answerTelegramCallback(callback.id);
    await beginTimesheet(chatId, String(callback.from.id));
    return;
  }
  if (data.startsWith("timesheet:project:")) {
    const projectId = data.slice("timesheet:project:".length);
    const admin = createAdminClient();
    const { data: identities } = await admin.from("worker_channel_identities").select("worker_id").eq("external_user_id", String(callback.from.id)).eq("channel", "TELEGRAM").eq("is_verified", true);
    const workerIds = (identities ?? []).map((identity) => identity.worker_id);
    const { data: assignment } = workerIds.length ? await admin.from("project_workers").select("worker_id").eq("project_id", projectId).in("worker_id", workerIds).maybeSingle() : { data: null };
    const language = await getWorkerLanguage(String(callback.from.id));
    if (!assignment) { await answerTelegramCallback(callback.id, copy[language].unavailable); return; }
    await answerTelegramCallback(callback.id);
    await startTimesheetSession(chatId, String(callback.from.id), assignment.worker_id, projectId, language);
    return;
  }
  if (data === "timesheet:save") {
    const saved = await saveTimesheet(chatId, String(callback.from.id));
    await answerTelegramCallback(callback.id, saved ? undefined : copy.en.unavailable);
    return;
  }
  if (data.startsWith("timesheet:confirm:")) {
    const [, , timesheetId, versionText] = data.split(":");
    const confirmed = await confirmTimesheet(chatId, String(callback.from.id), timesheetId, Number(versionText));
    await answerTelegramCallback(callback.id, confirmed ? undefined : copy.en.unavailable);
    return;
  }
  if (data === "action:cancel") {
    const language = await getWorkerLanguage(String(callback.from.id));
    await createAdminClient().from("telegram_sessions").delete().eq("chat_id", chatId);
    await answerTelegramCallback(callback.id);
    await sendTelegramMessage(chatId, copy[language].cancelled);
    return;
  }
  await answerTelegramCallback(callback.id);
}

async function handleMessage(message: TelegramMessage) {
  if (message.chat.type !== "private" || !message.from) return;
  const chatId = String(message.chat.id);
  const text = message.text?.trim() || "";
  if (text === "/cancel") {
    const language = await getWorkerLanguage(String(message.from.id));
    await createAdminClient().from("telegram_sessions").delete().eq("chat_id", chatId);
    await sendTelegramMessage(chatId, copy[language].cancelled, { replyMarkup: { remove_keyboard: true } });
    return;
  }
  if (text.startsWith("/start")) {
    const token = text.split(/\s+/, 2)[1];
    if (token) await beginJoin(chatId, message.from, token);
    else await beginTimesheet(chatId, String(message.from.id));
    return;
  }
  if (text === "/timesheet") {
    await beginTimesheet(chatId, String(message.from.id));
    return;
  }
  const contactPhone = message.contact && (!message.contact.user_id || message.contact.user_id === message.from.id)
    ? message.contact.phone_number
    : undefined;
  if (await continueJoin(chatId, text, contactPhone)) return;
  if (await continueTimesheet(chatId, text)) return;
  const language = await getWorkerLanguage(String(message.from.id));
  await sendTelegramMessage(chatId, copy[language].noMembership);
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.callback_query) await handleCallback(update.callback_query);
  else if (update.message) await handleMessage(update.message);
}
