/**
 * product controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::product.product',
  ({ strapi }) => ({
    async find(ctx) {
      const { data, meta } = await super.find(ctx);

      const sanitizedData = data.map((product: any) => {
        const basePrice = Number(product.price) || 0;
        const discountPercentage = product.discount_percentage || 0;
        const discountPrice =
          basePrice - basePrice * (discountPercentage / 100);

        return {
          ...product,
          discount_price: Number(discountPrice.toFixed(2)),
        };
      });

      return { data: sanitizedData, meta };
    },

    async findOne(ctx) {
      const { id } = ctx.params;

      try {
        const rows = await strapi.db
          .query('api::product.product')
          .findMany({ where: { documentId: id }, limit: 1 });

        if (rows.length > 0) {
          const currentViews = Number(rows[0].views ?? 0);
          await strapi.db.query('api::product.product').updateMany({
            where: { documentId: id },
            data: { views: currentViews + 1 },
          });
        }
      } catch (error) {
        strapi.log.error('Failed to increment product views:', error);
      }

      const { data } = await super.findOne(ctx);
      if (!data) return { data };

      const basePrice = Number(data.price) || 0;
      const discountPercentage = data.discount_percentage || 0;
      const discountPrice = basePrice - basePrice * (discountPercentage / 100);

      return {
        data: {
          ...data,
          discount_price: Number(discountPrice.toFixed(2)),
        },
      };
    },

    async resetViews(ctx) {
      try {
        const result = await strapi
          .service('api::product.product')
          .resetAllViews();

        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest('Failed to reset views', { error });
      }
    },
  }),
);
