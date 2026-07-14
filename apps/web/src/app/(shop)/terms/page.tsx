import { getDictionary } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/get-locale';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.terms.title,
    description: t.terms.metaDescription,
  };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900">{t.terms.title}</h1>
        <p className="mt-2 text-sm text-neutral-500">{t.terms.lastUpdated}</p>
        <p className="mt-4 text-neutral-600">{t.terms.intro}</p>
      </header>

      <div className="space-y-8">
        {t.terms.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-neutral-900">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph, index) => (
                <p
                  key={`${section.title}-${index}`}
                  className="text-sm leading-relaxed text-neutral-600"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
