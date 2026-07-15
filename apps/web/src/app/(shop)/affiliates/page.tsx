import { AffiliateLeaderboard } from '@/components/affiliate/affiliate-leaderboard';
import { AffiliatePasswordGate } from '@/components/affiliate/affiliate-password-gate';
import { fetchAffiliates } from '@/lib/api/strapi.server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Leaderboard',
};

export default async function AffiliatesPage() {
  const affiliates = await fetchAffiliates();

  return (
    <main className="pb-medium-container pb-affiliate-page">
      <AffiliatePasswordGate>
        <AffiliateLeaderboard affiliates={affiliates} />
      </AffiliatePasswordGate>
    </main>
  );
}
