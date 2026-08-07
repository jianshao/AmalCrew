import "server-only";

export function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  if (!webhookSecret) throw new Error("TELEGRAM_WEBHOOK_SECRET is not configured.");

  return {
    botToken,
    webhookSecret,
    botUsername: process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "") || null,
  };
}

export function getTelegramBotUsername() {
  return process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "") || null;
}

export function getTelegramContactUsername() {
  const username = process.env.TELEGRAM_CONTACT_USERNAME?.trim().replace(/^@/, "") || "";
  return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(username) ? username : null;
}

export function getTelegramAdminChatId() {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim() || "";
  return /^-?\d+$/.test(chatId) ? chatId : null;
}
