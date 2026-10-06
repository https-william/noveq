'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
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
  ArrowRight,
} from 'lucide-react';
import { Order, PaymentStatus } from '@/types/commerce';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/lib/analytics';
import { SITE_SETTINGS } from '@/config/siteSettings';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reference =
    searchParams.get('reference') ||
    searchParams.get('ref') ||
    searchParams.get('trxref');

  const { clearCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('processing');
  const [statusMessage, setStatusMessage] = useState<string>(
    'Verifying transaction with Paystack secure network...'
  );
  const hasTriggeredVerification = useRef(false);

  // Authoritative server-side verification handler
  const executeVerification = useCallback(
    async (targetOrderId: string, targetReference?: string) => {
      setPaymentStatus('processing');
      setStatusMessage('Authorizing settlement with Paystack gateway...');

      try {
        const response = await fetch('/api/checkout/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: targetOrderId,
            reference: targetReference,
          }),
        });

        const result = await response.json();

        if (result.status === 'success') {
          setPaymentStatus('success');
          setStatusMessage('Payment confirmed and verified. Directing to your order receipt...');

          // Authoritative purchase analytics event
          trackEvent('purchase', {
            order_id: targetOrderId,
            currency: 'NGN',
            value: result.order?.total || 0,
            items: result.order?.items?.map(
              (item: {
                product: { slug: string; name: string; price: number; colour: string };
                selectedSize: string;
                quantity: number;
              }) => ({
                item_id: item.product.slug,
                item_name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                item_variant: `${item.selectedSize} - ${item.product.colour}`,
              })
            ),
          });

          // Clear bag only after authoritative server confirmation
          clearCart();

          // Redirect to order confirmation screen
          setTimeout(() => {
            router.push(`/order-confirmation/${targetOrderId}`);
          }, 1500);
        } else if (result.status === 'failed') {
          setPaymentStatus('failed');
          setStatusMessage(
            result.errorMessage || 'Transaction could not be settled by your issuing bank.'
          );
        } else if (result.status === 'cancelled') {
          setPaymentStatus('cancelled');
          setStatusMessage('Transaction was closed before settlement. No funds were debited.');
        } else if (result.status === 'timed_out') {
          setPaymentStatus('timed_out');
          setStatusMessage('The payment gateway session expired. No funds were deducted.');
        } else {
          setPaymentStatus('failed');
          setStatusMessage(result.errorMessage || 'Could not verify payment status.');
        }
      } catch {
        setPaymentStatus('failed');
        setStatusMessage('Network interruption during gateway verification. Please message our support team on WhatsApp.');
      }
    },
    [clearCart, router]
  );

  // Initial load: Fetch order and automatically trigger Paystack verification
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setPaymentStatus('failed');
      setStatusMessage('No valid order reference was detected.');
      return;
    }

    async function initAndVerify() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (!data.order) {
          setPaymentStatus('failed');
          setStatusMessage('Order could not be located in our system.');
          setLoading(false);
          return;
        }

        const fetchedOrder: Order = data.order;
        setOrder(fetchedOrder);
        setLoading(false);

        // If order is already paid, route straight to confirmation
        if (fetchedOrder.status === 'paid' || fetchedOrder.payment?.status === 'success') {
          setPaymentStatus('success');
          setStatusMessage('Order is settled. Redirecting to confirmation...');
          clearCart();
          setTimeout(() => {
            router.push(`/order-confirmation/${orderId}`);
          }, 1200);
          return;
        }

        // If not verified yet and we haven't fired the call, verify with Paystack now
        if (!hasTriggeredVerification.current && orderId) {
          hasTriggeredVerification.current = true;
          const activeRef = reference || fetchedOrder.payment?.reference;
          await executeVerification(orderId, activeRef);
        }
      } catch {
        setPaymentStatus('failed');
        setStatusMessage('Unable to connect to the server.');
        setLoading(false);
      }
    }

    initAndVerify();
  }, [orderId, reference, executeVerification, clearCart, router]);

  if (loading) {
    return (
      <div className="py-28 max-w-md mx-auto text-center space-y-4 px-4">
        <div className="w-10 h-10 border-2 border-cocoa border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-widest text-muted-taupe">
          Connecting to Paystack Security Gateway...
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20 max-w-xl mx-auto px-4 sm:px-6">
      <div className="bg-warm-white border border-cocoa/30 rounded-xs p-6 sm:p-10 shadow-sm space-y-8">
        {/* Status Header */}
        <div className="text-center space-y-3">
          {/* 1. PROCESSING / VERIFYING */}
          {paymentStatus === 'processing' && (
            <div className="space-y-4">
              <div className="w-14 h-14 border-3 border-cocoa border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="inline-block px-3 py-1 bg-espresso text-warm-white text-[10px] uppercase tracking-widest font-semibold rounded-xs">
                Authoritative Verification
              </span>
              <h1 className="text-2xl font-serif text-ink-black">
                Confirming Your Payment
              </h1>
              <p className="text-xs text-muted-taupe max-w-sm mx-auto leading-relaxed">
                {statusMessage}
              </p>
              <p className="text-[11px] text-cocoa font-medium">
                Please do not refresh, close, or navigate away from this screen.
              </p>
            </div>
          )}

          {/* 2. SUCCESS */}
          {paymentStatus === 'success' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-cocoa/10 border border-cocoa/30 flex items-center justify-center text-cocoa mx-auto">
                <CheckCircle2 className="w-8 h-8 text-cocoa" />
              </div>
              <span className="inline-block px-3 py-1 bg-cocoa text-warm-white text-[10px] uppercase tracking-widest font-semibold rounded-xs">
                Payment Confirmed
              </span>
              <h1 className="text-2xl font-serif text-ink-black">
                Order Reserved & Verified
              </h1>
              <p className="text-xs text-muted-taupe max-w-sm mx-auto">
                Your payment was successfully received and verified with Paystack. Preparing your confirmation details...
              </p>
            </div>
          )}

          {/* 3. FAILED */}
          {paymentStatus === 'failed' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-oxblood/10 border border-oxblood/30 flex items-center justify-center text-oxblood mx-auto">
                <XCircle className="w-8 h-8 text-oxblood" />
              </div>
              <span className="inline-block px-3 py-1 bg-oxblood text-warm-white text-[10px] uppercase tracking-widest font-semibold rounded-xs">
                Payment Incomplete
              </span>
              <h1 className="text-2xl font-serif text-ink-black">
                Unable to Complete Payment
              </h1>
              <div className="p-3 bg-bone border border-cocoa/20 rounded-xs text-xs text-ink-black/90 max-w-md mx-auto">
                <span className="font-semibold block text-[10px] uppercase tracking-wider text-oxblood mb-1">
                  Bank / Gateway Feedback
                </span>
                {statusMessage}
              </div>
              <p className="text-xs text-muted-taupe leading-relaxed">
                If your account was debited, your bank will reverse the transaction automatically within 24 hours. Your pair remains saved in your bag.
              </p>
            </div>
          )}

          {/* 4. CANCELLED */}
          {paymentStatus === 'cancelled' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-bone border border-cocoa/30 flex items-center justify-center text-muted-taupe mx-auto">
                <AlertTriangle className="w-7 h-7 text-muted-taupe" />
              </div>
              <span className="inline-block px-3 py-1 bg-bone border border-cocoa/30 text-ink-black text-[10px] uppercase tracking-widest font-semibold rounded-xs">
                Session Cancelled
              </span>
              <h1 className="text-2xl font-serif text-ink-black">
                Payment Cancelled
              </h1>
              <p className="text-xs text-muted-taupe max-w-sm mx-auto leading-relaxed">
                You exited the Paystack gateway without completing the transaction. <strong>No funds were charged.</strong> Your items are still reserved in your bag.
              </p>
            </div>
          )}

          {/* 5. TIMED OUT */}
          {paymentStatus === 'timed_out' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-bone border border-cocoa/30 flex items-center justify-center text-muted-taupe mx-auto">
                <Clock className="w-7 h-7 text-muted-taupe" />
              </div>
              <span className="inline-block px-3 py-1 bg-espresso text-warm-white text-[10px] uppercase tracking-widest font-semibold rounded-xs">
                Gateway Timeout
              </span>
              <h1 className="text-2xl font-serif text-ink-black">
                Payment Window Expired
              </h1>
              <p className="text-xs text-muted-taupe max-w-sm mx-auto leading-relaxed">
                For customer security, Paystack windows close after prolonged inactivity. <strong>You were not charged.</strong>
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

        {/* Action Options */}
        <div className="space-y-3 pt-2">
          {(paymentStatus === 'failed' || paymentStatus === 'cancelled' || paymentStatus === 'timed_out') && (
            <div className="space-y-3">
              <Link
                href="/checkout"
                className="w-full py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return to Checkout & Retry</span>
              </Link>

              <div className="pt-3 border-t border-cocoa/20 text-center space-y-2">
                <p className="text-xs text-muted-taupe">Prefer direct bank transfer?</p>
                <a
                  href={`https://wa.me/${SITE_SETTINGS.supportContact.phone}?text=${encodeURIComponent(
                    `Hello NOVEQ team, I would like to complete my order (${orderId}) via direct bank transfer.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-cocoa hover:text-ink-black font-medium underline underline-offset-4"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with our team on WhatsApp</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Security badge */}
        <div className="pt-2 text-center flex items-center justify-center gap-2 text-[11px] text-muted-taupe">
          <ShieldCheck className="w-4 h-4 text-cocoa" />
          <span>Secure Paystack Payment</span>
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
          Connecting to Payment Gateway...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
