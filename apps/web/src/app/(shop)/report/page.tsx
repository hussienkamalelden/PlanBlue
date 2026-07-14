import { ReportPasswordGate } from '@/components/report/report-password-gate';
import { ReportView } from '@/components/report/report-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report',
};

export default function ReportPage() {
  return (
    <main className="pb-large-container py-6 sm:py-10">
      <ReportPasswordGate>
        <ReportView />
      </ReportPasswordGate>
    </main>
  );
}
