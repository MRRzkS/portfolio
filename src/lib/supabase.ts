import { createClient } from '@supabase/supabase-js';

/**
 * The public read client. It carries the anon key, which is not a secret: row
 * level security is what limits it, and the policies only permit selecting
 * published rows. The service role key is never imported here.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Failing at build time with the variable named beats rendering an empty
    // page and leaving someone to guess which key is missing.
    throw new Error(
      `Missing environment variable ${name}.\n` +
        'Locally: copy .env.example to .env.local and fill it in.\n' +
        'On Vercel: Settings -> Environment Variables, then redeploy. ' +
        'Adding a variable does not rebuild an existing deployment on its own.',
    );
  }
  return value;
}

export const supabase = createClient(
  required('NEXT_PUBLIC_SUPABASE_URL'),
  required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  {
    auth: {
      // Nothing on the public site signs in, so there is no session to keep.
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
