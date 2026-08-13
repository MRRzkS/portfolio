import { LoginForm } from '@/components/admin/login-form';

/** Rendering: server rendered. Small, no data, and must never be cached. */
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  // Only paths inside the dashboard are accepted, so a crafted link cannot
  // bounce a signed-in owner to another site.
  const destination = next && next.startsWith('/admin') ? next : '/admin';

  return <LoginForm next={destination} />;
}
