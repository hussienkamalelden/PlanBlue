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
      return NextResponse.json({ images: {} });
    }

    const shopItems = await fetchShopItemsByDocumentIds(documentIds, {
      includeMedia: true,
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

    return NextResponse.json({ images });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch cart images' },
      { status: 500 },
    );
  }
}
