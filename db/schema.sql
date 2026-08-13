-- =====================================================================
-- Portfolio schema
-- =====================================================================
--
-- Run this whole file in the Supabase SQL editor. Run it again whenever it
-- changes. Every statement is idempotent, so it is safe on a fresh database
-- and on one that already has data: nothing here drops a table or deletes a
-- row.
--
-- This replaces the numbered migration files. One file that can always be
-- re-run beats five that have to be applied in the right order and remembered
-- afterwards.
--
-- Order inside the file: tables, then columns, then constraints, then indexes,
-- then the trigger, then privileges, then row level security, then storage.

-- =====================================================================
-- 1. Tables
-- =====================================================================

create table if not exists projects (
  id uuid primary key default gen_random_uuid()
);

create table if not exists tech_stack (
  id uuid primary key default gen_random_uuid()
);

-- =====================================================================
-- 2. Columns
-- =====================================================================
--
-- Added one at a time rather than in the create statements above, so a
-- database created from an older copy of this file gains whatever it is
-- missing without anything being dropped.

alter table projects add column if not exists slug               text;
alter table projects add column if not exists title              text;
alter table projects add column if not exists subtitle           text;
alter table projects add column if not exists kind               text;
alter table projects add column if not exists cover_image_url    text;

-- The four STAR fields. `situation` and `task` read as prose; `action` is a
-- list of steps, stored as one, which keeps a markdown parser out of the
-- rendering path.
alter table projects add column if not exists situation          text;
alter table projects add column if not exists task               text;
alter table projects add column if not exists action             text[] default '{}'::text[];

-- [{"label": "Test cases", "value": "26 passing"}, ...]
-- Never queried or sorted apart from its project, so a separate table would
-- buy a join and a migration and return nothing.
alter table projects add column if not exists metrics            jsonb  default '[]'::jsonb;

-- An honest note about where the project stops short, shown beside the
-- results. Naming a boundary yourself reads as confidence.
alter table projects add column if not exists limitation         text;

alter table projects add column if not exists testimonial        text;
alter table projects add column if not exists testimonial_author text;
alter table projects add column if not exists repo_url           text;
alter table projects add column if not exists live_url           text;
alter table projects add column if not exists sort_order         integer     default 0;
alter table projects add column if not exists is_published       boolean     default false;
alter table projects add column if not exists created_at         timestamptz default now();
alter table projects add column if not exists updated_at         timestamptz default now();

alter table tech_stack add column if not exists name         text;
alter table tech_stack add column if not exists category     text;
alter table tech_stack add column if not exists sort_order   integer default 0;
alter table tech_stack add column if not exists is_published boolean default true;

create table if not exists project_tech (
  project_id uuid not null references projects (id)   on delete cascade,
  tech_id    uuid not null references tech_stack (id) on delete restrict,
  primary key (project_id, tech_id)
);

-- Deleting a project takes its attachments with it; deleting a technology that
-- is still in use fails loudly. The database enforces that rule, not the
-- dashboard.

-- =====================================================================
-- 3. Constraints
-- =====================================================================
--
-- `not null` is applied separately from the column definitions so this file
-- can be re-run. Adding it twice is harmless; the statements are wrapped
-- because they fail if existing rows violate them.

do $$
begin
  alter table projects alter column slug      set not null;
  alter table projects alter column title     set not null;
  alter table projects alter column subtitle  set not null;
  alter table projects alter column situation set not null;
  alter table projects alter column task      set not null;
  alter table projects alter column action    set not null;
  alter table projects alter column metrics   set not null;
  alter table projects alter column sort_order   set not null;
  alter table projects alter column is_published set not null;
  alter table projects alter column created_at   set not null;
  alter table projects alter column updated_at   set not null;

  alter table tech_stack alter column name         set not null;
  alter table tech_stack alter column category     set not null;
  alter table tech_stack alter column sort_order   set not null;
  alter table tech_stack alter column is_published set not null;
exception
  when others then
    raise notice 'Skipped some not-null constraints: %', sqlerrm;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_slug_unique') then
    alter table projects add constraint projects_slug_unique unique (slug);
  end if;

  -- The slug reaches the public site as a URL segment, so its shape is fixed
  -- here rather than trusted to whatever writes it.
  if not exists (select 1 from pg_constraint where conname = 'projects_slug_format') then
    alter table projects add constraint projects_slug_format
      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'projects_metrics_is_array') then
    alter table projects add constraint projects_metrics_is_array
      check (jsonb_typeof(metrics) = 'array');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'tech_stack_name_unique') then
    alter table tech_stack add constraint tech_stack_name_unique unique (name);
  end if;

  -- An allowlist rather than free text: a typo here becomes an empty section
  -- on the public page, which is the kind of failure nobody notices.
  if not exists (select 1 from pg_constraint where conname = 'tech_stack_category_allowed') then
    alter table tech_stack add constraint tech_stack_category_allowed
      check (category in ('backend', 'frontend', 'database', 'infrastructure', 'tooling'));
  end if;
end $$;

-- =====================================================================
-- 4. Indexes
-- =====================================================================

-- The public index reads published projects in display order and nothing else.
create index if not exists projects_published_order_idx
  on projects (sort_order)
  where is_published;

create index if not exists project_tech_tech_id_idx on project_tech (tech_id);

-- =====================================================================
-- 5. updated_at
-- =====================================================================

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on projects;

create trigger projects_touch_updated_at
  before update on projects
  for each row
  execute function touch_updated_at();

-- =====================================================================
-- 6. Privileges
-- =====================================================================
--
-- Supabase grants these by default, but relying on a default is the opposite
-- of deny-first. Written down, the deny is enforced twice: policies decide
-- which rows, privileges decide which operations. A reader that somehow got
-- past a policy still has no INSERT to use.

grant usage on schema public to anon, authenticated;

grant select on projects, tech_stack, project_tech to anon;
grant select, insert, update, delete on projects, tech_stack, project_tech to authenticated;

revoke insert, update, delete on projects, tech_stack, project_tech from anon;

-- =====================================================================
-- 7. Row level security
-- =====================================================================
--
-- Enabling RLS with no policy denies everything. Each permission below is an
-- exception that had to be written down deliberately.
--
-- THE DEPENDENCY THAT MATTERS: the write policies grant the `authenticated`
-- role, which is safe only because sign-up is disabled at the Supabase auth
-- provider and exactly one account exists. If sign-up is ever enabled, every
-- new account inherits write access to this content.
--
-- To remove that dependency, replace `to authenticated` below with
--   using (auth.uid() = '<your-user-uuid>')
-- once the account exists.

alter table projects    enable row level security;
alter table tech_stack  enable row level security;
alter table project_tech enable row level security;

-- Policies have no `create ... if not exists`, so each one is dropped first.
-- This is the only place in the file where something is dropped, and it is
-- replaced on the next line.

drop policy if exists "anyone reads published projects"   on projects;
drop policy if exists "owner manages projects"            on projects;
drop policy if exists "anyone reads published tech stack" on tech_stack;
drop policy if exists "owner manages tech stack"          on tech_stack;
drop policy if exists "anyone reads attachments of published rows" on project_tech;
drop policy if exists "owner manages attachments"         on project_tech;

-- Readers: published rows, and reading only.

create policy "anyone reads published projects"
  on projects for select
  using (is_published);

create policy "anyone reads published tech stack"
  on tech_stack for select
  using (is_published);

-- An attachment is visible only when both of its ends are.
create policy "anyone reads attachments of published rows"
  on project_tech for select
  using (
    exists (select 1 from projects p   where p.id = project_id and p.is_published)
    and
    exists (select 1 from tech_stack t where t.id = tech_id    and t.is_published)
  );

-- Owner: everything, including the drafts readers cannot see.

create policy "owner manages projects"
  on projects for all
  to authenticated
  using (true)
  with check (true);

create policy "owner manages tech stack"
  on tech_stack for all
  to authenticated
  using (true)
  with check (true);

create policy "owner manages attachments"
  on project_tech for all
  to authenticated
  using (true)
  with check (true);

-- =====================================================================
-- 8. Storage
-- =====================================================================
--
-- One bucket for project cover images.
--
-- Wrapped in a guard because the storage schema belongs to Supabase, not to
-- this project. On a plain PostgreSQL instance it does not exist, and a
-- missing bucket should never be the reason the tables above fail to install.

do $$
begin
  if not exists (select 1 from information_schema.tables
                 where table_schema = 'storage' and table_name = 'buckets') then
    raise notice 'No storage schema found. Skipping the covers bucket.';
    return;
  end if;

  insert into storage.buckets (id, name, public)
  values ('covers', 'covers', true)
  on conflict (id) do update set public = true;

  drop policy if exists "anyone reads covers"   on storage.objects;
  drop policy if exists "owner uploads covers"  on storage.objects;
  drop policy if exists "owner replaces covers" on storage.objects;
  drop policy if exists "owner deletes covers"  on storage.objects;

  -- Public read, because a cover is shown on a public page and gating it
  -- would mean signing every URL for no benefit.
  execute $p$
    create policy "anyone reads covers"
      on storage.objects for select
      using (bucket_id = 'covers')
  $p$;

  -- Write is the owner's alone. Insert, update, and delete are separate: a
  -- policy for one does not imply the others.
  execute $p$
    create policy "owner uploads covers"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'covers')
  $p$;

  execute $p$
    create policy "owner replaces covers"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'covers')
      with check (bucket_id = 'covers')
  $p$;

  execute $p$
    create policy "owner deletes covers"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'covers')
  $p$;
end $$;
