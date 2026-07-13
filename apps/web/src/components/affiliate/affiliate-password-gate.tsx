'use client';

import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { Lock } from 'lucide-react';

import {
  isAffiliateAuthenticated,
  markAffiliateAuthenticated,
  verifyAffiliatePassword,
} from '@/lib/affiliate/affiliate-auth';
import { useTranslations } from '@/lib/i18n/use-translations';

type AffiliatePasswordGateProps = {
  children: ReactNode;
};

export function AffiliatePasswordGate({ children }: AffiliatePasswordGateProps) {
  const t = useTranslations();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAuthenticated(isAffiliateAuthenticated());
    setReady(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setError(t.affiliates.gate.invalidPassword);
      return;
    }

    setSubmitting(true);

    try {
      const valid = await verifyAffiliatePassword(trimmedPassword);

      if (!valid) {
        setError(t.affiliates.gate.invalidPassword);
        return;
      }

      markAffiliateAuthenticated();
      setAuthenticated(true);
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="pb-affiliate-gate pb-affiliate-gate--loading">
        <p className="pb-affiliate-gate__loading">{t.affiliates.gate.checking}</p>
      </div>
    );
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="pb-affiliate-gate">
      <div className="pb-affiliate-gate__card">
        <div className="pb-affiliate-gate__icon-wrap">
          <Lock aria-hidden size={28} strokeWidth={2.2} />
        </div>

        <h1 className="pb-affiliate-gate__title">{t.affiliates.gate.title}</h1>
        <p className="pb-affiliate-gate__subtitle">{t.affiliates.gate.subtitle}</p>

        <form className="pb-affiliate-gate__form" onSubmit={handleSubmit}>
          <label className="pb-affiliate-gate__label" htmlFor="affiliate-gate-password">
            {t.affiliates.gate.passwordLabel}
          </label>
          <input
            id="affiliate-gate-password"
            className="pb-affiliate-gate__input"
            type="password"
            autoComplete="current-password"
            placeholder={t.affiliates.gate.passwordPlaceholder}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
          />

          {error ? (
            <p className="pb-affiliate-gate__error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="pb-cart-summary__btn pb-cart-summary__btn--primary pb-affiliate-gate__submit"
            disabled={submitting}
          >
            {submitting ? t.affiliates.gate.checking : t.affiliates.gate.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
