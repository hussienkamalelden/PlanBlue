"use client";

import { useTranslations } from "@/lib/i18n/use-translations";
import type { StrapiCategory } from "@/lib/types/strapi";

type CategoryNavProps = {
  categories: StrapiCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
};

export function CategoryNav({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  const t = useTranslations();

  return (
    <section aria-label={t.category.title}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {t.category.title}
      </h2>

      <ul className="flex flex-wrap gap-2">
        <li>
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              selectedCategoryId === null
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
            }`}
          >
            {t.category.all}
          </button>
        </li>

        {categories.map((category) => (
          <li key={category.documentId}>
            <button
              type="button"
              onClick={() => onSelectCategory(category.documentId)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                selectedCategoryId === category.documentId
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
              }`}
            >
              {category.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
