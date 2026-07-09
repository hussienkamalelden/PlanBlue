import { NotFoundView } from '@/components/ui/not-found-view';
import { getDictionary } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/get-locale';

export default async function ShopItemNotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <NotFoundView
      title={t.shopItemDetail.notFound}
      description={t.shopItemDetail.notFoundDescription}
      buttonLabel={t.shopItemDetail.backToShop}
      buttonHref="/shop"
    />
  );
}
