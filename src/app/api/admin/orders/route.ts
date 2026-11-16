import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, saveOrder, updateOrderStatus, deleteOrder } from '@/lib/orders';
import { getAllAdminProductsAsync, getProductBySlug } from '@/lib/productStore';
import { Order } from '@/types/commerce';
import { saveSubscriber } from '@/lib/subscribers';
import { syncOrderToGoogleSheets } from '@/services/googleSheetsService';
import { sendTelegramOrderNotification } from '@/services/telegramService';
import { WORLDWIDE_WOMEN_SIZES } from '@/config/sizing';
import {
  BLACK_FRIDAY_DISCOUNT_LABEL,
  BLACK_FRIDAY_DISCOUNT_RATE,
} from '@/config/blackFriday';

export async function GET() {
  try {
    const orders = await getAllOrders();
    const totalRevenue = orders.reduce(
      (sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum),
      0
    );
    const moneyReceived = orders.reduce(
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
        moneyReceived,
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
      applyBlackFridayDiscount = false,
    } = body;

    if (!customerName || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone number, and delivery address are required.' },
        { status: 400 }
      );
    }

    const orderId = `NOV-OFF-${Date.now().toString().slice(-5)}`;
    const allProducts = await getAllAdminProductsAsync();
    const matchedByName = productName
      ? allProducts.find((p) => p.name.toLowerCase() === String(productName).toLowerCase())
      : undefined;
    const baseProduct =
      matchedByName || getProductBySlug('the-weave-slide-pam') || allProducts[0];

    const qty = Math.max(1, Number(quantity) || 1);
    const totalNum = Number(total) || 20000;
    const unitPrice = baseProduct?.price || Math.round(totalNum / qty);
    const regularPairsTotal = unitPrice * qty;
    const shouldIncludeBfDiscount =
      Boolean(applyBlackFridayDiscount) && regularPairsTotal > totalNum;
    const discountAmount = shouldIncludeBfDiscount
      ? Math.max(0, regularPairsTotal - totalNum)
      : Math.round(regularPairsTotal * BLACK_FRIDAY_DISCOUNT_RATE);

    const product = baseProduct || {
      id: 'the-weave-slide-pam',
      name: productName || 'The Weave Slide Pam',
      slug: 'the-weave-slide-pam',
      price: Math.round(totalNum / qty),
      colour: colour || 'Black',
      images: [],
      collection: 'Drop 001',
      description: 'Handcrafted soft natural leather pam.',
      details: [],
      materials: 'Soft natural Nigerian leather',
      availableSizes: WORLDWIDE_WOMEN_SIZES.map((s) => s.eu),
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
          quantity: qty,
        },
      ],
      ...(Boolean(applyBlackFridayDiscount)
        ? {
            originalSubtotal: regularPairsTotal,
            discountAmount,
            discountLabel: BLACK_FRIDAY_DISCOUNT_LABEL,
          }
        : {}),
      subtotal: totalNum,
      deliveryFee: 0,
      total: totalNum,
      currency: 'NGN',
      deliveryExpectation: '5 business days benchcraft + 2 days tracked delivery',
      payment: {
        provider: 'bank_transfer',
        status: paymentStatus,
        reference: `OFF-${Date.now().toString().slice(-6)}`,
        paidAt: paymentStatus === 'success' ? new Date().toISOString() : undefined,
      },
      notes: `Offline sale logged via Admin Console (${paymentMethod})`,
    };

    const saved = await saveOrder(newOrder);

    // Save subscriber if legitimate email provided
    if (email && email.includes('@') && !email.includes('@client.noveq.com.ng')) {
      try {
        await saveSubscriber(email.trim(), 'checkout', {
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

    const updated = await updateOrderStatus(orderId, status);
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

    const removed = await deleteOrder(orderId);
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

