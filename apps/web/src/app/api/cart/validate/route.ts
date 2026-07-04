import {
  fetchProductsByDocumentIds,
} from '@/lib/api/strapi.server';
import type { CartValidationPayloadItem } from '@/lib/cart/validate-cart';
import { validateCartItems } from '@/lib/cart/validate-cart';

import { NextResponse } from 'next/server';

type ValidateCartRequest = {
  items?: CartValidationPayloadItem[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ValidateCartRequest;
    const items = body.items ?? [];

    if (items.length === 0) {
      return NextResponse.json({ valid: true, items: [] });
    }

    const documentIds = [...new Set(items.map((item) => item.documentId))];
    const products = await fetchProductsByDocumentIds(documentIds);
    const result = validateCartItems(items, products);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Failed to validate cart' },
      { status: 500 },
    );
  }
}
