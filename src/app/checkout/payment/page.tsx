'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  MessageCircle,
} from 'lucide-react';
import { Order, PaymentStatus } from '@/types/commerce';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/lib/analytics';
import { SITE_SETTINGS } from '@/config/siteSettings';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reference = searchParams.get('ref');

  const { clearCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('processing');
  const [statusMessage, setStatusMessage] = useState<string>('Connecting to secure banking network...');

  // Fetch initial order details from authoritative server API
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setPaymentStatus('failed');
      setStatusMessage('No valid order identifier was provided.');
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          // Instrument add_payment_info event
          trackEvent('add_payment_info', {
            order_id: data.order.id,
            currency: 'NGN',
            value: data.order.total,
            payment_method: data.order.payment?.provider || 'paystack',
            items: data.order.items?.map((item: { product: { slug: string; name: string; price: number; colour: string }; selectedSize: string; quantity: number }) => ({
              item_id: item.product.slug,
              item_name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              item_variant: `${item.selectedSize} - ${item.product.colour}`,
            })),
          });
        } else {
          setPaymentStatus('failed');
          setStatusMessage('Order could not be located in our atelier system.');
        }
      } catch {
        setPaymentStatus('failed');
        setStatusMessage('Network interruption while connecting to payment ledger.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  // Authoritative server-side verification handler
  const executeVerification = useCallback(async (
    outcome?: 'success' | 'failed' | 'cancelled' | 'timed_out'
  ) => {
    if (!orderId) return;

    setPaymentStatus('processing');
    setStatusMessage('Verifying settlement with bank gateway...');

    try {
      const response = await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          reference: reference || order?.payment.reference,
          mockOutcome: outcome,
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setPaymentStatus('success');
        setStatusMessage('Transaction approved and settled.');

        // Authoritative purchase analytics event
        trackEvent('purchase', {
          order_id: orderId,
          currency: 'NGN',
          value: result.order?.total || order?.total || 0,
          items: result.order?.items?.map((item: { product: { slug: string; name: string; price: number; colour: string }; selectedSize: string; quantity: number }) => ({
            item_id: item.product.slug,
            item_name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            item_variant: `${item.selectedSize} - ${item.product.colour}`,
          })),
        });

        // Clear bag only after authoritative server confirmation
        clearCart();

        // Redirect to order confirmation screen
        setTimeout(() => {
          router.push(`/order-confirmation/${orderId}`);
        }, 1200);
      } else if (result.status === 'failed') {
        setPaymentStatus('failed');
        setStatusMessage(
          result.errorMessage || 'Transaction was declined by issuing bank.'
        );
      } else if (result.status === 'cancelled') {
        setPaymentStatus('cancelled');
        setStatusMessage('Transaction was cancelled. No money was deducted.');
      } else if (result.status === 'timed_out') {
        setPaymentStatus('timed_out');
        setStatusMessage('Session timed out. No charge was processed.');
      }
    } catch {
      setPaymentStatus('failed');
      setStatusMessage('Verification failed. Please contact NOVEQ concierge.');
    }
  }, [orderId, reference, order?.payment.reference, order?.total, clearCart, router]);

  if (loading) {
    return (
      <div className="py-24 max-w-md mx-auto text-center space-y-4 px-4">
        <div className="w-10 h-10 border-2 border-cocoa border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-widest text-muted-taupe">
          Establishing Authoritative Session...
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20 max-w-xl mx-auto px-4 sm:px-6">
      <div className="bg-warm-white border border-cocoa/30 rounded-sm p-6 sm:p-10 shadow-lg space-y-8">
        {/* Status Header */}
        <div className="text-center space-y-3">
          {/* 1. PROCESSING */}
          {paymentStatus === 'processing' && (
            <div className="space-y-3">
              <div className="w-14 h-14 border-3 border-cocoa border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="inline-block px-3 py-1 bg-espresso text-warm-white text-[10px] uppercase tracking-widest font-semibold rounded-xs">
                State: Processing
              </span>
              <h1 className="text-2xl font-bold text-ink-black">
                Processing Secure Payment
              </h1>
              <p className="text-xs text-muted-taupe max-w-sm mx-auto leading-relaxed">
                {statusMessage}
              </p>
              <p className="text-[11px] text-cocoa/90 font-medium">
                Please do not refresh, close, or navigate away from this screen.
              </p>
            </div>
          )}

          {/* 2. SUCCESS */}
          {paymentStatus === 'success' && (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-full bg-cocoa/10 border border-cocoa/30 flex items-center justify-center text-cocoa mx-auto">
                <CheckCircle2 className="w-8 h-8 text-cocoa" />
              </div>
              <span className="inline-block px-3 py-1 bg-cocoa text-warm-white text-[10px] uppercase tracking-widest font-semibold rounded-xs">
                State: Approved & Verified
              </span>
              <h1 className="text-2xl font-bold text-ink-black">
                Payment Confirmed
              </h1>
              <p className="text-xs text-muted-taupe max-w-sm mx-auto">
                Your payment was authoritatively verified. Preparing your order confirmation...
              </p>
            </div>
          )}

          {/* 3. FAILED */}
          {paymentStatus === 'failed' && (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-full bg-oxblood/10 border border-oxblood/30 flex items-center justify-center text-oxblood mx-auto">
                <XCircle className="w-8 h-8 text-oxblood" />
              </div>
              <span className="inline-block px-3 py-1 bg-oxblood text-warm-white text-[10px] uppercase tracking-widest font-semibold rounded-xs">
                State: Payment Failed
              </span>
              <h1 className="text-2xl font-bold text-ink-black">
                Payment Could Not Be Completed
              </h1>
              <div className="p-3 bg-bone border border-cocoa/20 rounded-xs text-xs text-ink-black/90 max-w-md mx-auto">
                <span className="font-semibold block text-[11px] uppercase tracking-wider text-oxblood mb-1">
                  Bank Response
                </span>
                {statusMessage}
              </div>
              <p className="text-xs text-muted-taupe">
                <strong>Important:</strong> If any debited notification arrived from your bank, funds will reverse automatically within 24 hours. Your order remains reserved.
              </p>
            </div>
          )}

          {/* 4. CANCELLED */}
          {paymentStatus === 'cancelled' && (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-full bg-bone border border-cocoa/30 flex items-center justify-center text-muted-taupe mx-auto">
                <AlertTriangle className="w-7 h-7 text-muted-taupe" />
              </div>
              <span className="inline-block px-3 py-1 bg-bone border border-cocoa/30 text-ink-black text-[10px] uppercase tracking-widest font-semibold rounded-xs">
                State: Cancelled
              </span>
              <h1 className="text-2xl font-bold text-ink-black">
                Payment Cancelled
              </h1>
              <p className="text-xs text-muted-taupe max-w-sm mx-auto">
                You cancelled the checkout session. <strong>No funds were charged to your account.</strong> Your selected footwear has been saved in your bag.
              </p>
            </div>
          )}

          {/* 5. TIMED OUT */}
          {paymentStatus === 'timed_out' && (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-full bg-bone border border-cocoa/30 flex items-center justify-center text-muted-taupe mx-auto">
                <Clock className="w-7 h-7 text-muted-taupe" />
              </div>
              <span className="inline-block px-3 py-1 bg-espresso text-warm-white text-[10px] uppercase tracking-widest font-semibold rounded-xs">
                State: Timed Out
              </span>
              <h1 className="text-2xl font-bold text-ink-black">
                Payment Window Expired
              </h1>
              <p className="text-xs text-muted-taupe max-w-sm mx-auto">
                For security, payment authorization windows close after 10 minutes of inactivity. <strong>You were not charged.</strong>
              </p>
            </div>
          )}
        </div>

        {/* Order Details Briefing */}
        {order && (
          <div className="p-4 bg-bone/70 border border-cocoa/20 rounded-xs space-y-2 text-xs">
            <div className="flex justify-between text-muted-taupe">
              <span>Order Reference</span>
              <span className="font-mono text-ink-black font-semibold">{order.id}</span>
            </div>
            <div className="flex justify-between text-muted-taupe">
              <span>Customer</span>
              <span className="font-semibold text-ink-black">{order.customer.fullName}</span>
            </div>
            <div className="flex justify-between text-muted-taupe">
              <span>Total Payable</span>
              <span className="font-bold text-ink-black text-sm">
                ₦{order.total.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Explicit Next Steps / Action Buttons */}
        <div className="space-y-3 pt-2">
          {paymentStatus === 'processing' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => executeVerification('success')}
                className="w-full py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px]"
              >
                Complete Payment (Simulate Gateway Approval)
              </button>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => executeVerification('failed')}
                  className="py-2 text-[10px] uppercase tracking-wider text-oxblood border border-oxblood/30 rounded-xs hover:bg-oxblood/10"
                >
                  Simulate Decline
                </button>
                <button
                  type="button"
                  onClick={() => executeVerification('cancelled')}
                  className="py-2 text-[10px] uppercase tracking-wider text-muted-taupe border border-cocoa/30 rounded-xs hover:bg-bone"
                >
                  Simulate Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeVerification('timed_out')}
                  className="py-2 text-[10px] uppercase tracking-wider text-muted-taupe border border-cocoa/30 rounded-xs hover:bg-bone"
                >
                  Simulate Timeout
                </button>
              </div>
            </div>
          )}

          {(paymentStatus === 'failed' || paymentStatus === 'cancelled' || paymentStatus === 'timed_out') && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => executeVerification('success')}
                className="w-full py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Payment</span>
              </button>

              <Link
                href="/checkout"
                className="block text-center py-2.5 text-xs uppercase tracking-[0.16em] text-muted-taupe hover:text-ink-black transition-colors"
              >
                Edit Checkout Details
              </Link>

              <div className="pt-3 border-t border-cocoa/20 text-center">
                <a
                  href={`https://wa.me/${SITE_SETTINGS.supportContact.phone}?text=${encodeURIComponent(
                    `Hello NOVEQ, I had a payment issue for order ${orderId}. Please assist me.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-cocoa hover:text-ink-black font-medium underline underline-offset-4"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact WhatsApp Concierge for Direct Bank Transfer</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Security badge */}
        <div className="pt-2 text-center flex items-center justify-center gap-2 text-[11px] text-muted-taupe">
          <ShieldCheck className="w-4 h-4 text-cocoa" />
          <span>Server-verified authoritative payment engine.</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs uppercase tracking-widest text-muted-taupe">
          Loading Payment Portal...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
