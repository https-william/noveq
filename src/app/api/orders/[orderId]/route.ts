import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/orders';

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { orderId } = await context.params;
    const order = getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to retrieve order.' }, { status: 500 });
  }
}
