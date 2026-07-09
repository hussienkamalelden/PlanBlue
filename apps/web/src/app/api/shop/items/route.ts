import { NextRequest, NextResponse } from 'next/server';
import { fetchShopItems } from '@/lib/api/strapi.server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '12');
  const sort = searchParams.get('sort') ?? 'createdAt:desc';

  try {
    const result = await fetchShopItems({ page, pageSize, sort });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch shop items' },
      { status: 500 },
    );
  }
}
