import { dispatchPendingTelegramNotifications } from "@/lib/telegram";

export const runtime = "nodejs";

async function dispatch(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json(await dispatchPendingTelegramNotifications({ limit: 50 }));
}

export const GET = dispatch;
export const POST = dispatch;
