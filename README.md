# Portfolio

Public portfolio site for Muhammad Rienchy Razak Simatupang.

Next.js App Router reading from Supabase. Content lives in the database, so
publishing a project never requires a deploy.

---

## Setup

### 1. Create the Supabase project

**Turn off sign-up first.** In *Authentication → Providers → Email*, disable new
sign-ups, then create your single admin account manually in *Authentication →
Users*.

This matters. The write policies grant the `authenticated` role. With sign-up
open, anyone who registers inherits write access to this content.

### 2. Run the SQL

In the Supabase SQL editor, in order:

| File | What it does |
|---|---|
| `db/schema.sql` | Tables, columns, constraints, indexes, RLS, privileges, storage |
| `db/seed.sql` | The four projects and the tech stack |
| `db/verify.sql` | Prints `PASS` for every check, or names what is missing |

All three are **idempotent**. Run them as often as you like: on a fresh
database they create everything, and on an existing one they add whatever is
missing without dropping a table or deleting a row.

That property matters. The one deploy failure this project has actually had was
a database a version behind the code. Re-running `schema.sql` is the fix, and it
is always safe.

One exception: `seed.sql` overwrites the four seeded projects. Once you are
editing through the dashboard, treat it as a reset rather than a routine step.

### 3. Configure the environment

```bash
cp .env.example .env.local
```

Fill in the project URL and the **anon** key from *Project Settings → API*. The
service role key does not belong in this file and is not used by this app.

### 4. Run it

```bash
npm install
npm run dev
```

---

## Deploying

See **DEPLOY.md**. It has the order of operations, the environment variables,
and the fix for each build error this project can produce.

---

## How rendering works

| Route | Mode | Why |
|---|---|---|
| `/` | Static | Must be indexed and preview as a link. Content changes only when you save. |
| `/work/[slug]` | Static, one page per published project | The URL a recruiter is most likely to be sent directly. |
| `/sitemap.xml`, `/robots.txt` | Static | Generated from the same query as the pages. |

`dynamicParams = false` on the case study route means any slug outside
`generateStaticParams` returns 404. An unpublished project therefore has no
page at all, rather than a page that checks a flag at request time.

Pages are built once. To publish a change without redeploying, the dashboard in
slice 3 calls `revalidatePath`.

---

## Where the access rules live

Not in this codebase. `getProjects()` never filters on `is_published`, because
the row level security policy already restricts an anonymous reader to
published rows. Repeating the condition in the query would create a second
place for the rule to live, and two places drift.

The practical consequence: **an unpublished project cannot leak through a bug in
this application, because this application never sees it.**

Verified end to end. With a draft row present in the database:

- the anonymous API returned only the four published projects
- `generateStaticParams` produced four pages, not five
- the draft's slug and text appear nowhere in `.next/server` or `.next/static`
- requesting its URL returns 404

---

## Content

Each project carries the four STAR fields the screening brief asks for.

| Column | Renders as |
|---|---|
| `situation` | Context. Split into paragraphs on a blank line. |
| `task` | My role. |
| `action` | Process, as a numbered list. One array element per step. |
| `metrics` | The spec block. `[{"label": "...", "value": "..."}]` |
| `limitation` | The note beside the results, saying where the project stops short. |
| `kind` | The caption above the title, e.g. `Backend · Self-directed`. |

The home page card shows the first metric as its headline number, so put the
tightest one first. The second metric fills the caption beside it, read as
"*value label*" — so `{"label": "Roles", "value": "3"}` becomes "3 roles".

---

## Adding a technology

Add the row from the dashboard and it appears in the stack section immediately.
Its logo will fall back to a neutral glyph.

To give it a real mark, add one entry to `src/lib/brand-marks.ts`, keyed by the
same name as in the table. Paths come from
[Simple Icons](https://simpleicons.org) (CC0), on a 24×24 grid, with the brand's
official hex.

This is the one place adding content still touches the codebase. Bundling all
three thousand Simple Icons to avoid it would cost about a megabyte to save a
two-line edit.

---

## Notes on the build

**Fonts are self-hosted.** Manrope and JetBrains Mono are variable `woff2` files
in `src/fonts`, loaded through `next/font/local`. Fetching them from Google at
build time made the build fail whenever that request failed, which is a
dependency the build does not need.

**No CSS framework.** `src/app/globals.css` is the design system: tokens at the
top, components below. It was written and tested against the approved mockup at
nine widths. Translating it into utility classes would have risked visual drift
and added a build dependency for no benefit today.

**No browser storage.** Nothing in the site writes to `localStorage`.

---

## The dashboard

Lives at `/admin`. It is a convenience, not part of the deliverable: the public
site is fully static and works whether or not anyone ever signs in.

### One-time setup

1. **Disable sign-up** in *Authentication → Providers → Email*.
2. Create your account manually in *Authentication → Users*.

The `covers` storage bucket and its policies are created by `db/schema.sql`.

Step 1 is not optional. Every write policy grants the `authenticated` role, so
an open sign-up form is an open edit button.

### What it does

| | |
|---|---|
| `/admin` | Every project, drafts included, with publish toggles |
| `/admin/projects/new` | Create |
| `/admin/projects/[id]` | Edit, including the cover upload |

Saving calls `revalidatePath` for the home page, the sitemap, and the project's
own page, so a change is live in seconds without a deploy. Renaming a project
also revalidates the old address, which would otherwise keep serving the old
page.

### How access is denied

Four independent layers, and the order matters: each one assumes the ones above
it might fail.

1. **Middleware** on `/admin/:path*` confirms a user before the page renders,
   and redirects to the login page otherwise.
2. **Every server action** confirms the user again. The middleware only guards
   navigations; a server action is a public endpoint and has to defend itself.
3. **Row level security** decides what the query returns, using the caller's
   own session. The dashboard has no elevated key to fall back on.
4. **Table privileges** mean `anon` has no `INSERT` to attempt in the first
   place.

The session is resolved with `getUser`, which verifies the token with the auth
server, rather than `getSession`, which trusts the cookie. Any failure in that
path returns null and the request is denied. There is no branch where an error
resolves into access.

Verified with the auth server entirely unreachable: `/admin`,
`/admin/projects/new`, and `/admin/projects/<id>` all redirected to the login
page rather than erroring open.

### Validation

`src/lib/validation.ts` is the allowlist. Slug format, field lengths, link
scheme, metric count, and image type and size are all checked on the server
before anything is written. The database repeats the important parts as
constraints, deliberately: the schema gives a readable message, the constraint
means a bug in the schema still cannot write a malformed row.

Cover uploads accept WebP, PNG, and JPEG up to 2 MB, checked server-side. The
`accept` attribute on the file input is a convenience for whoever is choosing a
file, not a control.

### Deleting

Two steps, and the second one names the project. A delete that takes one click
and asks "Are you sure?" is a delete that eventually happens by accident.

### Tech stack

`/admin/stack` manages the technology list: add, rename, recategorise, reorder,
hide, and delete.

Deleting one that is still attached to a project is refused, and the message
names the projects in the way. That refusal comes from the database, not from a
check in the dashboard, so it holds however the delete is attempted.

Technologies are attached to a project from the project's own form, as
checkboxes grouped by category. They become the chips on the card and on the
case study.

A new technology shows up in the stack section immediately, with a neutral
glyph. To give it a brand logo, add one entry to `src/lib/brand-marks.ts` keyed
by the same name. That is the one remaining place where adding content touches
the codebase; bundling all three thousand Simple Icons to avoid it would cost
about a megabyte to save a two-line edit.
