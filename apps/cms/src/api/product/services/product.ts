/**
 * product service
 */

import { factories } from '@strapi/strapi';

import { fuzzySearchProducts } from '../utils/fuzzy-search';
import {
  buildProductSearchFilters,
  sortProducts,
  withDiscountPrice,
} from '../utils/product-search-filters';

export type ProductSearchOptions = {
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  categoryIds?: string[];
  ageFilters?: string[];
  priceMin?: number;
  priceMax?: number;
};

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

    async searchProducts(options: ProductSearchOptions) {
      const {
        query,
        page = 1,
        pageSize = 12,
        sort = 'createdAt:desc',
        categoryIds,
        ageFilters,
        priceMin,
        priceMax,
      } = options;

      const filters = buildProductSearchFilters({
        categoryIds,
        ageFilters,
        priceMin,
        priceMax,
      });

      const allProducts = await strapi.documents('api::product.product').findMany({
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        populate: {
          categories: { fields: ['title', 'title_ar', 'documentId'] },
          media: { fields: ['url', 'name', 'mime', 'previewUrl', 'formats'] },
        },
        status: 'published',
      });

      const trimmedQuery = query?.trim();
      let results = allProducts as Record<string, unknown>[];

      if (trimmedQuery) {
        results = fuzzySearchProducts(results, trimmedQuery);
        if (sort !== 'createdAt:desc') {
          results = sortProducts(results, sort);
        }
      } else {
        results = sortProducts(results, sort);
      }

      const total = results.length;
      const pageCount = Math.max(1, Math.ceil(total / pageSize));
      const start = (page - 1) * pageSize;
      const data = results
        .slice(start, start + pageSize)
        .map((product) => withDiscountPrice(product));

      return {
        data,
        meta: {
          pagination: {
            page,
            pageSize,
            total,
            pageCount,
          },
        },
      };
    },
  }),
);
