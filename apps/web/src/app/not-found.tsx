import { NotFoundView } from '@/components/ui/not-found-view';
import { getDictionary } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/get-locale';

export default async function NotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <NotFoundView
      title={t.notFoundPage.title}
      description={t.notFoundPage.description}
      buttonLabel={t.notFoundPage.backHome}
      buttonHref="/"
    />
  );
}
