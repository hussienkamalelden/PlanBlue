'use client';

import { X } from 'lucide-react';

import { useTranslations } from '@/lib/i18n/use-translations';
import type { ActiveFilterTag } from '@/lib/shop/filters';

type ActiveFilterTagsProps = {
  tags: ActiveFilterTag[];
  onRemove: (tag: ActiveFilterTag) => void;
};

export function ActiveFilterTags({ tags, onRemove }: ActiveFilterTagsProps) {
  const t = useTranslations();

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/10 py-1 ps-3 pe-1.5 text-sm font-medium text-brand-primary"
        >
          <span>{tag.label}</span>
          <button
            type="button"
            onClick={() => onRemove(tag)}
            aria-label={`${t.shop.removeFilter}: ${tag.label}`}
            className="flex h-5 w-5 items-center justify-center rounded-full text-brand-primary/70 transition-colors hover:bg-brand-primary/20 hover:text-brand-primary"
          >
            <X className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </span>
      ))}
    </div>
  );
}
