import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, saveOrder, updateOrderStatus, deleteOrder } from '@/lib/orders';
import { getProductBySlug } from '@/data/products';
import { Order } from '@/types/commerce';
import { saveSubscriber } from '@/lib/subscribers';
import { syncOrderToGoogleSheets } from '@/services/googleSheetsService';
import { sendTelegramOrderNotification } from '@/services/telegramService';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      email,
      address,
      city,
      state,
      deliveryNotes,
      productName,
      colour,
      size,
      quantity = 1,
      total = 20000,
      paymentMethod = 'Direct Bank Transfer',
      paymentStatus = 'success',
      orderStatus = 'paid',
    } = body;

    if (!customerName || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone number, and delivery address are required.' },
        { status: 400 }
      );
    }

    const orderId = `NOV-OFF-${Date.now().toString().slice(-5)}`;
    const isWeave = (productName || '').toLowerCase().includes('weave');
    const slug = isWeave ? 'the-weave-slide-pam' : 'the-ring-slide-pam';
    const baseProduct = getProductBySlug(slug);

    const product = baseProduct || {
      id: slug,
      name: isWeave ? 'The Weave Slide Pam' : 'The Ring Slide Pam',
      slug,
      price: Number(total) / Math.max(1, Number(quantity)),
      colour: colour || 'Warm Cognac',
      images: [],
      collection: 'Drop 001',
      description: 'Handcrafted contemporary leather pam.',
      details: [],
      materials: 'Full-grain cowhide leather',
      availableSizes: ['EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'],
      isSoldOut: false,
    };

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: orderStatus,
      customer: {
        fullName: customerName.trim(),
        phone: phone.trim(),
        email: email && email.trim() ? email.trim() : `${phone.replace(/[^0-9]/g, '')}@client.noveq.com.ng`,
        address: address.trim(),
        city: city?.trim() || 'Lagos',
        state: state?.trim() || 'Lagos',
        zoneId: 'lagos-metro',
        deliveryNotes: deliveryNotes ? deliveryNotes.trim() : `Manual / Offline Order (${paymentMethod})`,
      },
      items: [
        {
          product: product as any,
          selectedSize: size || 'EU 40',
          selectedColour: colour || product.colour,
          quantity: Math.max(1, Number(quantity)),
        },
      ],
      subtotal: Number(total),
      deliveryFee: 0,
      total: Number(total),
      currency: 'NGN',
      deliveryExpectation: '24–48 hours nationwide courier',
      payment: {
        provider: 'bank_transfer',
        status: paymentStatus,
        reference: `OFF-${Date.now().toString().slice(-6)}`,
        paidAt: paymentStatus === 'success' ? new Date().toISOString() : undefined,
      },
      notes: `Offline sale logged via Admin Console (${paymentMethod})`,
    };

    const saved = saveOrder(newOrder);

    // Save subscriber if legitimate email provided
    if (email && email.includes('@') && !email.includes('@client.noveq.com.ng')) {
      try {
        saveSubscriber(email.trim(), 'checkout', {
          name: customerName.trim(),
          tags: ['offline-customer', paymentMethod.toLowerCase().replace(/\s+/g, '-')],
        });
      } catch {
        // Non-blocking
      }
    }

    // Sync to Google Sheets
    syncOrderToGoogleSheets(saved).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to sync offline order to Google Sheets:', err);
    });

    // Send Telegram Notification
    sendTelegramOrderNotification(saved).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to send Telegram alert for offline order:', err);
    });

    return NextResponse.json({ success: true, order: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record offline order';
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId parameter is required.' },
        { status: 400 }
      );
    }

    const removed = deleteOrder(orderId);
    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'Order not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedOrderId: orderId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

