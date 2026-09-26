import { NextResponse } from 'next/server';
import { getOrderById, updateOrderPayment } from '@/lib/orders';
import { PaymentService } from '@/services/paymentService';
import { dispatchOrderConfirmation } from '@/services/notificationService';
import { PaymentStatus } from '@/types/commerce';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      reference,
      mockOutcome,
    }: {
      orderId: string;
      reference?: string;
      mockOutcome?: 'success' | 'failed' | 'cancelled' | 'timed_out';
    } = body;

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      );
    }

    let determinedStatus: PaymentStatus = 'processing';
    let errorMessage: string | undefined;

    // If sandbox simulator provided an explicit user outcome test (e.g. user simulated decline or cancel)
    if (mockOutcome) {
      determinedStatus = mockOutcome;
      if (mockOutcome === 'failed') errorMessage = 'Card was declined by the issuing bank.';
      if (mockOutcome === 'cancelled') errorMessage = 'Transaction was cancelled by customer.';
      if (mockOutcome === 'timed_out') errorMessage = 'Session timed out before completion.';
    } else if (reference) {
      const verifyResult = await PaymentService.verifyPayment(reference);
      determinedStatus = verifyResult.status;
      errorMessage = verifyResult.errorMessage;
    } else {
      determinedStatus = 'failed';
      errorMessage = 'Missing transaction reference.';
    }

    // Authoritative update on the server
    const updatedOrder = updateOrderPayment(orderId, determinedStatus, {
      paidAt: determinedStatus === 'success' ? new Date().toISOString() : undefined,
      errorMessage,
    });

    // If payment verified successfully, dispatch post-purchase notification
    if (determinedStatus === 'success' && updatedOrder) {
      try {
        await dispatchOrderConfirmation(updatedOrder);
      } catch (notifyErr) {
        // eslint-disable-next-line no-console
        console.error('Failed to dispatch post-purchase notification:', notifyErr);
      }
    }

    return NextResponse.json({
      success: determinedStatus === 'success',
      status: determinedStatus,
      errorMessage,
      order: updatedOrder,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { error: 'Unable to verify payment status.' },
      { status: 500 }
    );
  }
}
