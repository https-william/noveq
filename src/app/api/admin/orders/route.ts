import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, updateOrderStatus } from '@/lib/orders';

export async function GET() {
  try {
    const orders = getAllOrders();
    const totalRevenue = orders.reduce(
      (sum, o) => (o.payment.status === 'success' ? sum + o.total : sum),
      0
    );
    const totalOrdersCount = orders.length;
    const pendingFulfillmentsCount = orders.filter(
      (o) => o.status === 'paid' || o.status === 'processing'
    ).length;

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrdersCount,
        pendingFulfillmentsCount,
        currency: 'NGN',
      },
      orders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch admin orders';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'orderId and status are required.' },
        { status: 400 }
      );
    }

    const updated = updateOrderStatus(orderId, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update order status';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
