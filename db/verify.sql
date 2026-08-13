-- =====================================================================
-- Verification
-- =====================================================================
--
-- Run this after schema.sql and seed.sql, and again any time a deploy fails
-- with a database error. Every row it prints should say PASS.
--
-- The column checks exist because a missing column is the failure that breaks
-- a build rather than a page: the site queries it, PostgREST refuses, and the
-- deploy dies with a message that does not obviously point here.

-- ---------------------------------------------------------------------
-- 1. Every column the application selects
-- ---------------------------------------------------------------------

select
  expected.column_name,
  case when c.column_name is null then 'MISSING  <-- run schema.sql again'
       else 'PASS' end as status
from (values
  ('slug'), ('title'), ('subtitle'), ('kind'), ('cover_image_url'),
  ('situation'), ('task'), ('action'), ('metrics'), ('limitation'),
  ('testimonial'), ('testimonial_author'),
  ('repo_url'), ('live_url'), ('sort_order'), ('is_published'), ('updated_at')
) as expected (column_name)
left join information_schema.columns c
  on c.table_schema = 'public'
 and c.table_name = 'projects'
 and c.column_name = expected.column_name
order by status desc, expected.column_name;

-- ---------------------------------------------------------------------
-- 2. Row level security is on, and every table has policies
-- ---------------------------------------------------------------------

select
  t.relname as table_name,
  case when t.relrowsecurity then 'PASS' else 'RLS OFF  <-- unprotected' end as rls,
  count(p.polname) as policies,
  case when count(p.polname) >= 2 then 'PASS' else 'TOO FEW' end as policy_status
from pg_class t
left join pg_policy p on p.polrelid = t.oid
where t.relname in ('projects', 'tech_stack', 'project_tech')
group by t.relname, t.relrowsecurity
order by t.relname;

-- ---------------------------------------------------------------------
-- 3. Readers cannot write
-- ---------------------------------------------------------------------

select
  'anon write privileges' as check_name,
  case when count(*) = 0 then 'PASS'
       else 'FAIL  <-- anon can ' || string_agg(distinct lower(privilege_type), ', ')
  end as status
from information_schema.role_table_grants
where grantee = 'anon'
  and table_schema = 'public'
  and table_name in ('projects', 'tech_stack', 'project_tech')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE');

-- ---------------------------------------------------------------------
-- 4. Readers see published rows only
-- ---------------------------------------------------------------------

begin;

-- A draft that no reader should ever see.
insert into projects (slug, title, subtitle, situation, task, action, metrics, is_published)
values ('verification-draft', 'Draft', 'Unpublished', 's', 't', array['a'], '[]'::jsonb, false)
on conflict (slug) do nothing;

set local role anon;

select 'draft hidden from readers' as check_name,
       case when not exists (select 1 from projects where slug = 'verification-draft')
            then 'PASS' else 'FAIL' end as status;

select 'published visible to readers' as check_name,
       case when exists (select 1 from projects where is_published)
            then 'PASS' else 'FAIL  <-- run seed.sql' end as status;

reset role;

set local role authenticated;

select 'draft visible to owner' as check_name,
       case when exists (select 1 from projects where slug = 'verification-draft')
            then 'PASS' else 'FAIL' end as status;

reset role;

-- The draft was never committed.
rollback;

-- ---------------------------------------------------------------------
-- 5. Content is present
-- ---------------------------------------------------------------------

select
  (select count(*) from projects where is_published) as published_projects,
  (select count(*) from tech_stack)                  as technologies,
  (select count(*) from project_tech)                as attachments,
  case when (select count(*) from projects where is_published) > 0
       then 'PASS' else 'EMPTY  <-- run seed.sql' end as status;

-- ---------------------------------------------------------------------
-- 6. The storage bucket
-- ---------------------------------------------------------------------

select 'covers bucket' as check_name,
       case when exists (select 1 from storage.buckets where id = 'covers')
            then 'PASS' else 'MISSING  <-- run schema.sql again' end as status;

-- ---------------------------------------------------------------------
-- Not scripted: a write by a reader.
-- A permission error aborts the transaction and stops the file, so run this
-- on its own to confirm it is refused.
--
--   set role anon;
--   insert into projects (slug, title, subtitle, situation, task, action)
--   values ('should-fail', 'x', 'x', 'x', 'x', array['x']);
--   reset role;
--
-- Expected: permission denied for table projects.
-- ---------------------------------------------------------------------
