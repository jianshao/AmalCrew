create extension if not exists pgcrypto;

create type public.organization_role as enum ('OWNER', 'ADMIN', 'SUPERVISOR');
create type public.project_status as enum ('DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
create type public.worker_status as enum ('ACTIVE', 'INACTIVE');
create type public.channel_type as enum ('WHATSAPP', 'TELEGRAM');
create type public.timesheet_status as enum (
  'SUBMITTED',
  'APPROVED',
  'WORKER_CONFIRMATION_REQUIRED',
  'CONFIRMED',
  'REJECTED',
  'DISPUTED',
  'LOCKED'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  country_code text not null default 'AE' check (char_length(country_code) = 2),
  timezone text not null default 'Asia/Dubai',
  default_language text not null default 'en',
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  code text not null,
  location text,
  status public.project_status not null default 'DRAFT',
  supervisor_member_id uuid references public.organization_members(id) on delete set null,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.workers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 160),
  phone_number text,
  trade text,
  preferred_language text not null default 'en',
  status public.worker_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_workers (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (project_id, worker_id)
);

create table public.worker_channel_identities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  channel public.channel_type not null,
  external_user_id text,
  phone_number text,
  is_verified boolean not null default false,
  is_enabled boolean not null default true,
  is_preferred boolean not null default false,
  opted_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, channel, external_user_id),
  unique (worker_id, channel)
);

create unique index worker_one_preferred_channel_idx
  on public.worker_channel_identities(worker_id)
  where is_preferred and is_enabled;

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  channel public.channel_type not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.timesheets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  worker_id uuid not null references public.workers(id),
  project_id uuid not null references public.projects(id),
  work_date date not null,
  regular_minutes integer not null check (regular_minutes between 0 and 1440),
  overtime_minutes integer not null default 0 check (overtime_minutes between 0 and 1440),
  status public.timesheet_status not null default 'SUBMITTED',
  version integer not null default 1 check (version > 0),
  submitted_at timestamptz not null default now(),
  approved_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, worker_id, project_id, work_date)
);

create table public.timesheet_revisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  timesheet_id uuid not null references public.timesheets(id) on delete cascade,
  version integer not null,
  previous_regular_minutes integer,
  previous_overtime_minutes integer,
  regular_minutes integer not null,
  overtime_minutes integer not null,
  reason text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (timesheet_id, version)
);

create table public.timesheet_disputes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  timesheet_id uuid not null references public.timesheets(id) on delete cascade,
  worker_id uuid not null references public.workers(id),
  timesheet_version integer not null,
  reason text not null,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  resolution text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  channel public.channel_type not null,
  template_key text not null,
  language text not null default 'en',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'PENDING' check (status in ('PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED')),
  attempts integer not null default 0,
  run_after timestamptz not null default now(),
  provider_message_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  actor_worker_id uuid references public.workers(id),
  event_type text not null,
  resource_type text not null,
  resource_id uuid not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index organization_members_user_idx on public.organization_members(user_id, organization_id);
create index projects_org_status_idx on public.projects(organization_id, status);
create index workers_org_status_idx on public.workers(organization_id, status);
create index timesheets_org_date_status_idx on public.timesheets(organization_id, work_date desc, status);
create index timesheets_worker_date_idx on public.timesheets(worker_id, work_date desc);
create index notifications_pending_idx on public.notifications(status, run_after) where status in ('PENDING', 'FAILED');
create index audit_events_org_created_idx on public.audit_events(organization_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger workers_set_updated_at before update on public.workers for each row execute function public.set_updated_at();
create trigger worker_channels_set_updated_at before update on public.worker_channel_identities for each row execute function public.set_updated_at();
create trigger timesheets_set_updated_at before update on public.timesheets for each row execute function public.set_updated_at();
create trigger notifications_set_updated_at before update on public.notifications for each row execute function public.set_updated_at();

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_organization_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_manage_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_organization_id
      and m.user_id = (select auth.uid())
      and m.role in ('OWNER', 'ADMIN', 'SUPERVISOR')
  );
$$;

create or replace function public.can_admin_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_organization_id
      and m.user_id = (select auth.uid())
      and m.role in ('OWNER', 'ADMIN')
  );
$$;

revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.can_manage_organization(uuid) from public;
revoke all on function public.can_admin_organization(uuid) from public;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.can_manage_organization(uuid) to authenticated;
grant execute on function public.can_admin_organization(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.workers enable row level security;
alter table public.project_workers enable row level security;
alter table public.worker_channel_identities enable row level security;
alter table public.invites enable row level security;
alter table public.timesheets enable row level security;
alter table public.timesheet_revisions enable row level security;
alter table public.timesheet_disputes enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_events enable row level security;

create policy organizations_select on public.organizations for select to authenticated using (public.is_organization_member(id));
create policy organizations_update on public.organizations for update to authenticated using (public.can_admin_organization(id)) with check (public.can_admin_organization(id));
create policy members_select on public.organization_members for select to authenticated using (public.is_organization_member(organization_id));
create policy members_manage on public.organization_members for all to authenticated using (public.can_admin_organization(organization_id)) with check (public.can_admin_organization(organization_id));
create policy projects_select on public.projects for select to authenticated using (public.is_organization_member(organization_id));
create policy projects_manage on public.projects for all to authenticated using (public.can_manage_organization(organization_id)) with check (public.can_manage_organization(organization_id));
create policy workers_select on public.workers for select to authenticated using (public.is_organization_member(organization_id));
create policy workers_manage on public.workers for all to authenticated using (public.can_manage_organization(organization_id)) with check (public.can_manage_organization(organization_id));
create policy project_workers_select on public.project_workers for select to authenticated using (public.is_organization_member(organization_id));
create policy project_workers_manage on public.project_workers for all to authenticated using (public.can_manage_organization(organization_id)) with check (public.can_manage_organization(organization_id));
create policy worker_channels_select on public.worker_channel_identities for select to authenticated using (public.is_organization_member(organization_id));
create policy worker_channels_manage on public.worker_channel_identities for all to authenticated using (public.can_manage_organization(organization_id)) with check (public.can_manage_organization(organization_id));
create policy invites_manage on public.invites for all to authenticated using (public.can_manage_organization(organization_id)) with check (public.can_manage_organization(organization_id));
create policy timesheets_select on public.timesheets for select to authenticated using (public.is_organization_member(organization_id));
create policy timesheets_manage on public.timesheets for all to authenticated using (public.can_manage_organization(organization_id)) with check (public.can_manage_organization(organization_id));
create policy revisions_select on public.timesheet_revisions for select to authenticated using (public.is_organization_member(organization_id));
create policy revisions_insert on public.timesheet_revisions for insert to authenticated with check (public.can_manage_organization(organization_id));
create policy disputes_select on public.timesheet_disputes for select to authenticated using (public.is_organization_member(organization_id));
create policy disputes_manage on public.timesheet_disputes for all to authenticated using (public.can_manage_organization(organization_id)) with check (public.can_manage_organization(organization_id));
create policy notifications_select on public.notifications for select to authenticated using (public.is_organization_member(organization_id));
create policy notifications_insert on public.notifications for insert to authenticated with check (public.can_manage_organization(organization_id));
create policy audit_select on public.audit_events for select to authenticated using (public.is_organization_member(organization_id));
create policy audit_insert on public.audit_events for insert to authenticated with check (public.can_manage_organization(organization_id));

create or replace function public.create_organization(
  organization_name text,
  organization_country_code text default 'AE',
  organization_timezone text default 'Asia/Dubai'
)
returns public.organizations
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_organization public.organizations;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  insert into public.organizations (name, country_code, timezone)
  values (organization_name, organization_country_code, organization_timezone)
  returning * into new_organization;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_organization.id, auth.uid(), 'OWNER');

  return new_organization;
end;
$$;

revoke all on function public.create_organization(text, text, text) from public;
grant execute on function public.create_organization(text, text, text) to authenticated;

create or replace function public.approve_timesheet(
  target_timesheet_id uuid,
  expected_version integer,
  new_regular_minutes integer default null,
  new_overtime_minutes integer default null,
  change_reason text default null
)
returns public.timesheets
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_timesheet public.timesheets;
  approved_timesheet public.timesheets;
  notification_channel public.channel_type;
  next_regular integer;
  next_overtime integer;
  was_modified boolean;
begin
  select * into current_timesheet
  from public.timesheets
  where id = target_timesheet_id
  for update;

  if current_timesheet.id is null then
    raise exception 'TIMESHEET_NOT_FOUND';
  end if;
  if not public.can_manage_organization(current_timesheet.organization_id) then
    raise exception 'FORBIDDEN';
  end if;
  if current_timesheet.version <> expected_version then
    raise exception 'TIMESHEET_VERSION_CONFLICT';
  end if;
  if current_timesheet.status not in ('SUBMITTED', 'DISPUTED') then
    raise exception 'TIMESHEET_INVALID_STATE';
  end if;

  next_regular := coalesce(new_regular_minutes, current_timesheet.regular_minutes);
  next_overtime := coalesce(new_overtime_minutes, current_timesheet.overtime_minutes);
  was_modified := next_regular <> current_timesheet.regular_minutes
    or next_overtime <> current_timesheet.overtime_minutes;

  insert into public.timesheet_revisions (
    organization_id, timesheet_id, version,
    previous_regular_minutes, previous_overtime_minutes,
    regular_minutes, overtime_minutes, reason, changed_by
  ) values (
    current_timesheet.organization_id, current_timesheet.id, current_timesheet.version + 1,
    current_timesheet.regular_minutes, current_timesheet.overtime_minutes,
    next_regular, next_overtime, change_reason, auth.uid()
  );

  update public.timesheets
  set regular_minutes = next_regular,
      overtime_minutes = next_overtime,
      status = case when was_modified then 'WORKER_CONFIRMATION_REQUIRED'::public.timesheet_status else 'APPROVED'::public.timesheet_status end,
      version = version + 1,
      approved_at = now()
  where id = current_timesheet.id
  returning * into approved_timesheet;

  insert into public.audit_events (
    organization_id, actor_user_id, event_type, resource_type, resource_id, data
  ) values (
    current_timesheet.organization_id, auth.uid(),
    case when was_modified then 'TIMESHEET_MODIFIED' else 'TIMESHEET_APPROVED' end,
    'timesheet', current_timesheet.id,
    jsonb_build_object('previous_version', current_timesheet.version, 'version', approved_timesheet.version)
  );

  select channel into notification_channel
  from public.worker_channel_identities
  where worker_id = current_timesheet.worker_id and is_enabled and is_verified
  order by is_preferred desc, created_at asc
  limit 1;

  if notification_channel is not null then
    insert into public.notifications (
      organization_id, worker_id, channel, template_key, payload
    ) values (
      current_timesheet.organization_id, current_timesheet.worker_id, notification_channel,
      case when was_modified then 'timesheet.confirmation_required' else 'timesheet.approved' end,
      jsonb_build_object('timesheet_id', current_timesheet.id, 'version', approved_timesheet.version)
    );
  end if;

  return approved_timesheet;
end;
$$;

revoke all on function public.approve_timesheet(uuid, integer, integer, integer, text) from public;
grant execute on function public.approve_timesheet(uuid, integer, integer, integer, text) to authenticated;
