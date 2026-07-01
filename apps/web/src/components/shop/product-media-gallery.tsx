'use client';

import Image from 'next/image';
import { useState } from 'react';

import { getMediaUrl, isVideoMedia } from '@/lib/api/strapi';
import { interpolate } from '@/lib/i18n/dictionary';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { StrapiMedia } from '@/lib/types/strapi';

type ProductMediaGalleryProps = {
  media: StrapiMedia[];
  alt: string;
};

export function ProductMediaGallery({ media, alt }: ProductMediaGalleryProps) {
  const t = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);

  if (media.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
        <span className="text-4xl">🧸</span>
      </div>
    );
  }

  const activeMedia = media[activeIndex];
  const activeIsVideo = isVideoMedia(activeMedia.mime);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
        {activeIsVideo ? (
          <video
            key={activeMedia.url}
            src={getMediaUrl(activeMedia.url)}
            controls
            playsInline
            className="h-full w-full object-contain"
            aria-label={activeMedia.name || alt}
          />
        ) : (
          <Image
            key={activeMedia.url}
            src={getMediaUrl(activeMedia.url)}
            alt={activeMedia.name || alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={activeIndex === 0}
          />
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((item, index) => {
            const isVideo = isVideoMedia(item.mime);
            const isActive = index === activeIndex;
            const label = isVideo
              ? interpolate(t.productDetail.mediaVideo, { index: index + 1 })
              : interpolate(t.productDetail.mediaImage, { index: index + 1 });

            return (
              <button
                key={`${item.url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={label}
                aria-current={isActive ? 'true' : undefined}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  isActive
                    ? 'border-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {isVideo ? (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-neutral-600">
                    <span aria-hidden className="text-lg">
                      ▶
                    </span>
                  </div>
                ) : (
                  <Image
                    src={getMediaUrl(item.url)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
