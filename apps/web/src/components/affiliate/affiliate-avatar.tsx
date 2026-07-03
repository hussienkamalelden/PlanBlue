'use client';

import Image from 'next/image';

import { getMediaUrl } from '@/lib/api/strapi';
import type { StrapiAffiliate } from '@/lib/types/strapi';

type AffiliateAvatarProps = {
  affiliate: StrapiAffiliate;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'podium' | 'podium-first';
  className?: string;
};

const sizeMap = {
  sm: { box: 'h-10 w-10', text: 'text-sm', px: 40, sizes: '40px' },
  md: { box: 'h-16 w-16', text: 'text-xl', px: 64, sizes: '64px' },
  lg: { box: 'h-24 w-24', text: 'text-2xl', px: 96, sizes: '96px' },
  xl: { box: 'h-32 w-32', text: 'text-3xl', px: 128, sizes: '128px' },
  podium: {
    box: 'h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24',
    text: 'text-lg sm:text-xl md:text-2xl',
    px: 96,
    sizes: '(max-width: 640px) 64px, (max-width: 768px) 80px, 96px',
  },
  'podium-first': {
    box: 'h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32',
    text: 'text-xl sm:text-2xl md:text-3xl',
    px: 128,
    sizes: '(max-width: 640px) 80px, (max-width: 768px) 96px, 128px',
  },
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
        className={`relative shrink-0 overflow-hidden rounded-full ring-2 ${dimensions.box} ${className}`}
      >
        <Image
          src={getMediaUrl(affiliate.avatar.url)}
          alt={affiliate.avatar.name || affiliate.name}
          width={dimensions.px}
          height={dimensions.px}
          sizes={dimensions.sizes}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-neutral-100 ring-2 ${dimensions.box} ${dimensions.text} font-semibold text-neutral-600 ${className}`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
