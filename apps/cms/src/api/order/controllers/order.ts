/**
 * order controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::order.order',
  ({ strapi }) => ({
    async resendEmails(ctx) {
      const { id: documentId } = ctx.params;

      if (!documentId) {
        return ctx.badRequest('Order id is required.');
      }

      try {
        const result = await strapi
          .service('api::order.order')
          .resendNotificationEmails(documentId);

        ctx.body = {
          data: {
            message: 'Order emails sent successfully with the latest details.',
            clientEmail: result.clientEmail,
            adminEmail: result.adminEmail,
          },
        };
      } catch (error: any) {
        return ctx.badRequest(
          error?.message ?? 'Failed to resend order emails.',
        );
      }
    },
  }),
);
