'use client';

import { useMemo, type ReactNode } from 'react';

import { ProtectedPasswordGate } from '@/components/shared/protected-password-gate';
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

  const labels = useMemo(
    () => ({
      title: t.affiliates.gate.title,
      subtitle: t.affiliates.gate.subtitle,
      passwordLabel: t.affiliates.gate.passwordLabel,
      passwordPlaceholder: t.affiliates.gate.passwordPlaceholder,
      submit: t.affiliates.gate.submit,
      checking: t.affiliates.gate.checking,
      invalidPassword: t.affiliates.gate.invalidPassword,
    }),
    [t],
  );

  return (
    <ProtectedPasswordGate
      passwordInputId="affiliate-gate-password"
      labels={labels}
      isAuthenticated={isAffiliateAuthenticated}
      markAuthenticated={markAffiliateAuthenticated}
      verifyPassword={verifyAffiliatePassword}
    >
      {children}
    </ProtectedPasswordGate>
  );
}
