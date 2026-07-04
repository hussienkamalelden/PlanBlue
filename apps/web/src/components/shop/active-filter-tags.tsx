'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import type { ActiveFilterTag } from '@/lib/product/filters';

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
    <div className="mb-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 py-1 ps-3 pe-1.5 text-sm text-neutral-800"
        >
          <span>{tag.label}</span>
          <button
            type="button"
            onClick={() => onRemove(tag)}
            aria-label={`${t.products.removeFilter}: ${tag.label}`}
            className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
