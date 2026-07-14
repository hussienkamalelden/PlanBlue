import type { MetadataRoute } from 'next';

import { fetchShopItems } from '@/lib/api/strapi.server';
import { getSiteUrl } from '@/lib/seo/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const result = await fetchShopItems({ page, pageSize: 100 });
    pageCount = result.pageCount;

    for (const item of result.data) {
      productRoutes.push({
        url: `${siteUrl}/shop/${item.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    page += 1;
  }

  return [...staticRoutes, ...productRoutes];
}
