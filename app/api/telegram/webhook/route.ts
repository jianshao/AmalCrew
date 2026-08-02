import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram-bot";
import { getTelegramConfig } from "@/lib/telegram-config";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { webhookSecret } = getTelegramConfig();
  if (request.headers.get("x-telegram-bot-api-secret-token") !== webhookSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const update = await request.json() as TelegramUpdate;
  const admin = createAdminClient();
  const { error: claimError } = await admin.from("telegram_updates").insert({
    update_id: update.update_id,
    status: "PROCESSING",
  });
  if (claimError?.code === "23505") {
    const { data: existing, error: readError } = await admin.from("telegram_updates").select("status, attempts, updated_at").eq("update_id", update.update_id).single();
    if (readError || !existing) throw readError || new Error("Unable to load Telegram update claim.");
    if (existing.status === "COMPLETED") return Response.json({ ok: true, duplicate: true });
    const recentlyClaimed = existing.status === "PROCESSING" && Date.now() - new Date(existing.updated_at).getTime() < 5 * 60_000;
    if (recentlyClaimed) return Response.json({ ok: true, processing: true });
    await admin.from("telegram_updates").update({
      status: "PROCESSING",
      attempts: existing.attempts + 1,
      last_error: null,
    }).eq("update_id", update.update_id);
  } else if (claimError) {
    throw claimError;
  }
  try {
    await handleTelegramUpdate(update);
    await admin.from("telegram_updates").update({
      status: "COMPLETED",
      processed_at: new Date().toISOString(),
      last_error: null,
    }).eq("update_id", update.update_id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error";
    await admin.from("telegram_updates").update({ status: "FAILED", last_error: message.slice(0, 1000) }).eq("update_id", update.update_id);
    throw error;
  }
}
