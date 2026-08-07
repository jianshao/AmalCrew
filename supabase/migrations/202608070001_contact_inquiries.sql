create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 160),
  email text not null check (char_length(email) between 3 and 254),
  company text check (company is null or char_length(company) <= 160),
  team_size text check (team_size is null or char_length(team_size) <= 64),
  request_type text not null default 'PRODUCT_QUESTION' check (request_type in ('PRODUCT_QUESTION', 'PRICING', 'DEMO', 'SUPPORT')),
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ar')),
  message text not null check (char_length(message) between 10 and 2000),
  source_path text not null default '/contact' check (char_length(source_path) <= 200),
  referrer text check (referrer is null or char_length(referrer) <= 500),
  status text not null default 'NEW' check (status in ('NEW', 'CONTACTED', 'ARCHIVED')),
  telegram_notified_at timestamptz,
  notification_error text,
  created_at timestamptz not null default now()
);

create index contact_inquiries_created_at_idx on public.contact_inquiries(created_at desc);
create index contact_inquiries_email_created_at_idx on public.contact_inquiries(email, created_at desc);

alter table public.contact_inquiries enable row level security;

comment on table public.contact_inquiries is 'Private marketing and support enquiries submitted from the public AmalCrew contact pages.';
