alter table public.contact_inquiries
  add column selected_plan text check (selected_plan is null or selected_plan in ('BASIC', 'ADVANCED', 'PROFESSIONAL'));

create table public.organization_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  plan text not null default 'BASIC' check (plan in ('BASIC', 'ADVANCED', 'PROFESSIONAL')),
  status text not null default 'TRIAL' check (status in ('PENDING', 'TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED')),
  active_worker_limit integer check (active_worker_limit is null or active_worker_limit > 0),
  active_project_limit integer check (active_project_limit is null or active_project_limit > 0),
  manager_limit integer check (manager_limit is null or manager_limit > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organization_subscriptions_status_idx on public.organization_subscriptions(status, plan);

create trigger organization_subscriptions_set_updated_at
  before update on public.organization_subscriptions
  for each row execute function public.set_updated_at();

alter table public.organization_subscriptions enable row level security;

create policy organization_subscriptions_select on public.organization_subscriptions
  for select to authenticated
  using (public.is_organization_member(organization_id));

create or replace function public.apply_subscription_limits()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.plan = 'BASIC' then
    new.active_worker_limit := 15;
    new.active_project_limit := 3;
    new.manager_limit := 2;
  elsif new.plan = 'ADVANCED' then
    new.active_worker_limit := 50;
    new.active_project_limit := 10;
    new.manager_limit := 5;
  else
    new.active_worker_limit := 150;
    new.active_project_limit := null;
    new.manager_limit := 15;
  end if;
  return new;
end;
$$;

create trigger organization_subscriptions_apply_limits
  before insert or update of plan on public.organization_subscriptions
  for each row execute function public.apply_subscription_limits();

create or replace function public.create_trial_subscription()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.organization_subscriptions (organization_id, plan, status, starts_at)
  values (new.id, 'BASIC', 'TRIAL', now());
  return new;
end;
$$;

create trigger organizations_create_trial_subscription
  after insert on public.organizations
  for each row execute function public.create_trial_subscription();

insert into public.organization_subscriptions (organization_id, plan, status, starts_at)
select id, 'BASIC', 'TRIAL', now() from public.organizations
on conflict (organization_id) do nothing;

create or replace function public.enforce_active_worker_subscription_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  subscription public.organization_subscriptions;
  active_worker_count integer;
begin
  if new.status <> 'ACTIVE' or (TG_OP = 'UPDATE' and old.status = 'ACTIVE') then
    return new;
  end if;

  select * into subscription
  from public.organization_subscriptions
  where organization_id = new.organization_id
  for update;

  if subscription.id is null or subscription.status not in ('TRIAL', 'ACTIVE') then
    raise exception 'SUBSCRIPTION_NOT_ACTIVE';
  end if;

  select count(*) into active_worker_count
  from public.workers
  where organization_id = new.organization_id and status = 'ACTIVE';

  if subscription.active_worker_limit is not null and active_worker_count >= subscription.active_worker_limit then
    raise exception 'ACTIVE_WORKER_LIMIT_REACHED';
  end if;
  return new;
end;
$$;

create trigger workers_enforce_subscription_limit
  before insert or update of status on public.workers
  for each row execute function public.enforce_active_worker_subscription_limit();

create or replace function public.enforce_active_project_subscription_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  subscription public.organization_subscriptions;
  active_project_count integer;
begin
  if new.status <> 'ACTIVE' or (TG_OP = 'UPDATE' and old.status = 'ACTIVE') then
    return new;
  end if;

  select * into subscription
  from public.organization_subscriptions
  where organization_id = new.organization_id
  for update;

  if subscription.id is null or subscription.status not in ('TRIAL', 'ACTIVE') then
    raise exception 'SUBSCRIPTION_NOT_ACTIVE';
  end if;

  select count(*) into active_project_count
  from public.projects
  where organization_id = new.organization_id and status = 'ACTIVE';

  if subscription.active_project_limit is not null and active_project_count >= subscription.active_project_limit then
    raise exception 'ACTIVE_PROJECT_LIMIT_REACHED';
  end if;
  return new;
end;
$$;

create trigger projects_enforce_subscription_limit
  before insert or update of status on public.projects
  for each row execute function public.enforce_active_project_subscription_limit();

comment on table public.organization_subscriptions is 'Platform-managed subscriptions. Customers can view, but only the service operator changes status and limits.';
