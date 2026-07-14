import { Button } from '@strapi/design-system';
import { ArrowClockwise } from '@strapi/icons';
import {
  useFetchClient,
  useNotification,
  unstable_useContentManagerContext as useContentManagerContext,
} from '@strapi/strapi/admin';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const PRODUCT_UID = 'api::product.product';
const RESET_VIEWS_ENDPOINT = '/api/products/reset-views';

const ResetProductViewsButton = () => {
  const { slug: contextSlug } = useContentManagerContext();
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const slug = contextSlug ?? routeSlug;
  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  if (slug !== PRODUCT_UID) {
    return null;
  }

  const handleResetViews = async () => {
    const confirmed = window.confirm(
      'Reset views to 0 for ALL products? This cannot be undone.',
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await post(RESET_VIEWS_ENDPOINT);
      console.log(data);

      const updatedCount = data?.data?.updatedCount ?? 0;

      toggleNotification({
        type: 'success',
        message: `All product views reset to 0 (${updatedCount} records updated).`,
      });

      window.location.reload();
    } catch {
      toggleNotification({
        type: 'danger',
        message: 'Failed to reset product views. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      startIcon={<ArrowClockwise />}
      onClick={handleResetViews}
      loading={isLoading}
    >
      Reset all views
    </Button>
  );
};

export default ResetProductViewsButton;
