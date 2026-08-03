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

To show a human Telegram contact on the English and Arabic marketing pages,
set `TELEGRAM_CONTACT_USERNAME` to the public username without `@` and
redeploy. Keep this separate from `TELEGRAM_BOT_USERNAME`: the former is for
sales/support conversations and the latter runs the worker workflow.

`vercel.json` schedules a daily retry for failed notifications so the project
can deploy on Vercel Hobby. Approval actions still attempt delivery immediately;
the scheduled job is only a fallback for pending or failed messages. Vercel sends
`CRON_SECRET` as a bearer token; Vercel Pro or another scheduler can call
`GET /api/telegram/dispatch` with the same authorization header.

## Validation

```bash
npm run lint
npm run build
```

## Main routes

- `/en` — English marketing site
- `/ar` — Arabic marketing site
- `/login`
- `/dashboard`
- `/projects`
- `/workers`
- `/timesheets`
- `/reports`
- `/settings`

The root URL permanently redirects to `/en`. Set `NEXT_PUBLIC_SITE_URL` to the
production origin so canonical URLs, hreflang entries, `robots.txt`, the
sitemap and structured data use the public domain.

For Google Search Console, DNS verification of the custom domain is preferred.
For URL-prefix verification, set `GOOGLE_SITE_VERIFICATION` to Google's meta-tag
content value (not the full `<meta>` tag), then redeploy.

## Vercel Web Analytics

Enable Web Analytics from the Vercel project dashboard, then redeploy. The
root layout includes `@vercel/analytics`; no additional environment variable is
required. Before page views are sent, query strings are removed, auth callbacks
are ignored, and project or worker record IDs are replaced with `[id]`.

Hobby deployments collect anonymous page views only. Custom conversion events
should be added after moving to a plan that supports them, and must never
include names, emails, phone numbers, invitation tokens or record IDs.

Pricing CTA arrivals are tracked on Hobby as anonymous virtual page views. In
the Analytics **Pages** report, use these paths to compare plan interest:

```text
/conversion/pricing/en/basic
/conversion/pricing/en/advanced
/conversion/pricing/en/professional
/conversion/pricing/ar/basic
/conversion/pricing/ar/advanced
/conversion/pricing/ar/professional
```

These are analytics-only paths; they are not public application routes. A page
view represents a visitor reaching signup from the corresponding pricing CTA.
