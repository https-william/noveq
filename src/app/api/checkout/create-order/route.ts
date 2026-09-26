import { NextResponse } from 'next/server';
import { CartItem, CustomerDetails, Order } from '@/types/commerce';
import { getProductBySlug } from '@/data/products';
import { getDeliveryZoneById } from '@/config/deliveryZones';
import { saveOrder } from '@/lib/orders';
import { PaymentService } from '@/services/paymentService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer,
      items,
    }: {
      customer: CustomerDetails;
      items: CartItem[];
    } = body;

    if (!customer || !customer.fullName || !customer.email || !customer.phone || !customer.address) {
      return NextResponse.json(
        { error: 'Missing required customer delivery information.' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty. Please select a product.' },
        { status: 400 }
      );
    }

    // Authoritative Server-Side Pricing (Prevent client-side price tampering)
    let calculatedSubtotal = 0;
    const validatedItems: CartItem[] = [];

    for (const item of items) {
      const liveProduct = getProductBySlug(item.product.slug);
      if (!liveProduct) {
        return NextResponse.json(
          { error: `Product "${item.product.name}" is no longer available.` },
          { status: 400 }
        );
      }

      const validatedItem: CartItem = {
        product: liveProduct,
        selectedSize: item.selectedSize,
        quantity: Math.max(1, item.quantity),
        withHeartCharm: item.withHeartCharm,
        engravedText: item.engravedText,
      };

      calculatedSubtotal += liveProduct.price * validatedItem.quantity;
      validatedItems.push(validatedItem);
    }

    // Authoritative Delivery Fee lookup
    const zone = getDeliveryZoneById(customer.zoneId);
    const deliveryFee = zone.fee;
    const total = calculatedSubtotal + deliveryFee;

    // Generate readable order ID: e.g. NVQ-2026-94812
    const orderId = `NVQ-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      total,
      currency: 'NGN',
      status: 'pending_payment',
      payment: {
        status: 'processing',
        reference: '',
        provider: 'paystack_mock',
      },
      deliveryExpectation: zone.estimatedDays,
    };

    // Initialize payment via PaymentService
    const paymentInit = await PaymentService.initializePayment({
      order: newOrder,
      callbackUrl: `${new URL(request.url).origin}/checkout/payment?orderId=${orderId}`,
    });

    newOrder.payment.reference = paymentInit.reference;
    newOrder.payment.provider = paymentInit.provider;

    // Save order in authoritative store
    saveOrder(newOrder);

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      reference: paymentInit.reference,
      authorizationUrl: paymentInit.authorizationUrl,
      total: newOrder.total,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Unable to initialize checkout. Please try again.' },
      { status: 500 }
    );
  }
}
