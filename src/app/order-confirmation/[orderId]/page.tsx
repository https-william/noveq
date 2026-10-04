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
    title: `Order Confirmed — ${orderId}`,
    description: `Receipt and dispatch schedule for NOVEQ order ${orderId}.`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const order = getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const formattedSubtotal = `₦${order.subtotal.toLocaleString()}`;
  const formattedDelivery = `₦${order.deliveryFee.toLocaleString()}`;
  const formattedTotal = `₦${order.total.toLocaleString()}`;

  // WhatsApp direct link with prefilled order context
  const whatsAppText = encodeURIComponent(
    `Hello NOVEQ team,\n\nI just completed payment for order *${order.id}*.\nName: ${order.customer.fullName}\nTotal Paid: ${formattedTotal}\nAddress: ${order.customer.address}, ${order.customer.city}, ${order.customer.state}\n\nPlease update me on dispatch tracking. Thank you!`
  );
  const whatsAppUrl = `https://wa.me/${SITE_SETTINGS.supportContact.phone}?text=${whatsAppText}`;

  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Authoritative backend purchase tracking (deduplicated) */}
      <OrderConfirmationTracker order={order} />

      {/* Header Banner */}
      <div className="bg-warm-white border border-cocoa/30 rounded-sm p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cocoa/15 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cocoa/10 border border-cocoa/30 flex items-center justify-center text-cocoa">
              <CheckCircle2 className="w-6 h-6 text-cocoa" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-cocoa font-bold block">
                Payment Verified & Order Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
                Thank you, {order.customer.fullName.split(' ')[0]}.
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right bg-bone p-3 rounded-xs border border-cocoa/20">
            <span className="text-[10px] uppercase tracking-wider text-muted-taupe block font-medium">
              Order Reference
            </span>
            <span className="font-mono text-sm font-bold text-ink-black select-all">
              {order.id}
            </span>
          </div>
        </div>

        {/* Delivery Expectation Callout */}
        <div className="p-4 bg-espresso text-warm-white rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-warm-white/80 shrink-0" />
            <div>
              <span className="font-semibold block uppercase tracking-wider text-[11px]">
                Delivery Expectation
              </span>
              <span className="text-muted-taupe">
                Courier dispatch scheduled within {order.deliveryExpectation} to {order.customer.city}, {order.customer.state}. (Delivery fee paid directly to rider on arrival).
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-ink-black/60 border border-cocoa/40 rounded-xs text-[10px] uppercase tracking-widest text-warm-white font-medium shrink-0">
            Drop 001 Priority
          </span>
        </div>

        {/* Items Summary */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.18em] font-bold text-ink-black flex items-center gap-2">
            <Package className="w-4 h-4 text-cocoa" />
            <span>Items Reserved ({order.items.reduce((acc, i) => acc + i.quantity, 0)})</span>
          </h2>

          <div className="border border-cocoa/20 rounded-xs divide-y divide-cocoa/15 bg-bone/30">
            {order.items.map((item) => (
              <div
                key={`${item.product.slug}-${item.selectedSize}-${item.selectedColour || ''}`}
                className="p-4 flex gap-4 items-center"
              >
                <div className="relative w-16 h-16 bg-bone border border-cocoa/20 rounded-xs shrink-0 overflow-hidden">
                  <Image
                    src={item.product.images[0]?.src || '/images/products/the-ring-burgundy.jpg'}
                    alt={item.product.name}
                    fill
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
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-bone border border-cocoa/20 text-[10px] text-cocoa rounded-xs font-medium">
                      <Heart className="w-2.5 h-2.5 fill-oxblood text-oxblood" />
                      <span>
                        Heart charm{item.engravedText ? ` — engraved '${item.engravedText}'` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-4 bg-bone/50 border border-cocoa/20 rounded-xs space-y-2 text-xs">
          <div className="flex justify-between text-muted-taupe">
            <span>Items Subtotal</span>
            <span className="font-semibold text-ink-black">{formattedSubtotal}</span>
          </div>

          <div className="flex justify-between text-muted-taupe">
            <span>Delivery Fee</span>
            <span className="font-semibold text-cocoa">Pay rider on delivery</span>
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
          <div className="p-4 bg-bone/30 border border-cocoa/20 rounded-xs space-y-1.5 text-xs text-ink-black/85">
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

          {/* Quality Assurance Notice */}
          <div className="p-4 bg-bone/30 border border-cocoa/20 rounded-xs space-y-2 text-xs text-ink-black/85">
            <span className="text-[10px] uppercase tracking-widest text-muted-taupe font-semibold block mb-1">
              Craftsmanship Assurance
            </span>
            <p className="text-xs text-muted-taupe leading-relaxed">
              Every single pair is hand-checked, conditioned, and polished by our craftsmen before dispatch to ensure absolute comfort and structural durability.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-cocoa pt-2 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Inspected and polished before handover to courier.</span>
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
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-espresso text-warm-white text-xs uppercase tracking-[0.16em] font-semibold hover:bg-ink-black transition-colors rounded-xs focus-dark min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 text-warm-white" />
              <span>Message Support on WhatsApp</span>
            </WhatsAppLink>

            <a
              href={`mailto:${SITE_SETTINGS.supportContact.email}?subject=Order%20Inquiry%20${order.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-warm-white border border-cocoa/40 text-ink-black text-xs uppercase tracking-[0.16em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark min-h-[44px]"
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

          <span className="text-muted-taupe uppercase tracking-[0.2em] text-[11px] font-medium">
            noveq / crafted to move.
          </span>
        </div>
      </div>
    </div>
  );
}
