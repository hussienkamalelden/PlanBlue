import { Button } from '@strapi/design-system';
import { CheckCircle } from '@strapi/icons';
import {
  useFetchClient,
  useNotification,
  unstable_useContentManagerContext as useContentManagerContext,
} from '@strapi/strapi/admin';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const AFFILIATE_UID = 'api::affiliate.affiliate';
const PAYOUT_ALL_ENDPOINT = '/api/affiliates/payout-all';

const AffiliatePayoutAllButton = () => {
  const { slug: contextSlug } = useContentManagerContext();
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const slug = contextSlug ?? routeSlug;
  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  if (slug !== AFFILIATE_UID) {
    return null;
  }

  const handlePayoutAll = async () => {
    const confirmed = window.confirm(
      'Pay out pending commission for ALL affiliates?\n\n' +
        'Each affiliate\'s current_pending_commission will be added to total_paid_commission and reset to 0.',
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await post(PAYOUT_ALL_ENDPOINT);

      const updatedCount = data?.updatedCount ?? 0;
      const totalPaidOut = data?.totalPaidOut ?? 0;

      toggleNotification({
        type: 'success',
        message: `Paid out ${totalPaidOut} EGP across ${updatedCount} affiliate(s).`,
      });

      window.location.reload();
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        'Failed to process bulk payout. Please try again.';

      toggleNotification({
        type: 'danger',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="success"
      startIcon={<CheckCircle />}
      onClick={handlePayoutAll}
      loading={isLoading}
    >
      Pay out all pending
    </Button>
  );
};

export default AffiliatePayoutAllButton;
