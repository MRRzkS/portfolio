import type { NextConfig } from 'next';

/**
 * Cover images are served from Supabase Storage, so that hostname has to be
 * declared. It is derived from the same variable the client uses, rather than
 * written twice.
 *
 * The parse is guarded because this file is evaluated before anything else:
 * a missing or malformed URL here fails the build with a stack trace from
 * inside Next rather than a message about the variable, which is a bad half
 * hour for whoever is deploying.
 */
function supabaseHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;

  try {
    return new URL(raw).hostname;
  } catch {
    console.warn(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: ${raw}\n` +
        'It should look like https://abcdefgh.supabase.co, with no trailing slash.',
    );
    return null;
  }
}

const hostname = supabaseHostname();

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: hostname ? [{ protocol: 'https', hostname }] : [],
  },
};

export default config;
