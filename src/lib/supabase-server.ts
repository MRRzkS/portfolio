import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * The client used by everything behind the login.
 *
 * It carries the signed-in user's session from the request cookies, so every
 * query it makes runs as `authenticated` and the row level security policies
 * apply exactly as they do to any other caller. The service role key is not
 * used here, or anywhere in this application: a dashboard that bypasses its
 * own database policies cannot be trusted to respect them.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot set cookies. The middleware refreshes
            // the session on every request, so swallowing this is safe rather
            // than merely convenient.
          }
        },
      },
    },
  );
}

/**
 * Resolves the signed-in user, or null.
 *
 * Uses `getUser`, which verifies the token with the auth server, rather than
 * `getSession`, which trusts whatever the cookie contains. Any failure returns
 * null so the caller denies; an error in this path must never resolve into
 * access.
 */
export async function getSignedInUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  } catch {
    return null;
  }
}
