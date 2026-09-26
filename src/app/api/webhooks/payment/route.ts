import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';
import { getOrderByReference, updateOrderPayment } from '@/lib/orders';
import { dispatchOrderConfirmation } from '@/services/notificationService';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY || 'sandbox_secret_key';

    // Verify webhook signature
    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature, secret);

    // In non-production or test mode, proceed with mock verification if not set
    if (!isValid && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      if (reference) {
        const order = getOrderByReference(reference);
        if (order) {
          const updated = updateOrderPayment(order.id, 'success', {
            paidAt: event.data.paid_at || new Date().toISOString(),
          });
          if (updated) {
            await dispatchOrderConfirmation(updated);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 400 });
  }
}
