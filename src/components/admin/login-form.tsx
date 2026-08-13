'use client';

import { useActionState } from 'react';
import { signIn, type ActionResult } from '@/lib/admin-actions';

const EMPTY: ActionResult = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, EMPTY);

  return (
    <form className="admin-card login" action={formAction}>
      <h1>Sign in</h1>
      <p className="muted">This dashboard has one account. There is no sign-up.</p>

      <input type="hidden" name="next" value={next} />

      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email ?? ''}
          key={state.email ?? 'empty'}
          required
          autoFocus
          disabled={pending}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </label>

      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <button className="admin-btn primary" type="submit" disabled={pending}>
        {pending ? 'Checking\u2026' : 'Sign in'}
      </button>
    </form>
  );
}
