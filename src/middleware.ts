import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const LOGIN_PATH = '/admin/login';

/**
 * Guards everything under /admin.
 *
 * Two jobs: refresh the session cookie so it does not expire mid-edit, and
 * deny anyone without one. It fails closed by construction, since every path
 * that does not end in a confirmed user ends in a redirect to the login page.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page is the one place under /admin a signed-out visitor may go.
  const isLoginPage = pathname === LOGIN_PATH;

  let response = NextResponse.next({ request });

  let user = null;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch {
    // A network failure, an expired key, a malformed cookie: all of them mean
    // the session could not be confirmed, and an unconfirmed session is not a
    // session. Leaving `user` null sends the request to the login page below.
    user = null;
  }

  if (!user && !isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = LOGIN_PATH;
    // Remember where they were headed so login can return them there.
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // The public site is not touched by any of this, so it stays fully static.
  matcher: ['/admin/:path*'],
};
