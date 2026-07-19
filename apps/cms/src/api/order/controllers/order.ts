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

    async generateReport(ctx) {
      const { fromDate, toDate } = ctx.request.body as {
        fromDate?: string;
        toDate?: string;
      };

      if (!fromDate || !toDate) {
        return ctx.badRequest('fromDate and toDate are required.');
      }

      try {
        const { generateOrderReportExcel } = await import(
          '../utils/order-report'
        );
        const result = await generateOrderReportExcel(strapi, fromDate, toDate);

        ctx.set(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        ctx.set(
          'Content-Disposition',
          `attachment; filename="${result.filename}"`,
        );
        ctx.body = result.buffer;
      } catch (error: any) {
        strapi.log.error('[REPORT] Failed to generate report:', error);
        return ctx.badRequest(
          error?.message ?? 'Failed to generate report.',
        );
      }
    },
  }),
);
