'use client';

import Image from 'next/image';
import { useState } from 'react';

import { getMediaThumbnailUrl, getMediaUrl, isVideoMedia } from '@/lib/api/strapi';
import { interpolate } from '@/lib/i18n/dictionary';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { StrapiMedia } from '@/lib/types/strapi';

type ShopItemMediaGalleryProps = {
  media: StrapiMedia[];
  alt: string;
};

export function ShopItemMediaGallery({ media, alt }: ShopItemMediaGalleryProps) {
  const t = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);

  if (media.length === 0) {
    return (
      <div className="pb-product-gallery">
        <div className="pb-product-gallery__main pb-product-gallery__main--empty">
          <span className="text-4xl" aria-hidden="true">
            🧸
          </span>
        </div>
      </div>
    );
  }

  const activeMedia = media[activeIndex];
  const activeIsVideo = isVideoMedia(activeMedia.mime);

  return (
    <div className="pb-product-gallery">
      <div className="pb-product-gallery__inner">
        {media.length > 1 && (
          <ul className="pb-product-gallery__thumbs">
            {media.map((entry, index) => {
              const isVideo = isVideoMedia(entry.mime);
              const isActive = index === activeIndex;
              const label = isVideo
                ? interpolate(t.shopItemDetail.mediaVideo, { index: index + 1 })
                : interpolate(t.shopItemDetail.mediaImage, { index: index + 1 });
              const thumbUrl = getMediaThumbnailUrl(entry, media);

              return (
                <li key={`${entry.url}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={label}
                    aria-current={isActive ? 'true' : undefined}
                    className={`pb-product-gallery__thumb${isActive ? ' pb-product-gallery__thumb--active' : ''}`}
                  >
                    {thumbUrl ? (
                      <>
                        <Image
                          src={thumbUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="88px"
                        />
                        {isVideo && (
                          <span className="pb-product-gallery__thumb-play" aria-hidden="true">
                            ▶
                          </span>
                        )}
                      </>
                    ) : isVideo ? (
                      <span className="pb-product-gallery__thumb-video" aria-hidden="true">
                        ▶
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="pb-product-gallery__main">
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
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={activeIndex === 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
