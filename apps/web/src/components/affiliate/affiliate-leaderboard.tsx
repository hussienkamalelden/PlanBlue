'use client';

import { Crown, Frown, Mail, Medal, Sparkles, Trophy } from 'lucide-react';

import { formatCommission } from '@/lib/api/strapi';
import type { Locale } from '@/lib/i18n/config';
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

const rankStyles = {
  1: {
    order: 'order-1 md:order-2',
    offset: 'md:-mt-4',
    medal: 'text-brand-secondary',
    ring: 'ring-brand-secondary',
    badge: 'bg-brand-secondary text-neutral-900',
    pedestal: 'h-16 sm:h-20 md:h-36 bg-brand-secondary/15',
    float: true,
    pulse: true,
    avatar: 'podium-first' as const,
    crown: true,
    commission:
      'animate-shimmer-gold bg-gradient-to-r from-brand-secondary via-brand-warm to-brand-secondary text-neutral-900 shadow-[0_8px_24px_rgba(247,185,12,0.45)] ring-2 ring-brand-secondary/60',
    commissionSize: 'text-xl sm:text-2xl md:text-3xl',
  },
  2: {
    order: 'order-2 md:order-1',
    offset: 'md:mt-6',
    medal: 'text-brand-silver',
    ring: 'ring-brand-silver',
    badge: 'bg-brand-silver text-white',
    pedestal: 'h-12 sm:h-14 md:h-20 bg-neutral-200/80',
    float: false,
    pulse: false,
    avatar: 'podium' as const,
    crown: false,
    commission:
      'bg-gradient-to-br from-neutral-50 via-white to-neutral-200 text-neutral-800 shadow-[0_4px_16px_rgba(148,163,184,0.35)] ring-2 ring-brand-silver/70',
    commissionSize: 'text-lg sm:text-xl md:text-2xl',
  },
  3: {
    order: 'order-3 md:order-3',
    offset: 'md:mt-8',
    medal: 'text-brand-orange',
    ring: 'ring-brand-orange',
    badge: 'bg-brand-orange text-white',
    pedestal: 'h-10 sm:h-12 md:h-16 bg-brand-orange/10',
    float: false,
    pulse: false,
    avatar: 'podium' as const,
    crown: false,
    commission:
      'bg-gradient-to-br from-brand-orange/25 via-brand-warm/20 to-brand-orange/15 text-brand-orange shadow-[0_4px_14px_rgba(214,133,39,0.3)] ring-2 ring-brand-orange/50',
    commissionSize: 'text-base sm:text-lg md:text-xl',
  },
} as const;

function getCommission(affiliate: StrapiAffiliate): number {
  return Number(affiliate.current_pending_commission ?? 0);
}

function RankIcon({ rank }: { rank: 1 | 2 | 3 }) {
  const style = rankStyles[rank];
  const className = `h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${style.medal}`;

  if (rank === 1) {
    return <Crown className={className} strokeWidth={2} aria-hidden />;
  }

  return <Medal className={className} strokeWidth={2} aria-hidden />;
}

function AffiliateEmail({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="mt-0.5 flex max-w-full items-center justify-center gap-1 truncate text-[11px] text-neutral-500 transition-colors hover:text-brand-primary sm:text-xs"
    >
      <Mail className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
      <span className="truncate">{email}</span>
    </a>
  );
}

function CommissionBadge({
  amount,
  locale,
  rank,
  variant,
}: {
  amount: number;
  locale: Locale;
  rank?: 1 | 2 | 3;
  variant: 'podium' | 'list';
}) {
  const hasCommission = amount > 0;
  const formatted = formatCommission(amount, locale);

  if (variant === 'podium' && rank) {
    const style = rankStyles[rank];
    return (
      <div
        className={`mt-2 inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 font-extrabold tabular-nums sm:mt-3 sm:px-5 sm:py-2.5 ${style.commission} ${style.commissionSize} ${rank === 1 ? 'animate-float-gentle' : ''}`}
      >
        {!hasCommission && (
          <Frown
            className="h-4 w-4 shrink-0 opacity-70"
            strokeWidth={2}
            aria-hidden
          />
        )}
        {formatted}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold tabular-nums sm:text-sm ${
        hasCommission
          ? 'bg-neutral-100 text-neutral-700'
          : 'bg-neutral-50 text-neutral-400'
      }`}
    >
      {!hasCommission && (
        <Frown className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
      )}
      {formatted}
    </span>
  );
}

function PodiumCard({
  affiliate,
  rank,
  delay,
}: PodiumSlot & { delay: string }) {
  const locale = useLocaleStore((state) => state.locale);
  const t = useTranslations();
  const commission = getCommission(affiliate);
  const style = rankStyles[rank];

  return (
    <article
      className={`animate-fade-up flex w-full flex-col items-center text-center ${style.order} ${style.offset}`}
      style={{ animationDelay: delay }}
    >
      <div
        className={`relative mb-3 sm:mb-4 ${style.float ? 'animate-float-gentle' : ''}`}
      >
        {style.pulse && (
          <span className="animate-pulse-ring absolute inset-0 rounded-full" />
        )}
        <div className="relative">
          {style.crown && (
            <Crown
              className={`absolute -top-5 left-1/2 h-5 w-5 -translate-x-1/2 sm:-top-6 sm:h-6 sm:w-6 md:h-7 md:w-7 ${style.medal}`}
              strokeWidth={2}
              aria-hidden
            />
          )}
          <AffiliateAvatar
            affiliate={affiliate}
            size={style.avatar}
            className={style.ring}
          />
        </div>
        <span
          className={`absolute -bottom-2 left-1/2 flex h-5 min-w-5 -translate-x-1/2 items-center justify-center rounded-full px-1.5 text-[10px] font-bold sm:h-6 sm:min-w-6 sm:px-2 sm:text-xs ${style.badge}`}
        >
          {rank}
        </span>
      </div>

      <div className="flex w-full max-w-[11rem] flex-col items-center px-1 sm:max-w-[12rem]">
        <div className="flex w-full items-center justify-center gap-1.5">
          <RankIcon rank={rank} />
          <h3 className="truncate text-sm font-semibold text-neutral-900 sm:text-base">
            {affiliate.name}
          </h3>
        </div>
        {affiliate.email && <AffiliateEmail email={affiliate.email} />}
      </div>

      <CommissionBadge
        amount={commission}
        locale={locale}
        rank={rank}
        variant="podium"
      />
      <p className="mt-1 text-[11px] text-neutral-500 sm:text-xs">
        {t.affiliates.pendingCommission}
      </p>

      <div
        className={`mt-4 w-full max-w-[10rem] rounded-t-lg sm:mt-5 sm:max-w-none ${style.pedestal}`}
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

  return (
    <li className="flex items-start justify-between gap-2 border-b border-neutral-100 py-2.5 last:border-0 sm:gap-4 sm:py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="w-5 shrink-0 text-xs tabular-nums text-neutral-400 sm:w-6 sm:text-sm">
            {rank}
          </span>
          <span className="truncate text-xs font-medium text-neutral-800 sm:text-sm">
            {affiliate.name}
          </span>
        </div>
        {affiliate.email && (
          <a
            href={`mailto:${affiliate.email}`}
            className="flex min-w-0 items-center gap-1 truncate ps-7 text-[11px] text-neutral-500 transition-colors hover:text-brand-primary sm:ps-9 sm:text-xs"
          >
            <Mail className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
            <span className="truncate">{affiliate.email}</span>
          </a>
        )}
      </div>
      <CommissionBadge amount={commission} locale={locale} variant="list" />
    </li>
  );
}

export function AffiliateLeaderboard({
  affiliates,
}: AffiliateLeaderboardProps) {
  const t = useTranslations();

  if (affiliates.length === 0) {
    return (
      <div className="py-16 text-center sm:py-20">
        <Trophy
          className="mx-auto h-8 w-8 text-neutral-300 sm:h-10 sm:w-10"
          strokeWidth={1.5}
        />
        <p className="mt-4 text-sm text-neutral-600 sm:text-base">
          {t.affiliates.empty}
        </p>
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

  const gridClass =
    topThree.length === 1
      ? 'max-w-[14rem] grid-cols-1'
      : topThree.length === 2
        ? 'max-w-md grid-cols-1 sm:max-w-lg sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-3';

  return (
    <div className="space-y-8 sm:space-y-12">
      <header className="px-1 text-center">
        <div className="mb-2 flex items-center justify-center gap-2 text-brand-primary">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          <span className="text-[10px] font-medium uppercase tracking-wider sm:text-xs">
            {t.affiliates.topThree}
          </span>
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl md:text-3xl">
          {t.affiliates.title}
        </h1>
      </header>

      <section className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-8 sm:rounded-2xl sm:px-6 sm:py-10 md:px-8 md:py-14">
        <div className="hidden sm:block">
          <FestivalConfetti />
        </div>
        <div
          className={`relative mx-auto grid w-full items-end gap-6 sm:gap-5 md:max-w-3xl md:gap-6 ${gridClass}`}
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

      {rest.length > 0 && (
        <section className="mx-auto w-full max-w-lg px-1">
          <h2 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-neutral-400 sm:mb-3 sm:text-xs">
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
