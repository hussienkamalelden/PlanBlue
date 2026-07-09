import { NextRequest, NextResponse } from 'next/server';
import { fetchShopItems } from '@/lib/api/strapi.server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '12');
  const sort = searchParams.get('sort') ?? 'createdAt:desc';
  const categoryIds = searchParams.getAll('category').filter(Boolean);
  const ageFilters = searchParams.getAll('age').filter(Boolean);
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
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      ageFilters: ageFilters.length > 0 ? ageFilters : undefined,
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
