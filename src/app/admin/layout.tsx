import type { Metadata } from 'next';
import Link from 'next/link';
import { signOut } from '@/lib/admin-actions';
import { getSignedInUser } from '@/lib/supabase-server';
import './admin.css';

export const metadata: Metadata = {
  title: 'Dashboard',
  // Nothing here should ever be indexed, even if a URL leaks.
  robots: { index: false, follow: false, nocache: true },
};

/** Rendering: client rendered behind a login, so nothing indexes it and the
 *  data must be live rather than cached. */
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSignedInUser();

  return (
    <div className="admin">
      {user && (
        <header className="admin-bar">
          <div className="admin-wrap">
            <Link className="admin-mark" href="/admin">
              RAZAK<span>.</span> <em>dashboard</em>
            </Link>

            <div className="admin-bar-right">
              <Link className="admin-link" href="/admin">
                Projects
              </Link>
              <Link className="admin-link" href="/admin/stack">
                Stack
              </Link>
              <Link className="admin-link" href="/" target="_blank" rel="noopener noreferrer">
                View site
              </Link>
              <span className="admin-user">{user.email}</span>
              <form action={signOut}>
                <button className="admin-btn ghost" type="submit">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>
      )}

      <main className="admin-wrap admin-main">{children}</main>
    </div>
  );
}
