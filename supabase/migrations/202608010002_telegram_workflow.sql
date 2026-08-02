create type public.join_request_status as enum ('PENDING', 'APPROVED', 'REJECTED');

alter table public.worker_channel_identities
  add column external_chat_id text;

alter table public.notifications
  alter column worker_id drop not null,
  add column recipient_external_id text;

update public.worker_channel_identities
set is_enabled = false, is_preferred = false
where channel = 'WHATSAPP';

update public.notifications
set status = 'CANCELLED', last_error = 'WhatsApp disabled for Telegram MVP'
where channel = 'WHATSAPP' and status in ('PENDING', 'FAILED', 'PROCESSING');

create table public.project_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.project_join_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  invite_id uuid not null references public.project_invites(id) on delete cascade,
  telegram_user_id text not null,
  telegram_chat_id text not null,
  telegram_username text,
  full_name text not null check (char_length(full_name) between 2 and 160),
  phone_number text,
  trade text,
  preferred_language text not null default 'en',
  status public.join_request_status not null default 'PENDING',
  worker_id uuid references public.workers(id) on delete set null,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, telegram_user_id)
);

create table public.telegram_sessions (
  chat_id text primary key,
  telegram_user_id text not null,
  invite_id uuid references public.project_invites(id) on delete cascade,
  worker_id uuid references public.workers(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  step text not null,
  data jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null default (now() + interval '1 hour'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.telegram_updates (
  update_id bigint primary key,
  status text not null default 'PROCESSING' check (status in ('PROCESSING', 'COMPLETED', 'FAILED')),
  attempts integer not null default 1,
  last_error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_invites_project_idx
  on public.project_invites(project_id, created_at desc);
create index project_join_requests_review_idx
  on public.project_join_requests(organization_id, status, created_at desc);
create index telegram_sessions_expires_idx
  on public.telegram_sessions(expires_at);

create trigger project_join_requests_set_updated_at
  before update on public.project_join_requests
  for each row execute function public.set_updated_at();
create trigger telegram_sessions_set_updated_at
  before update on public.telegram_sessions
  for each row execute function public.set_updated_at();
create trigger telegram_updates_set_updated_at
  before update on public.telegram_updates
  for each row execute function public.set_updated_at();

alter table public.project_invites enable row level security;
alter table public.project_join_requests enable row level security;
alter table public.telegram_sessions enable row level security;
alter table public.telegram_updates enable row level security;

create policy project_invites_select on public.project_invites
  for select to authenticated
  using (public.is_organization_member(organization_id));
create policy project_invites_manage on public.project_invites
  for all to authenticated
  using (public.can_manage_organization(organization_id))
  with check (public.can_manage_organization(organization_id));
create policy project_join_requests_select on public.project_join_requests
  for select to authenticated
  using (public.is_organization_member(organization_id));
create policy project_join_requests_manage on public.project_join_requests
  for all to authenticated
  using (public.can_manage_organization(organization_id))
  with check (public.can_manage_organization(organization_id));

create or replace function public.approve_project_join_request(target_request_id uuid)
returns public.project_join_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare
  join_request public.project_join_requests;
  approved_request public.project_join_requests;
  new_worker public.workers;
  existing_worker_id uuid;
  project_name text;
begin
  select * into join_request
  from public.project_join_requests
  where id = target_request_id
  for update;

  if join_request.id is null then
    raise exception 'JOIN_REQUEST_NOT_FOUND';
  end if;
  if not public.can_manage_organization(join_request.organization_id) then
    raise exception 'FORBIDDEN';
  end if;
  if join_request.status <> 'PENDING' then
    raise exception 'JOIN_REQUEST_INVALID_STATE';
  end if;

  select c.worker_id into existing_worker_id
  from public.worker_channel_identities c
  where c.organization_id = join_request.organization_id
    and c.channel = 'TELEGRAM'
    and c.external_user_id = join_request.telegram_user_id
  limit 1;

  if existing_worker_id is not null then
    select * into new_worker from public.workers where id = existing_worker_id;
    update public.workers set status = 'ACTIVE' where id = existing_worker_id;
    update public.worker_channel_identities
    set external_chat_id = join_request.telegram_chat_id,
        is_verified = true, is_enabled = true, is_preferred = true,
        opted_in_at = coalesce(opted_in_at, now())
    where organization_id = join_request.organization_id
      and channel = 'TELEGRAM'
      and external_user_id = join_request.telegram_user_id;
  else
    insert into public.workers (
      organization_id, full_name, phone_number, trade, preferred_language, status
    ) values (
      join_request.organization_id, join_request.full_name, join_request.phone_number,
      join_request.trade, join_request.preferred_language, 'ACTIVE'
    ) returning * into new_worker;

    insert into public.worker_channel_identities (
      organization_id, worker_id, channel, external_user_id, external_chat_id,
      is_verified, is_enabled, is_preferred, opted_in_at
    ) values (
      join_request.organization_id, new_worker.id, 'TELEGRAM',
      join_request.telegram_user_id, join_request.telegram_chat_id,
      true, true, true, now()
    );
  end if;

  insert into public.project_workers (organization_id, project_id, worker_id)
  values (join_request.organization_id, join_request.project_id, new_worker.id)
  on conflict (project_id, worker_id) do nothing;

  update public.project_join_requests
  set status = 'APPROVED', worker_id = new_worker.id,
      reviewed_by = auth.uid(), reviewed_at = now()
  where id = join_request.id
  returning * into approved_request;

  select name into project_name from public.projects where id = join_request.project_id;

  insert into public.notifications (
    organization_id, worker_id, channel, recipient_external_id,
    template_key, language, payload
  ) values (
    join_request.organization_id, new_worker.id, 'TELEGRAM', join_request.telegram_chat_id,
    'project.join_approved', join_request.preferred_language,
    jsonb_build_object('project_id', join_request.project_id, 'project_name', project_name)
  );

  insert into public.audit_events (
    organization_id, actor_user_id, event_type, resource_type, resource_id, data
  ) values (
    join_request.organization_id, auth.uid(), 'PROJECT_JOIN_APPROVED',
    'project_join_request', join_request.id,
    jsonb_build_object('project_id', join_request.project_id, 'worker_id', new_worker.id)
  );

  return approved_request;
end;
$$;

create or replace function public.reject_project_join_request(target_request_id uuid)
returns public.project_join_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare
  join_request public.project_join_requests;
  rejected_request public.project_join_requests;
  project_name text;
begin
  select * into join_request
  from public.project_join_requests
  where id = target_request_id
  for update;

  if join_request.id is null then
    raise exception 'JOIN_REQUEST_NOT_FOUND';
  end if;
  if not public.can_manage_organization(join_request.organization_id) then
    raise exception 'FORBIDDEN';
  end if;
  if join_request.status <> 'PENDING' then
    raise exception 'JOIN_REQUEST_INVALID_STATE';
  end if;

  update public.project_join_requests
  set status = 'REJECTED', reviewed_by = auth.uid(), reviewed_at = now()
  where id = join_request.id
  returning * into rejected_request;

  select name into project_name from public.projects where id = join_request.project_id;

  insert into public.notifications (
    organization_id, channel, recipient_external_id, template_key, language, payload
  ) values (
    join_request.organization_id, 'TELEGRAM', join_request.telegram_chat_id,
    'project.join_rejected', join_request.preferred_language,
    jsonb_build_object('project_id', join_request.project_id, 'project_name', project_name)
  );

  insert into public.audit_events (
    organization_id, actor_user_id, event_type, resource_type, resource_id, data
  ) values (
    join_request.organization_id, auth.uid(), 'PROJECT_JOIN_REJECTED',
    'project_join_request', join_request.id,
    jsonb_build_object('project_id', join_request.project_id)
  );

  return rejected_request;
end;
$$;

create or replace function public.reject_timesheet(target_timesheet_id uuid, expected_version integer)
returns public.timesheets
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_timesheet public.timesheets;
  rejected_timesheet public.timesheets;
  worker_language text;
begin
  select * into current_timesheet
  from public.timesheets
  where id = target_timesheet_id
  for update;

  if current_timesheet.id is null then raise exception 'TIMESHEET_NOT_FOUND'; end if;
  if not public.can_manage_organization(current_timesheet.organization_id) then raise exception 'FORBIDDEN'; end if;
  if current_timesheet.version <> expected_version then raise exception 'TIMESHEET_VERSION_CONFLICT'; end if;
  if current_timesheet.status not in ('SUBMITTED', 'DISPUTED') then raise exception 'TIMESHEET_INVALID_STATE'; end if;

  update public.timesheets
  set status = 'REJECTED', version = version + 1
  where id = current_timesheet.id
  returning * into rejected_timesheet;

  select w.preferred_language into worker_language
  from public.workers w where w.id = current_timesheet.worker_id;

  if exists (
    select 1 from public.worker_channel_identities
    where worker_id = current_timesheet.worker_id and channel = 'TELEGRAM'
      and is_enabled and is_verified
  ) then
    insert into public.notifications (
      organization_id, worker_id, channel, template_key, language, payload
    ) values (
      current_timesheet.organization_id, current_timesheet.worker_id, 'TELEGRAM',
      'timesheet.rejected', coalesce(worker_language, 'en'),
      jsonb_build_object('timesheet_id', current_timesheet.id, 'version', rejected_timesheet.version)
    );
  end if;

  insert into public.audit_events (
    organization_id, actor_user_id, event_type, resource_type, resource_id, data
  ) values (
    current_timesheet.organization_id, auth.uid(), 'TIMESHEET_REJECTED',
    'timesheet', current_timesheet.id,
    jsonb_build_object('version', rejected_timesheet.version)
  );

  return rejected_timesheet;
end;
$$;

revoke all on function public.approve_project_join_request(uuid) from public;
revoke all on function public.reject_project_join_request(uuid) from public;
revoke all on function public.reject_timesheet(uuid, integer) from public;
grant execute on function public.approve_project_join_request(uuid) to authenticated;
grant execute on function public.reject_project_join_request(uuid) to authenticated;
grant execute on function public.reject_timesheet(uuid, integer) to authenticated;
