'use client';

import Image from 'next/image';

import { getMediaUrl } from '@/lib/api/strapi';
import type { StrapiAffiliate } from '@/lib/types/strapi';

type AffiliateAvatarProps = {
  affiliate: StrapiAffiliate;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const sizeMap = {
  sm: { box: 'h-10 w-10', text: 'text-sm', px: 40 },
  md: { box: 'h-16 w-16', text: 'text-xl', px: 64 },
  lg: { box: 'h-24 w-24', text: 'text-2xl', px: 96 },
  xl: { box: 'h-32 w-32', text: 'text-3xl', px: 128 },
};

export function AffiliateAvatar({
  affiliate,
  size = 'md',
  className = 'ring-neutral-200',
}: AffiliateAvatarProps) {
  const dimensions = sizeMap[size];
  const initial = affiliate.name.trim().charAt(0).toUpperCase() || '?';

  if (affiliate.avatar?.url) {
    return (
      <div
        className={`relative overflow-hidden rounded-full ring-2 ${dimensions.box} ${className}`}
      >
        <Image
          src={getMediaUrl(affiliate.avatar.url)}
          alt={affiliate.avatar.name || affiliate.name}
          width={dimensions.px}
          height={dimensions.px}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-neutral-100 ring-2 ${dimensions.box} ${dimensions.text} font-semibold text-neutral-600 ${className}`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
