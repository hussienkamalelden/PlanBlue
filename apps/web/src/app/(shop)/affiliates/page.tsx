import { AffiliateLeaderboard } from '@/components/affiliate/affiliate-leaderboard';
import { fetchAffiliates } from '@/lib/api/strapi.server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Leaderboard',
};

export default async function AffiliatesPage() {
  const affiliates = await fetchAffiliates();

  return (
    <main className="pb-large-container py-6 sm:py-10">
      <AffiliateLeaderboard affiliates={affiliates} />
    </main>
  );
}
