# Manual subscription operations

AmalCrew uses a manual subscription workflow during the MVP. Customers can view their plan in **Settings**, but only the AmalCrew operator changes subscription records in Supabase.

## Customer journey

1. A visitor selects a plan on the pricing page and submits the contact form.
2. The enquiry is saved in `contact_inquiries`; when `TELEGRAM_ADMIN_CHAT_ID` is configured, the operator also receives a Telegram alert.
3. The customer creates an organization and starts on the Basic trial, or the operator helps them do so.
4. After commercial terms and payment are confirmed offline, the operator sets the subscription to `ACTIVE` in Supabase.

## Find the organization

Run this in the Supabase SQL editor. Use the customer email and organization name to identify the correct row before changing anything.

```sql
select
  o.id as organization_id,
  o.name,
  u.email,
  m.user_id,
  s.plan,
  s.status,
  s.starts_at,
  s.ends_at
from public.organizations o
left join public.organization_members m on m.organization_id = o.id
left join auth.users u on u.id = m.user_id
left join public.organization_subscriptions s on s.organization_id = o.id
order by o.created_at desc;
```

## Activate or change a plan

Replace the UUID with the verified organization ID. Changing `plan` automatically applies the packaged limits: Basic (15 workers / 3 active projects), Advanced (50 / 10), Professional (150 / unlimited active projects).

```sql
update public.organization_subscriptions
set
  plan = 'ADVANCED',
  status = 'ACTIVE',
  starts_at = now(),
  ends_at = null,
  notes = 'Manual activation: invoice paid'
where organization_id = 'REPLACE-WITH-ORGANIZATION-UUID';
```

For a fixed-term subscription, set `ends_at` to the agreed ISO date/time. `notes` is internal only and should not contain card or bank details.

## Pause or cancel

```sql
update public.organization_subscriptions
set status = 'SUSPENDED', notes = 'Awaiting renewal confirmation'
where organization_id = 'REPLACE-WITH-ORGANIZATION-UUID';
```

`SUSPENDED` and `CANCELLED` prevent new active workers and projects. Existing records are retained for operational visibility. The application does not automatically collect payments, create invoices, or notify customers about an expiry; handle those steps through the agreed manual process.

## MVP guardrails

- Every newly created organization gets a Basic `TRIAL` subscription automatically.
- The database enforces active-worker and active-project limits, including workers approved through Telegram.
- Customers have read-only access to their own subscription record through RLS. Do not add a customer-facing update action for this table.
- Apply `202608070002_manual_subscriptions.sql` after the contact-inquiry migration. Regenerate Supabase TypeScript types if your normal schema workflow requires it.
