import { NextResponse } from 'next/server';
import { getStorefrontProducts } from '@/lib/productStore';

export async function GET() {
  try {
    const products = getStorefrontProducts(false);
    return NextResponse.json({ success: true, products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch products';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
