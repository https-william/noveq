import { NextResponse } from 'next/server';
import { getStorefrontProductsAsync } from '@/lib/productStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getStorefrontProductsAsync(false);
    return NextResponse.json({ success: true, products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch products';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
