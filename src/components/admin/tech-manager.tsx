'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTech, saveTech, type ActionResult } from '@/lib/admin-actions';
import type { AdminTech } from '@/lib/admin-queries';
import { CATEGORY_LABEL, CATEGORY_ORDER } from '@/lib/types';

const EMPTY: ActionResult = {};

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
          <button className="admin-btn primary small" type="submit" disabled={saving}>
            {saving ? 'Saving\u2026' : 'Save'}
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
        <strong>{tech.name}</strong>
        {!tech.is_published && <span className="pill draft">Hidden</span>}
      </div>
      <span className="tech-order">order {tech.sort_order}</span>
      <div className="tech-controls">
        <button className="admin-btn ghost small" type="button" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button className="admin-btn ghost small" type="button" onClick={remove} disabled={busy}>
          {busy ? '\u2026' : 'Delete'}
        </button>
      </div>
      {error && <em className="field-error full">{error}</em>}
    </li>
  );
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
        It appears in the stack section straight away. To give it a brand logo, add an entry to
        <code> src/lib/brand-marks.ts</code> keyed by this exact name.
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
        <button className="admin-btn primary small" type="submit" disabled={pending}>
          {pending ? 'Adding\u2026' : 'Add'}
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
