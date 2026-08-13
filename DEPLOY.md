# Deploying

Read this first if a build fails. The five causes below account for nearly
every failed deploy of this project, and each has a definite fix.

---

## Order of operations

1. **Supabase: disable sign-up.** *Authentication → Providers → Email*, turn off
   new sign-ups. Then create your one account under *Authentication → Users*.
2. **Supabase: run `db/schema.sql`,** whole file, in the SQL editor.
3. **Supabase: run `db/seed.sql`.**
4. **Supabase: run `db/verify.sql`.** Every row it prints should say `PASS`.
5. **Vercel: add the environment variables** (below), for Production, Preview,
   and Development.
6. **Deploy.**

Steps 2 through 4 come before step 6. The build reads the database, so a
database that is not ready is a build that does not finish.

---

## Environment variables

| Name | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page, the **anon / publishable** key |
| `NEXT_PUBLIC_SITE_URL` | Your live address, e.g. `https://rienchy-razak.vercel.app` |

The URL takes the form `https://abcdefgh.supabase.co`. **No trailing slash, no
path.** The service role key is not used by this project and does not belong in
Vercel.

`NEXT_PUBLIC_SITE_URL` is invisible in the browser and wrong in Google if it is
wrong: it is what the sitemap, the canonical tags, and link previews are built
from.

---

## If the build fails

### `column projects.limitation does not exist`
### `column projects.kind does not exist`

The database is older than the code. **Run `db/schema.sql` again.** It is
idempotent: it adds what is missing, drops nothing, and keeps every row. Then
redeploy.

This is the most common failure, and it happens because the SQL was run from an
earlier copy of this project.

### `relation "projects" does not exist`

The SQL was never run, or it was run against a different Supabase project than
the one the environment variables point at. Check that the project ref in
`NEXT_PUBLIC_SUPABASE_URL` matches the project whose SQL editor you used.

### `Missing environment variable NEXT_PUBLIC_SUPABASE_URL`

The variable is not set for the environment being built. Two things catch
people here: it must be set for **Production** specifically, not only Preview;
and **adding a variable does not rebuild an existing deployment.** Redeploy
after adding it.

### `TypeError: fetch failed` or `ENOTFOUND`

The URL is malformed. It should be `https://abcdefgh.supabase.co` exactly — no
trailing slash, no `/rest/v1`, and the `https://` included.

### The build succeeds but the work section is empty

`schema.sql` ran and `seed.sql` did not, or every project is unpublished. Run
`db/verify.sql`; its last check counts published projects.

---

## Checking without deploying

```bash
npm install
cp .env.example .env.local     # fill in the same three variables
npm run build
```

If that succeeds locally with the production values, it will succeed on Vercel.
The build is the same command.

---

## Node and dependencies

`package-lock.json` is committed, so Vercel installs the exact versions this was
built and tested against. Do not delete it: without a lockfile, a deploy weeks
from now resolves different minor versions than the ones that worked.

`package.json` declares Node 18.18 or later. Vercel's default satisfies this.

---

## After a successful deploy

- Put `cv.pdf` in `public/`. The hero and footer both link to `/cv.pdf`, and a
  dead link there is worse than no link.
- Open `/admin`, sign in, and confirm the dashboard loads.
- Open the site on a phone, on mobile data, and read it end to end.
- Check every outbound link resolves.
