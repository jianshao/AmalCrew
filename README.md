# AmalCrew Web

Next.js and Supabase application for AmalCrew workforce operations.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Supabase Auth, PostgreSQL, RLS and RPC
- Telegram Bot invitations, approvals and automatic notifications

## Local development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Without Supabase environment variables, the app runs in preview mode with
realistic sample data. Preview mode is intended only for product development.

## Connect Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Add the project URL and publishable key.
4. Apply both files in `supabase/migrations` using `supabase db push` or the
   dashboard SQL editor.
5. Add `http://localhost:3000/auth/callback` to the allowed Auth redirect URLs.

The browser uses the publishable key and all exposed tables are protected by
Row Level Security. Service-role and messaging credentials must remain
server-only.

## Connect Telegram

1. Open `@BotFather` in Telegram and run `/newbot`.
2. Add the returned token and bot username to `.env.local`.
3. Generate independent random values for `TELEGRAM_WEBHOOK_SECRET` and
   `CRON_SECRET`.
4. Deploy the application to an HTTPS URL.
5. Register the webhook, replacing the placeholders below:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://<APP_DOMAIN>/api/telegram/webhook","secret_token":"<WEBHOOK_SECRET>","allowed_updates":["message","callback_query"]}'
```

Verify registration:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

The project page can then generate a 30-day Telegram deep link and QR code.
Workers tap **Start**, choose a language, submit their details, and wait for a
supervisor decision. Approved workers can submit timesheets directly in the
bot. Approval, rejection and changed-hours confirmation are delivered by the
same bot.

`vercel.json` schedules an hourly retry for failed notifications. Vercel sends
`CRON_SECRET` as a bearer token; other hosts should call
`GET /api/telegram/dispatch` with the same authorization header.

## Validation

```bash
npm run lint
npm run build
```

## Main routes

- `/login`
- `/dashboard`
- `/projects`
- `/workers`
- `/timesheets`
- `/reports`
- `/settings`
