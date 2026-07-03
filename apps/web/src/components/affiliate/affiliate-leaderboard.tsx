'use client';

import { Crown, Frown, Medal, Sparkles, Trophy } from 'lucide-react';

import { formatPrice } from '@/lib/api/strapi';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { StrapiAffiliate } from '@/lib/types/strapi';
import { useLocaleStore } from '@/stores/locale-store';

import { AffiliateAvatar } from './affiliate-avatar';
import { FestivalConfetti } from './festival-confetti';

type AffiliateLeaderboardProps = {
  affiliates: StrapiAffiliate[];
};

type PodiumSlot = {
  affiliate: StrapiAffiliate;
  rank: 1 | 2 | 3;
};

function getCommission(affiliate: StrapiAffiliate): number {
  return Number(affiliate.current_pending_commission ?? 0);
}

function RankIcon({ rank }: { rank: 1 | 2 | 3 }) {
  if (rank === 1) {
    return <Crown className="h-5 w-5 text-brand-primary" strokeWidth={2} />;
  }
  return <Medal className="h-5 w-5 text-neutral-400" strokeWidth={2} />;
}

function PodiumCard({
  affiliate,
  rank,
  delay,
}: PodiumSlot & { delay: string }) {
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslations();
  const commission = getCommission(affiliate);
  const hasCommission = commission > 0;
  const isFirst = rank === 1;

  return (
    <article
      className={`animate-fade-up flex flex-col items-center text-center ${isFirst ? 'md:-mt-4' : 'md:mt-6'}`}
      style={{ animationDelay: delay }}
    >
      <div className={`relative mb-4 ${isFirst ? 'animate-float-gentle' : ''}`}>
        {isFirst && (
          <span className="animate-pulse-ring absolute inset-0 rounded-full" />
        )}
        <div className="relative">
          {isFirst && (
            <Crown
              className="absolute -top-7 left-1/2 h-7 w-7 -translate-x-1/2 text-brand-primary"
              strokeWidth={2}
              aria-hidden
            />
          )}
          <AffiliateAvatar
            affiliate={affiliate}
            size={isFirst ? 'xl' : 'lg'}
            className={isFirst ? 'ring-brand-primary' : ''}
          />
        </div>
        <span
          className={`absolute -bottom-2 left-1/2 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-full px-2 text-xs font-bold ${
            isFirst
              ? 'bg-brand-primary text-white'
              : 'bg-neutral-200 text-neutral-700'
          }`}
        >
          {rank}
        </span>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <RankIcon rank={rank} />
        <h3 className="max-w-[10rem] truncate text-sm font-semibold text-neutral-900 md:text-base">
          {affiliate.name}
        </h3>
      </div>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-lg font-bold text-neutral-900 md:text-xl">
        {!hasCommission && (
          <Frown
            className="h-4 w-4 text-neutral-400"
            strokeWidth={2}
            aria-label="no commission"
          />
        )}
        {formatPrice(commission, locale)}
      </p>
      <p className="mt-0.5 text-xs text-neutral-500">
        {t.affiliates.pendingCommission}
      </p>

      <div
        className={`mt-5 w-full rounded-t-lg ${
          isFirst ? 'h-28 bg-brand-primary/10 md:h-36' : 'h-16 bg-neutral-100 md:h-20'
        }`}
      />
    </article>
  );
}

function AffiliateListRow({
  affiliate,
  rank,
}: {
  affiliate: StrapiAffiliate;
  rank: number;
}) {
  const locale = useLocaleStore((state) => state.locale);
  const commission = getCommission(affiliate);
  const hasCommission = commission > 0;

  return (
    <li className="flex items-center justify-between gap-4 border-b border-neutral-100 py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="w-6 shrink-0 text-sm tabular-nums text-neutral-400">
          {rank}
        </span>
        <span className="truncate text-sm text-neutral-800">
          {affiliate.name}
        </span>
      </div>
      <span className="flex shrink-0 items-center gap-1.5 text-sm tabular-nums text-neutral-700">
        {!hasCommission && (
          <Frown className="h-3.5 w-3.5 text-neutral-400" strokeWidth={2} />
        )}
        {formatPrice(commission, locale)}
      </span>
    </li>
  );
}

export function AffiliateLeaderboard({ affiliates }: AffiliateLeaderboardProps) {
  const t = useTranslations();

  if (affiliates.length === 0) {
    return (
      <div className="py-20 text-center">
        <Trophy className="mx-auto h-10 w-10 text-neutral-300" strokeWidth={1.5} />
        <p className="mt-4 text-neutral-600">{t.affiliates.empty}</p>
      </div>
    );
  }

  const topThree = affiliates.slice(0, 3);
  const rest = affiliates.slice(3);

  const podiumOrder: PodiumSlot[] =
    topThree.length >= 3
      ? [
          { affiliate: topThree[1], rank: 2 },
          { affiliate: topThree[0], rank: 1 },
          { affiliate: topThree[2], rank: 3 },
        ]
      : topThree.map((affiliate, index) => ({
          affiliate,
          rank: (index + 1) as 1 | 2 | 3,
        }));

  const delays = ['0.1s', '0.25s', '0.4s'];

  return (
    <div className="space-y-12">
      <header className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2 text-brand-primary">
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          <span className="text-xs font-medium uppercase tracking-wider">
            {t.affiliates.topThree}
          </span>
          <Sparkles className="h-4 w-4" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">
          {t.affiliates.title}
        </h1>
      </header>

      {/* Top 3 — main focus */}
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-10 md:px-8 md:py-14">
        <FestivalConfetti />
        <div
          className={`relative mx-auto grid max-w-3xl gap-8 md:items-end md:gap-6 ${
            topThree.length === 1
              ? 'max-w-xs grid-cols-1'
              : topThree.length === 2
                ? 'max-w-lg grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {podiumOrder.map(({ affiliate, rank }, index) => (
            <PodiumCard
              key={affiliate.documentId}
              affiliate={affiliate}
              rank={rank}
              delay={delays[index] ?? '0s'}
            />
          ))}
        </div>
      </section>

      {/* Rest — minimal list */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-lg">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
            {t.affiliates.allAffiliates}
          </h2>
          <ul>
            {rest.map((affiliate, index) => (
              <AffiliateListRow
                key={affiliate.documentId}
                affiliate={affiliate}
                rank={index + 4}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
