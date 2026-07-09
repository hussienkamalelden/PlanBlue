import { NextRequest, NextResponse } from 'next/server';
import { fetchShopItems } from '@/lib/api/strapi.server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '12');
  const sort = searchParams.get('sort') ?? 'createdAt:desc';
  const categoryId = searchParams.get('category') ?? undefined;
  const ageFilter = searchParams.get('age') ?? undefined;
  const priceMin = searchParams.has('priceMin')
    ? Number(searchParams.get('priceMin'))
    : undefined;
  const priceMax = searchParams.has('priceMax')
    ? Number(searchParams.get('priceMax'))
    : undefined;
  const search = searchParams.get('search') ?? undefined;

  try {
    const result = await fetchShopItems({
      page,
      pageSize,
      sort,
      categoryId,
      ageFilter,
      priceMin,
      priceMax,
      search,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch shop items' },
      { status: 500 },
    );
  }
}
