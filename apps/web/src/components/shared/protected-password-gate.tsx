'use client';

import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { Lock } from 'lucide-react';

type ProtectedPasswordGateLabels = {
  title: string;
  subtitle: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submit: string;
  checking: string;
  invalidPassword: string;
};

type ProtectedPasswordGateProps = {
  children: ReactNode;
  passwordInputId: string;
  labels: ProtectedPasswordGateLabels;
  isAuthenticated: () => boolean;
  markAuthenticated: () => void;
  verifyPassword: (password: string) => Promise<boolean>;
};

export function ProtectedPasswordGate({
  children,
  passwordInputId,
  labels,
  isAuthenticated,
  markAuthenticated,
  verifyPassword,
}: ProtectedPasswordGateProps) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setReady(true);
  }, [isAuthenticated]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setError(labels.invalidPassword);
      return;
    }

    setSubmitting(true);

    try {
      const valid = await verifyPassword(trimmedPassword);

      if (!valid) {
        setError(labels.invalidPassword);
        return;
      }

      markAuthenticated();
      setAuthenticated(true);
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="pb-protected-gate pb-protected-gate--loading">
        <p className="pb-protected-gate__loading">{labels.checking}</p>
      </div>
    );
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="pb-protected-gate">
      <div className="pb-protected-gate__card">
        <div className="pb-protected-gate__icon-wrap">
          <Lock aria-hidden size={28} strokeWidth={2.2} />
        </div>

        <h1 className="pb-protected-gate__title">{labels.title}</h1>
        <p className="pb-protected-gate__subtitle">{labels.subtitle}</p>

        <form className="pb-protected-gate__form" onSubmit={handleSubmit}>
          <label className="pb-protected-gate__label" htmlFor={passwordInputId}>
            {labels.passwordLabel}
          </label>
          <input
            id={passwordInputId}
            className="pb-protected-gate__input"
            type="password"
            autoComplete="current-password"
            placeholder={labels.passwordPlaceholder}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
          />

          {error ? (
            <p className="pb-protected-gate__error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="pb-cart-summary__btn pb-cart-summary__btn--primary pb-protected-gate__submit"
            disabled={submitting}
          >
            {submitting ? labels.checking : labels.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
