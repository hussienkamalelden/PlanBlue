'use client';

import { useMemo, type ReactNode } from 'react';

import { ProtectedPasswordGate } from '@/components/shared/protected-password-gate';
import {
  isReportAuthenticated,
  markReportAuthenticated,
  verifyReportPassword,
} from '@/lib/report/report-auth';
import { useTranslations } from '@/lib/i18n/use-translations';

type ReportPasswordGateProps = {
  children: ReactNode;
};

export function ReportPasswordGate({ children }: ReportPasswordGateProps) {
  const t = useTranslations();

  const labels = useMemo(
    () => ({
      title: t.report.gate.title,
      subtitle: t.report.gate.subtitle,
      passwordLabel: t.report.gate.passwordLabel,
      passwordPlaceholder: t.report.gate.passwordPlaceholder,
      submit: t.report.gate.submit,
      checking: t.report.gate.checking,
      invalidPassword: t.report.gate.invalidPassword,
    }),
    [t],
  );

  return (
    <ProtectedPasswordGate
      passwordInputId="report-gate-password"
      labels={labels}
      isAuthenticated={isReportAuthenticated}
      markAuthenticated={markReportAuthenticated}
      verifyPassword={verifyReportPassword}
    >
      {children}
    </ProtectedPasswordGate>
  );
}
