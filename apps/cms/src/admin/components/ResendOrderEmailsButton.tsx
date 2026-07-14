import { Button } from '@strapi/design-system';
import { ArrowClockwise } from '@strapi/icons';
import {
  useFetchClient,
  useNotification,
  unstable_useContentManagerContext as useContentManagerContext,
} from '@strapi/strapi/admin';
import { useState } from 'react';

const ORDER_UID = 'api::order.order';
const RESEND_EMAILS_ENDPOINT = '/api/orders';

const ResendOrderEmailsButton = () => {
  const { slug, id, isCreatingEntry } = useContentManagerContext();
  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  if (slug !== ORDER_UID || isCreatingEntry || !id) {
    return null;
  }

  const handleResendEmails = async () => {
    const confirmed = window.confirm(
      'Send updated order emails to the client and admin with the latest order details?',
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await post(`${RESEND_EMAILS_ENDPOINT}/${id}/resend-emails`);

      toggleNotification({
        type: 'success',
        message:
          data?.data?.message ??
          'Order emails sent successfully with the latest details.',
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        'Failed to resend order emails. Please try again.';

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
      variant="secondary"
      startIcon={<ArrowClockwise />}
      onClick={handleResendEmails}
      loading={isLoading}
    >
      Resend order emails
    </Button>
  );
};

export default ResendOrderEmailsButton;
