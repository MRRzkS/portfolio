'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { saveProject, uploadCover, type ActionResult } from '@/lib/admin-actions';
import { ALLOWED_IMAGE_TYPES } from '@/lib/validation';
import type { AdminProject, AdminTech } from '@/lib/admin-queries';
import { CATEGORY_LABEL, CATEGORY_ORDER, type Metric } from '@/lib/types';

const EMPTY: ActionResult = {};
const EMPTY_UPLOAD: { url?: string; error?: string } = {};

interface ProjectFormProps {
  project: AdminProject | null;
  allTech: AdminTech[];
  selectedTechIds: string[];
}

export function ProjectForm({ project, allTech, selectedTechIds }: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(
    saveProject.bind(null, project?.id ?? null, project?.slug ?? null),
    EMPTY,
  );

  const [metrics, setMetrics] = useState<Metric[]>(
    project?.metrics?.length ? project.metrics : [{ label: '', value: '' }],
  );

  const [coverUrl, setCoverUrl] = useState(project?.cover_image_url ?? '');
  const [upload, uploadAction, uploading] = useActionState(uploadCover, EMPTY_UPLOAD);

  // The upload action returns the public URL; mirror it into the hidden field
  // the save action reads, so the two forms stay independent.
  const resolvedCover = upload.url ?? coverUrl;

  const error = (field: string) => state.fieldErrors?.[field];

  // Fields with no inline error below. If one of them trips the schema, list
  // it here so "Some fields need attention" is never silent.
  const shownFields = [
    'title', 'slug', 'subtitle', 'situation', 'task', 'action', 'metrics',
    'repo_url', 'live_url', 'kind', 'limitation', 'cover_image_url',
  ];
  const hiddenErrors = Object.entries(state.fieldErrors ?? {}).filter(
    ([field]) => !shownFields.includes(field),
  );

  return (
    <>
      <div className="admin-head">
        <div>
          <span className="admin-eyebrow">{project ? 'Edit project' : 'New project'}</span>
          <h1>{project ? project.title : 'Add a project'}</h1>
        </div>
        <Link className="admin-btn ghost" href="/admin">
          Cancel
        </Link>
      </div>

      {state.error && (
        <p className="form-error banner" role="alert">
          {state.error}
        </p>
      )}

      <form className="admin-form" action={formAction}>
        <section className="admin-card">
          <h2>Identity</h2>

          <div className="row">
            <label className="field">
              <span>Title</span>
              <input name="title" defaultValue={project?.title ?? ''} required />
              {error('title') && <em className="field-error">{error('title')}</em>}
            </label>

            <label className="field">
              <span>Slug</span>
              <input
                name="slug"
                defaultValue={project?.slug ?? ''}
                placeholder="e-wallet-rest-api"
                required
              />
              <small>The address: /work/&lt;slug&gt;. Changing it breaks existing links.</small>
              {error('slug') && <em className="field-error">{error('slug')}</em>}
            </label>
          </div>

          <label className="field">
            <span>Subtitle</span>
            <input name="subtitle" defaultValue={project?.subtitle ?? ''} required />
            <small>One sentence. This is the line a recruiter actually reads.</small>
            {error('subtitle') && <em className="field-error">{error('subtitle')}</em>}
          </label>

          <label className="field">
            <span>Caption</span>
            <input
              name="kind"
              defaultValue={project?.kind ?? ''}
              placeholder="Backend &middot; Self-directed"
            />
            <small>Shown above the title and on the card.</small>
            {error('kind') && <em className="field-error">{error('kind')}</em>}
          </label>
        </section>

        <section className="admin-card">
          <h2>The story</h2>

          <label className="field">
            <span>Context</span>
            <textarea
              name="situation"
              rows={7}
              defaultValue={project?.situation ?? ''}
              required
            />
            <small>What the problem was. Leave a blank line between paragraphs.</small>
            {error('situation') && <em className="field-error">{error('situation')}</em>}
          </label>

          <label className="field">
            <span>My role</span>
            <textarea name="task" rows={3} defaultValue={project?.task ?? ''} required />
            <small>Be exact about what was yours. Never claim team work as your own.</small>
            {error('task') && <em className="field-error">{error('task')}</em>}
          </label>

          <label className="field">
            <span>Process</span>
            <textarea
              name="action"
              rows={9}
              defaultValue={(project?.action ?? []).join('\n')}
              required
            />
            <small>One step per line. Each becomes a numbered row.</small>
            {error('action') && <em className="field-error">{error('action')}</em>}
          </label>

          <label className="field">
            <span>Where this stops short</span>
            <textarea name="limitation" rows={3} defaultValue={project?.limitation ?? ''} />
            <small>
              Optional, and worth writing. Naming a boundary yourself reads as confidence.
            </small>
            {error('limitation') && <em className="field-error">{error('limitation')}</em>}
          </label>
        </section>

        <section className="admin-card">
          <h2>Key results</h2>
          <p className="muted">
            The first one becomes the headline number on the card, so put the tightest first.
          </p>

          <div className="metrics">
            {metrics.map((metric, index) => (
              <div className="metric-row" key={index}>
                <input
                  name="metric_label"
                  placeholder="Test cases"
                  defaultValue={metric.label}
                  aria-label={`Metric ${index + 1} label`}
                />
                <input
                  name="metric_value"
                  placeholder="26 passing"
                  defaultValue={metric.value}
                  aria-label={`Metric ${index + 1} value`}
                />
                <button
                  type="button"
                  className="admin-btn ghost small"
                  onClick={() => setMetrics(metrics.filter((_, i) => i !== index))}
                  aria-label={`Remove metric ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {error('metrics') && <em className="field-error">{error('metrics')}</em>}

          <button
            type="button"
            className="admin-btn ghost small"
            onClick={() => setMetrics([...metrics, { label: '', value: '' }])}
          >
            Add a metric
          </button>
        </section>

        <section className="admin-card">
          <h2>Links and cover</h2>

          <div className="row">
            <label className="field">
              <span>Repository</span>
              <input name="repo_url" defaultValue={project?.repo_url ?? ''} placeholder="https://" />
              {error('repo_url') && <em className="field-error">{error('repo_url')}</em>}
            </label>

            <label className="field">
              <span>Live site</span>
              <input name="live_url" defaultValue={project?.live_url ?? ''} placeholder="https://" />
              {error('live_url') && <em className="field-error">{error('live_url')}</em>}
            </label>
          </div>

          <label className="field">
            <span>Cover image URL</span>
            <input
              name="cover_image_url"
              value={resolvedCover}
              onChange={(event) => setCoverUrl(event.target.value)}
              placeholder="https://"
            />
            <small>Leave empty and the case study renders without a cover.</small>
            {error('cover_image_url') && (
              <em className="field-error">{error('cover_image_url')}</em>
            )}
          </label>

          {upload.error && <em className="field-error">{upload.error}</em>}
          {resolvedCover && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="cover-preview" src={resolvedCover} alt="Current cover" />
          )}
        </section>

        <section className="admin-card">
          <h2>Technologies</h2>
          <p className="muted">
            These become the chips on the card and on the case study. Manage the list itself under{' '}
            <Link href="/admin/stack">Stack</Link>.
          </p>

          {allTech.length === 0 ? (
            <p className="muted">
              No technologies defined yet. Add some under Stack and they will appear here.
            </p>
          ) : (
            CATEGORY_ORDER.map((category) => {
              const inCategory = allTech.filter((tech) => tech.category === category);
              if (inCategory.length === 0) return null;

              return (
                <div className="tech-picker" key={category}>
                  <h3>{CATEGORY_LABEL[category]}</h3>
                  <div className="tech-options">
                    {inCategory.map((tech) => (
                      <label className="tech-option" key={tech.id}>
                        <input
                          type="checkbox"
                          name="tech_id"
                          value={tech.id}
                          defaultChecked={selectedTechIds.includes(tech.id)}
                        />
                        <span>{tech.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="admin-card">
          <h2>Publishing</h2>

          <div className="row">
            <label className="field">
              <span>Order</span>
              <input
                name="sort_order"
                type="number"
                min={0}
                step={10}
                defaultValue={project?.sort_order ?? 0}
              />
              <small>Lower comes first.</small>
            </label>

            <label className="checkbox">
              <input
                name="is_published"
                type="checkbox"
                defaultChecked={project?.is_published ?? false}
              />
              <span>
                Published
                <small>Unpublished projects have no page at all, not a hidden one.</small>
              </span>
            </label>
          </div>
        </section>

        <div className="admin-actions">
          <button className="admin-btn primary" type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save and publish changes'}
          </button>
          <Link className="admin-btn ghost" href="/admin">
            Cancel
          </Link>
        </div>

        {hiddenErrors.length > 0 && (
          <ul className="field-error-list" role="alert">
            {hiddenErrors.map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        )}
      </form>

      {/* Kept outside the form above: nested forms are invalid HTML, and the
          upload has to complete before the project is saved anyway. */}
      <form className="admin-card upload" action={uploadAction}>
        <h2>Upload a cover</h2>
        <p className="muted">WebP, PNG, or JPEG. Up to 2 MB. Checked on the server.</p>
        <div className="row">
          <input type="file" name="file" accept={ALLOWED_IMAGE_TYPES.join(',')} />
          <button className="admin-btn ghost" type="submit" disabled={uploading}>
            {uploading ? 'Uploading\u2026' : 'Upload'}
          </button>
        </div>
      </form>
    </>
  );
}
