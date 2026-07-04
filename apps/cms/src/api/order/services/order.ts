/**
 * order service
 */

import { factories } from '@strapi/strapi';

import { sendOrderNotificationEmails } from '../utils/order-emails';

export default factories.createCoreService('api::order.order', ({ strapi }) => ({
  async resendNotificationEmails(documentId: string) {
    return sendOrderNotificationEmails(strapi, documentId, { isUpdate: true });
  },
}));
