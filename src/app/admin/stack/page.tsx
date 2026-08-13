import Link from 'next/link';
import { TechManager } from '@/components/admin/tech-manager';
import { getAllTech } from '@/lib/admin-queries';

export const dynamic = 'force-dynamic';

export default async function StackPage() {
  const items = await getAllTech();

  return (
    <>
      <div className="admin-head">
        <div>
          <span className="admin-eyebrow">Tech stack</span>
          <h1>{items.length} technologies</h1>
        </div>
        <Link className="admin-btn ghost" href="/admin">
          Back to projects
        </Link>
      </div>

      <TechManager items={items} />
    </>
  );
}
