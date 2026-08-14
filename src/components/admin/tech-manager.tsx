'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteTech,
  saveTech,
  uploadTechIcon,
  type ActionResult,
} from '@/lib/admin-actions';
import { ALLOWED_IMAGE_TYPES } from '@/lib/validation';
import type { AdminTech } from '@/lib/admin-queries';
import { CATEGORY_LABEL, CATEGORY_ORDER } from '@/lib/types';

const EMPTY: ActionResult = {};

/** One icon field: a URL box plus an uploader that fills the box with the
 *  public URL. `state` carries the saved value so the preview tracks it. */
function IconField({
  defaultValue,
}: {
  defaultValue: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');
  const [upload, uploadAction, uploading] = useActionState(uploadTechIcon, {});
  const resolved = upload.url ?? url;

  return (
    <div className="tech-icon-field">
      <input
        name="icon_url"
        value={resolved}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="Brand logo URL (optional)"
        aria-label="Icon URL"
      />
      <form action={uploadAction} className="tech-icon-upload">
        <input type="file" name="file" accept={ALLOWED_IMAGE_TYPES.join(',')} />
        <button className="admin-btn ghost small" type="submit" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>
      {upload.error && <em className="field-error">{upload.error}</em>}
      {resolved && (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded logo
        <img className="tech-icon-preview" src={resolved} alt="" />
      )}
    </div>
  );
}

function TechRow({ tech }: { tech: AdminTech }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const [state, formAction, saving] = useActionState(saveTech.bind(null, tech.id), EMPTY);

  async function remove() {
    setBusy(true);
    const result = await deleteTech(tech.id);
    setBusy(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  if (editing) {
    return (
      <li className="tech-row editing">
        <form className="tech-form" action={formAction}>
          <input name="name" defaultValue={tech.name} aria-label="Name" required />
          <select name="category" defaultValue={tech.category} aria-label="Category">
            {CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABEL[category]}
              </option>
            ))}
          </select>
          <input
            name="sort_order"
            type="number"
            defaultValue={tech.sort_order}
            aria-label="Order"
            min={0}
            step={10}
          />
          <label className="inline-check">
            <input name="is_published" type="checkbox" defaultChecked={tech.is_published} />
            <span>Shown</span>
          </label>
          <IconField defaultValue={tech.icon_url} />
          <button className="admin-btn primary small" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            className="admin-btn ghost small"
            type="button"
            onClick={() => {
              setEditing(false);
              router.refresh();
            }}
          >
            Cancel
          </button>
        </form>
        {(state.error || state.fieldErrors?.name) && (
          <em className="field-error">{state.error ?? state.fieldErrors?.name}</em>
        )}
      </li>
    );
  }

  return (
    <li className="tech-row">
      <div className="tech-name">
        <TechChip name={tech.name} iconUrl={tech.icon_url} />
        {!tech.is_published && <span className="pill draft">Hidden</span>}
      </div>
      <span className="tech-order">order {tech.sort_order}</span>
      <div className="tech-controls">
        <button className="admin-btn ghost small" type="button" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button className="admin-btn ghost small" type="button" onClick={remove} disabled={busy}>
          {busy ? '…' : 'Delete'}
        </button>
      </div>
      {error && <em className="field-error full">{error}</em>}
    </li>
  );
}

/** Small inline mark so a saved logo is visible in the list without opening edit. */
function TechChip({ name, iconUrl }: { name: string; iconUrl: string | null }) {
  if (iconUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="tech-row-icon" src={iconUrl} alt="" width={20} height={20} />;
  }
  return <span className="tech-dot" aria-hidden="true" />;
}

function AddTechForm() {
  const [state, formAction, pending] = useActionState(saveTech.bind(null, null), EMPTY);
  const router = useRouter();

  return (
    <form
      className="admin-card"
      action={async (formData) => {
        await formAction(formData);
        router.refresh();
      }}
    >
      <h2>Add a technology</h2>
      <p className="muted">
        It appears in the stack section straight away. Give it a brand logo here, or leave the
        field empty to use the built-in mark.
      </p>

      <div className="tech-form add">
        <input name="name" placeholder="Docker" aria-label="Name" required />
        <select name="category" defaultValue="backend" aria-label="Category">
          {CATEGORY_ORDER.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABEL[category]}
            </option>
          ))}
        </select>
        <input
          name="sort_order"
          type="number"
          defaultValue={50}
          aria-label="Order"
          min={0}
          step={10}
        />
        <label className="inline-check">
          <input name="is_published" type="checkbox" defaultChecked />
          <span>Shown</span>
        </label>
        <IconField defaultValue={null} />
        <button className="admin-btn primary small" type="submit" disabled={pending}>
          {pending ? 'Adding…' : 'Add'}
        </button>
      </div>

      {(state.error || state.fieldErrors?.name) && (
        <em className="field-error">{state.error ?? state.fieldErrors?.name}</em>
      )}
    </form>
  );
}

export function TechManager({ items }: { items: AdminTech[] }) {
  const columns = CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  }));

  return (
    <>
      <AddTechForm />

      {columns.map((column) => (
        <section className="admin-card" key={column.category}>
          <h2>{CATEGORY_LABEL[column.category]}</h2>
          {column.items.length === 0 ? (
            <p className="muted">Nothing here yet. This category renders no column on the site.</p>
          ) : (
            <ul className="tech-list">
              {column.items.map((tech) => (
                <TechRow key={tech.id} tech={tech} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
