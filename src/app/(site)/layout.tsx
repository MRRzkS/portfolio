import { SiteNav } from '@/components/site-nav';

/**
 * The public shell. The navigation lives here rather than in the root layout
 * so it does not follow the owner into the dashboard, which has its own bar
 * and no use for a link to the work section.
 *
 * A route group changes nothing about the URLs: `/` and `/work/[slug]` are
 * unaffected.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
    </>
  );
}
