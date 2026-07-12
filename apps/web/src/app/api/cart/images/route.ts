import { fetchShopItemsByDocumentIds } from '@/lib/api/strapi.server';
import { getFirstShopItemImage, getMediaUrl } from '@/lib/api/strapi';

import { NextResponse } from 'next/server';

type CartImagesRequest = {
  documentIds?: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CartImagesRequest;
    const documentIds = [...new Set(body.documentIds ?? [])];

    if (documentIds.length === 0) {
      return NextResponse.json({ images: {}, details: {} });
    }

    const shopItems = await fetchShopItemsByDocumentIds(documentIds, {
      includeMedia: true,
      includeDetails: true,
    });

    const images = Object.fromEntries(
      shopItems.map((item) => {
        const firstImage = getFirstShopItemImage(item.media);
        return [
          item.documentId,
          firstImage ? getMediaUrl(firstImage.url) : null,
        ] as const;
      }),
    );

    const details = Object.fromEntries(
      shopItems.map((item) => [
        item.documentId,
        {
          imageUrl: images[item.documentId] ?? null,
          description: item.description ?? '',
          description_ar: item.description_ar ?? '',
          sku: item.sku ?? null,
          discount_percentage: item.discount_percentage,
          need_batteries: item.need_batteries,
        },
      ]),
    );

    return NextResponse.json({ images, details });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch cart images' },
      { status: 500 },
    );
  }
}
