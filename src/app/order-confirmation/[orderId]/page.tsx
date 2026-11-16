import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Truck,
  MessageCircle,
  Mail,
  ArrowRight,
  Heart,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { getOrderById } from '@/lib/orders';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { OrderConfirmationTracker } from '@/components/Analytics/OrderConfirmationTracker';
import { WhatsAppLink } from '@/components/Analytics/WhatsAppLink';

interface Props {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order Confirmed - ${orderId}`,
    description: `Receipt and dispatch schedule for NOVEQ order ${orderId}.`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const formattedSubtotal = `₦${order.subtotal.toLocaleString()}`;
  const formattedDelivery = `₦${order.deliveryFee.toLocaleString()}`;
  const formattedTotal = `₦${order.total.toLocaleString()}`;
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const totalPairs = order.items.reduce((acc, item) => acc + item.quantity, 0);

  // WhatsApp direct link with prefilled order context
  const whatsAppText = encodeURIComponent(
    `Hello NOVEQ team,\n\nI just completed payment for order *${order.id}*.\nName: ${order.customer.fullName}\nTotal Paid: ${formattedTotal}\nAddress: ${order.customer.address}, ${order.customer.city}, ${order.customer.state}\n\nPlease update me on dispatch tracking. Thank you!`
  );
  const whatsAppUrl = `https://wa.me/${SITE_SETTINGS.supportContact.phone}?text=${whatsAppText}`;

  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Authoritative backend purchase tracking (deduplicated) */}
      <OrderConfirmationTracker order={order} />

      {/* Keepsake Drop 001 Edition Record Card */}
      <div className="bg-warm-white border border-cocoa/25 rounded-2xl p-6 sm:p-10 shadow-apple-sm space-y-6">
        {/* Drop 001 Edition Record Header */}
        <div className="border-b border-cocoa/15 pb-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-bone border border-cocoa/30 flex items-center justify-center text-cocoa shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-cocoa" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-[0.22em] text-cocoa font-semibold block">
                  Drop 001 · Edition Record
                </span>
                <h1 className="font-rayleigh text-2xl sm:text-3xl font-normal tracking-tight text-ink-black">
                  Thank you, {order.customer.fullName.split(' ')[0]}.
                </h1>
                <p className="text-xs text-muted-taupe leading-relaxed">
                  Your order is confirmed and scheduled for hand-finishing at our Lagos studio.
                </p>
              </div>
            </div>

            {/* Lagos Atelier Stamp + Reference Seal */}
            <div className="flex flex-col sm:items-end gap-2">
              <div className="inline-flex flex-col sm:items-end px-4 py-2.5 bg-bone/80 border border-cocoa/30 rounded-lg">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-taupe font-medium">
                  Order Reference
                </span>
                <span className="font-mono text-sm font-bold text-ink-black select-all">
                  {order.id}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-espresso/30 rounded-full text-[10px] uppercase tracking-[0.18em] text-espresso font-medium">
                <span>noveq · Lagos Atelier</span>
                <span aria-hidden="true">·</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Craftsmanship Record & Keepsake Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-bone/65 border border-cocoa/15 rounded-xl text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-taupe block">
                Edition Allocated
              </span>
              <span className="font-medium text-ink-black">
                Drop 001 · {totalPairs} {totalPairs === 1 ? 'Pair' : 'Pairs'} Reserved
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-taupe block">
                Craftsmanship
              </span>
              <span className="font-medium text-ink-black">
                Cut, shaped, and smoothed by hand in soft Nigerian leather
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-taupe block">
                Presentation
              </span>
              <span className="font-medium text-ink-black">
                Boxed in a breathable cotton dust bag
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Expectation Callout */}
        <div className="p-4.5 bg-espresso text-warm-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-apple-sm">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-warm-white/80 shrink-0" />
            <div>
              <span className="font-semibold block uppercase tracking-wider text-[11px]">
                When Your Pair Arrives
              </span>
              <span className="text-muted-taupe-on-dark">
                Made in Lagos over 5 business days, then delivered tracked in about 2 business days to {order.customer.city}, {order.customer.state}.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 bg-ink-black/60 border border-cocoa/40 rounded-full text-[10px] uppercase tracking-widest text-warm-white font-medium shrink-0">
            Drop 001 Priority
          </span>
        </div>

        {/* Items Summary */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.18em] font-bold text-ink-black flex items-center gap-2">
            <Package className="w-4 h-4 text-cocoa" />
            <span>Items Reserved ({order.items.reduce((acc, i) => acc + i.quantity, 0)})</span>
          </h2>

          <div className="border border-cocoa/20 rounded-xl divide-y divide-cocoa/15 bg-bone/30 overflow-hidden">
            {order.items.map((item) => (
              <div
                key={`${item.product.slug}-${item.selectedSize}-${item.selectedColour || ''}`}
                className="p-4 flex gap-4 items-center"
              >
                <div className="relative w-16 h-16 bg-bone border border-cocoa/20 rounded-md shrink-0 overflow-hidden">
                  <Image
                    src={item.product.images[0]?.src || '/images/products/the-ring-burgundy.jpg'}
                    alt={item.product.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-ink-black">
                      {item.product.name}
                    </h3>
                    <span className="text-sm font-bold text-ink-black">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-muted-taupe">
                    Color: <span className="font-semibold text-ink-black">{item.selectedColour || item.product.colour}</span> · Size: <span className="font-semibold text-ink-black">{item.selectedSize}</span> · Qty: {item.quantity}
                  </p>

                  {item.withHeartCharm && (
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-bone border border-cocoa/20 text-[10px] text-cocoa rounded-full font-medium">
                      <Heart className="w-2.5 h-2.5 fill-oxblood text-oxblood" />
                      <span>
                        Heart charm{item.engravedText ? ` - engraved '${item.engravedText}'` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-4 bg-bone/50 border border-cocoa/20 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between text-muted-taupe">
            <span>{order.discountAmount ? 'Pairs Regular Total' : 'Items Subtotal'}</span>
            <span className="font-semibold text-ink-black">
              ₦{(order.originalSubtotal ?? order.subtotal).toLocaleString()}
            </span>
          </div>

          {order.discountAmount && order.discountAmount > 0 ? (
            <div className="flex justify-between text-cocoa font-medium">
              <span>{order.discountLabel ?? '24-Hour Edit (25% Off Pairs)'}</span>
              <span>-₦{order.discountAmount.toLocaleString()}</span>
            </div>
          ) : null}

          <div className="flex justify-between text-muted-taupe">
            <span>
              Delivery Fee
              {order.discountAmount ? ' (Standard Rate · Excluded)' : ''}
            </span>
            <span className="font-semibold text-ink-black">{formattedDelivery}</span>
          </div>

          <div className="pt-2 border-t border-cocoa/20 flex justify-between items-baseline text-sm">
            <span className="font-bold text-ink-black">Total Paid Online</span>
            <div className="text-right">
              <span className="font-bold text-ink-black text-base">{formattedTotal}</span>
              <span className="block text-[10px] uppercase tracking-wider text-cocoa font-medium">
                Verified via {order.payment.provider.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Destination & Quality Assurance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Customer Address Details */}
          <div className="p-4.5 bg-bone/40 border border-cocoa/20 rounded-xl space-y-1.5 text-xs text-ink-black/85">
            <span className="text-[10px] uppercase tracking-widest text-muted-taupe font-semibold block mb-1">
              Dispatch Destination
            </span>
            <p className="font-semibold">{order.customer.fullName}</p>
            <p>{order.customer.address}</p>
            <p>{order.customer.city}, {order.customer.state}</p>
            <p className="text-muted-taupe">Phone: {order.customer.phone}</p>
            <p className="text-muted-taupe">Email: {order.customer.email}</p>
            {order.customer.deliveryNotes && (
              <p className="pt-2 text-[11px] text-cocoa italic">
                Note: “{order.customer.deliveryNotes}”
              </p>
            )}
          </div>

          {/* Quick Leather Care & Lagos Atelier Note */}
          <div className="p-4.5 bg-bone/40 border border-cocoa/20 rounded-xl space-y-2.5 text-xs text-ink-black/85">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-taupe font-semibold">
                Quick Care Notes
              </span>
              <Link
                href="/care"
                className="text-[11px] font-medium text-cocoa hover:text-ink-black underline underline-offset-4"
              >
                Full Care Guide
              </Link>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-taupe leading-relaxed">
              <li><strong className="text-ink-black font-medium">1. After wear:</strong> Wipe away street dust gently with a dry cloth.</li>
              <li><strong className="text-ink-black font-medium">2. Monthly:</strong> Rub in a drop of plain leather cream to keep straps soft.</li>
              <li><strong className="text-ink-black font-medium">3. Rain &amp; storage:</strong> Air-dry wet pairs in shade and store flat inside the cotton dust bag.</li>
            </ul>
            <div className="flex items-center gap-1.5 text-[11px] text-cocoa pt-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Checked by hand before leaving our Lagos studio.</span>
            </div>
          </div>
        </div>

        {/* Support Contact Routes (WhatsApp & Email) */}
        <div className="pt-6 border-t border-cocoa/20 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xs uppercase tracking-[0.18em] font-bold text-ink-black">
              Questions or Delivery Updates?
            </h2>
            <p className="text-xs text-muted-taupe">
              Our support team is available directly to track dispatch or answer care questions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <WhatsAppLink
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              placement="order_confirmation_support"
              orderId={order.id}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-espresso text-warm-white text-xs uppercase tracking-[0.16em] font-semibold hover:bg-ink-black transition-all duration-200 rounded-full focus-dark min-h-[48px] shadow-apple-sm active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 text-warm-white" />
              <span>Message Support on WhatsApp</span>
            </WhatsAppLink>

            <a
              href={`mailto:${SITE_SETTINGS.supportContact.email}?subject=Order%20Inquiry%20${order.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-warm-white border border-cocoa/40 text-ink-black text-xs uppercase tracking-[0.16em] font-semibold hover:bg-bone transition-all duration-200 rounded-full focus-dark min-h-[48px] shadow-apple-sm active:scale-[0.98]"
            >
              <Mail className="w-4 h-4 text-cocoa" />
              <span>Email Support</span>
            </a>
          </div>
        </div>

        {/* Return to Shop Action & Sign-off */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-cocoa/15 text-xs">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-cocoa hover:text-ink-black font-semibold uppercase tracking-wider underline underline-offset-4"
          >
            <span>Back to Collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/order-confirmation/${order.id}/receipt`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-espresso hover:bg-ink-black text-warm-white text-xs uppercase tracking-[0.16em] font-bold rounded-full transition-all duration-200 min-h-[40px] shadow-apple-sm active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Receipt</span>
          </Link>

          <span className="text-muted-taupe uppercase tracking-[0.2em] text-[11px] font-medium">
            noveq / crafted to move.
          </span>
        </div>

      </div>
    </div>
  );
}
