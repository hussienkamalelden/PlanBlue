/**
 * product service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService(
  'api::product.product',
  ({ strapi }) => ({
    async resetAllViews() {
      const result = await strapi.db.query('api::product.product').updateMany({
        where: {},
        data: { views: 0 },
      });

      return { updatedCount: result.count ?? 0 };
    },
  }),
);
