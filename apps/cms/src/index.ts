import type { Core } from '@strapi/strapi';

import { registerOrderStockDocumentMiddleware } from './api/order/utils/order-stock-sync';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    registerOrderStockDocumentMiddleware(strapi);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * Cron jobs, real-time hooks, and seed data go here — later steps.
   */
  bootstrap(/* { strapi } */) {},
};
