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
