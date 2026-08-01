-- Lao Web Studio V2.7 Admin Workflow migration
-- Run once after V2.4 and V2.5 migrations. Repeat-safe and preserves existing data.

alter table public.leads add column if not exists project_name text;
alter table public.leads add column if not exists deadline date;
alter table public.leads add column if not exists last_contact_at timestamptz;
alter table public.leads add column if not exists completed_at timestamptz;

create table if not exists public.lead_activities(
 id uuid primary key default gen_random_uuid(),
 lead_id text not null,
 activity_type text not null default 'note',
 title text not null,
 detail text,
 created_by text not null default 'Nutthaphon',
 created_at timestamptz not null default now()
);

create index if not exists lead_activities_lead_idx on public.lead_activities(lead_id,created_at desc);
create index if not exists leads_follow_up_idx on public.leads(next_follow_up);
create index if not exists leads_priority_idx on public.leads(priority);

alter table public.lead_activities enable row level security;
drop policy if exists "Admins manage lead activities" on public.lead_activities;
create policy "Admins manage lead activities" on public.lead_activities
for all to authenticated using(true) with check(true);

notify pgrst,'reload schema';
select table_name from information_schema.tables
where table_schema='public' and table_name in ('leads','lead_activities') order by table_name;
