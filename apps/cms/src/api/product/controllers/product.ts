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

      // 1. Increment the views counter directly in the database using Document Service
      // We use a try-catch to ensure that if view-counting fails, the product still loads
      try {
        const currentProduct = await strapi
          .documents('api::product.product')
          .findOne({
            documentId: id,
          });

        if (currentProduct) {
          const currentViews = currentProduct.views || 0;
          await strapi.documents('api::product.product').update({
            documentId: id,
            data: {
              views: currentViews + 1,
            },
          });
        }
      } catch (error) {
        strapi.log.error('Failed to increment product views:', error);
      }

      // 2. Fetch the updated product data to return to the frontend
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
  }),
);
