'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteProject, setPublished } from '@/lib/admin-actions';

export function PublishToggle({
  projectId,
  slug,
  isPublished,
}: {
  projectId: string;
  slug: string;
  isPublished: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const result = await setPublished(projectId, slug, !isPublished);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        className={isPublished ? 'pill live' : 'pill draft'}
        onClick={toggle}
        disabled={pending}
        aria-label={isPublished ? `Unpublish ${slug}` : `Publish ${slug}`}
      >
        {pending ? '\u2026' : isPublished ? 'Published' : 'Draft'}
      </button>
      {error && <em className="field-error">{error}</em>}
    </>
  );
}

export function DeleteButton({
  projectId,
  slug,
  title,
}: {
  projectId: string;
  slug: string;
  title: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Two steps, and the second one names the project. A delete that takes one
  // click and says "Are you sure?" is a delete that eventually happens by
  // accident.
  if (!confirming) {
    return (
      <button type="button" className="admin-btn ghost small" onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }

  return (
    <div className="confirm" role="alertdialog" aria-label={`Delete ${title}`}>
      <p>
        Delete <strong>{title}</strong> permanently? Its case study page and every link to it stop
        working.
      </p>
      <div className="confirm-actions">
        <button
          type="button"
          className="admin-btn danger small"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await deleteProject(projectId, slug);
              if (result?.error) setError(result.error);
            })
          }
        >
          {pending ? 'Deleting\u2026' : `Yes, delete ${title}`}
        </button>
        <button
          type="button"
          className="admin-btn ghost small"
          onClick={() => setConfirming(false)}
          disabled={pending}
        >
          Keep it
        </button>
      </div>
      {error && <em className="field-error">{error}</em>}
    </div>
  );
}
