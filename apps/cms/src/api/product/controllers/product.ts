/**
 * product controller
 */

import { factories } from '@strapi/strapi';

function normalizeQueryArray(value: unknown): string[] | undefined {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  const single = String(value).trim();
  return single ? [single] : undefined;
}

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

    async search(ctx) {
      const {
        q,
        page = '1',
        pageSize = '12',
        sort = 'createdAt:desc',
        priceMin,
        priceMax,
      } = ctx.query;

      if (!q || typeof q !== 'string' || !q.trim()) {
        return ctx.badRequest('Search query "q" is required');
      }

      try {
        const result = await strapi
          .service('api::product.product')
          .searchProducts({
            query: q,
            page: Number(page),
            pageSize: Number(pageSize),
            sort: typeof sort === 'string' ? sort : 'createdAt:desc',
            categoryIds: normalizeQueryArray(ctx.query.category),
            ageFilters: normalizeQueryArray(ctx.query.age),
            priceMin: priceMin ? Number(priceMin) : undefined,
            priceMax: priceMax ? Number(priceMax) : undefined,
          });

        return result;
      } catch (error) {
        strapi.log.error('Product search failed:', error);
        return ctx.internalServerError('Failed to search products');
      }
    },
  }),
);
