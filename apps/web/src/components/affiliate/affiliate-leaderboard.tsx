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

const rankClass = {
  1: 'pb-affiliate-podium__card--first',
  2: 'pb-affiliate-podium__card--second',
  3: 'pb-affiliate-podium__card--third',
} as const;

function getCommission(affiliate: StrapiAffiliate): number {
  return Number(affiliate.current_pending_commission ?? 0);
}

function RankIcon({ rank }: { rank: 1 | 2 | 3 }) {
  const className = `pb-affiliate-podium__rank-icon pb-affiliate-podium__rank-icon--${rank}`;

  if (rank === 1) {
    return <Crown className={className} strokeWidth={2} aria-hidden />;
  }

  return <Medal className={className} strokeWidth={2} aria-hidden />;
}

function AffiliateEmail({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className="pb-affiliate-podium__email">
      <Mail className="pb-affiliate-podium__email-icon" strokeWidth={2} aria-hidden />
      <span>{email}</span>
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
    return (
      <div
        className={`pb-affiliate-podium__commission pb-affiliate-podium__commission--${rank} ${rank === 1 ? 'animate-shimmer-gold' : ''}`}
      >
        {!hasCommission && (
          <Frown className="pb-affiliate-podium__commission-icon" strokeWidth={2} aria-hidden />
        )}
        {formatted}
      </div>
    );
  }

  return (
    <span
      className={`pb-affiliate-list__commission ${hasCommission ? 'pb-affiliate-list__commission--active' : 'pb-affiliate-list__commission--empty'}`}
    >
      {!hasCommission && (
        <Frown className="pb-affiliate-list__commission-icon" strokeWidth={2} aria-hidden />
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

  return (
    <article
      className={`pb-affiliate-podium__card animate-fade-up ${rankClass[rank]}`}
      style={{ animationDelay: delay }}
    >
      <div className="pb-affiliate-podium__avatar-wrap">
        {rank === 1 && <span className="animate-pulse-ring pb-affiliate-podium__pulse" />}
        <div
          className={`pb-affiliate-podium__avatar-inner ${rank === 1 ? 'animate-float-gentle' : ''}`}
        >
          {rank === 1 && (
            <Crown className="pb-affiliate-podium__crown" strokeWidth={2} aria-hidden />
          )}
          <AffiliateAvatar
            affiliate={affiliate}
            size={rank === 1 ? 'podium-first' : 'podium'}
            className={
              rank === 1
                ? 'ring-brand-secondary'
                : rank === 2
                  ? 'ring-brand-silver'
                  : 'ring-brand-orange'
            }
          />
        </div>
        <span className={`pb-affiliate-podium__rank-badge pb-affiliate-podium__rank-badge--${rank}`}>
          {rank}
        </span>
      </div>

      <div className="pb-affiliate-podium__info">
        <div className="pb-affiliate-podium__name-row">
          <RankIcon rank={rank} />
          <h3 className="pb-affiliate-podium__name">{affiliate.name}</h3>
        </div>
        {affiliate.email && <AffiliateEmail email={affiliate.email} />}
      </div>

      <CommissionBadge
        amount={commission}
        locale={locale}
        rank={rank}
        variant="podium"
      />
      <p className="pb-affiliate-podium__commission-label">
        {t.affiliates.pendingCommission}
      </p>

      <div className={`pb-affiliate-podium__pedestal pb-affiliate-podium__pedestal--${rank}`} />
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
    <li className="pb-affiliate-list__row">
      <span className="pb-affiliate-list__rank">{rank}</span>
      <div className="pb-affiliate-list__main">
        <span className="pb-affiliate-list__name">{affiliate.name}</span>
        {affiliate.email && (
          <a href={`mailto:${affiliate.email}`} className="pb-affiliate-list__email">
            <Mail className="pb-affiliate-list__email-icon" strokeWidth={2} aria-hidden />
            <span>{affiliate.email}</span>
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
      <section className="pb-affiliate">
        <div className="pb-affiliate__empty">
          <Trophy className="pb-affiliate__empty-icon" strokeWidth={1.5} />
          <p className="pb-affiliate__empty-text">{t.affiliates.empty}</p>
        </div>
      </section>
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

  const podiumGridClass =
    topThree.length === 1
      ? 'pb-affiliate-podium__grid--one'
      : topThree.length === 2
        ? 'pb-affiliate-podium__grid--two'
        : 'pb-affiliate-podium__grid--three';

  return (
    <section className="pb-affiliate">
      <header className="pb-affiliate__header">
        <h1 className="pb-affiliate__title">{t.affiliates.title}</h1>
        <p className="pb-affiliate__subtitle">{t.affiliates.subtitle}</p>
      </header>

      <section className="pb-affiliate-podium">
        <div className="pb-affiliate-podium__panel">
          <div className="pb-affiliate-podium__heading">
            <Sparkles className="pb-affiliate-podium__heading-icon" strokeWidth={2} aria-hidden />
            <span>{t.affiliates.topThree}</span>
            <Sparkles className="pb-affiliate-podium__heading-icon" strokeWidth={2} aria-hidden />
          </div>

          <div className="pb-affiliate-podium__confetti">
            <FestivalConfetti />
          </div>
          <div className={`pb-affiliate-podium__grid ${podiumGridClass}`}>
            {podiumOrder.map(({ affiliate, rank }, index) => (
              <PodiumCard
                key={affiliate.documentId}
                affiliate={affiliate}
                rank={rank}
                delay={delays[index] ?? '0s'}
              />
            ))}
          </div>
        </div>
      </section>

      {rest.length > 0 && (
        <section className="pb-affiliate-list">
          <h2 className="pb-affiliate-list__title">{t.affiliates.allAffiliates}</h2>
          <ul className="pb-affiliate-list__panel">
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
    </section>
  );
}
