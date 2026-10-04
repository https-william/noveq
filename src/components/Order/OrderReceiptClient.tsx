'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Printer, ArrowLeft, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Order } from '@/types/commerce';

interface OrderReceiptClientProps {
  order: Order;
}

export default function OrderReceiptClient({ order }: OrderReceiptClientProps) {
  useEffect(() => {
    // Check if auto-print was requested via query param
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('print') === 'true') {
        setTimeout(() => {
          window.print();
        }, 600);
      }
    }
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-stone-100/70 text-ink-black py-4 sm:py-8 print:bg-white print:py-0">
      {/* ── Screen-Only Action Bar (Hidden on print / PDF) ── */}
      <div className="max-w-3xl mx-auto px-4 mb-4 sm:mb-6 print:hidden">
        <div className="bg-warm-white border border-cocoa/30 rounded-xs p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href={`/order-confirmation/${order.id}`}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-cocoa hover:text-ink-black font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Confirmation</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black hover:bg-espresso text-warm-white text-xs uppercase tracking-[0.16em] font-bold rounded-xs transition-colors shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as 1-Page PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Strict 1-Page Printable Receipt Sheet ── */}
      <div className="receipt-sheet max-w-3xl mx-auto bg-warm-white border border-cocoa/30 p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-[#141414]">
        
        {/* Header Block: Brand & Official Reference */}
        <div className="border-b-2 border-[#141414] pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="font-serif tracking-[0.3em] uppercase text-2xl font-bold block text-[#141414]">
              n o v e q
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-cocoa font-bold block mt-0.5">
              Atelier Receipt // Allocation Certificate
            </span>
            <span className="text-[10px] text-muted-taupe tracking-wider block mt-0.5 font-mono">
              Drop 001 · Handcrafted in Lagos, Nigeria
            </span>
          </div>

          <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-0 border-cocoa/40 pl-3 sm:pl-0">
            <div className="inline-block border border-[#141414] px-2.5 py-1 bg-stone-50 rounded-xs">
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-emerald-800 block">
                ● Payment Verified & Allocated
              </span>
            </div>
            <div className="mt-1 font-mono text-xs font-bold tracking-tight text-[#141414]">
              REF: {order.id}
            </div>
            <div className="text-[10px] text-muted-taupe font-mono">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Client & Dispatch Destination Box */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-cocoa/20 text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-cocoa block mb-1">
              Client Allocation
            </span>
            <p className="font-bold text-[#141414] text-sm">{order.customer.fullName}</p>
            <p className="text-muted-taupe text-[11px] font-mono mt-0.5">{order.customer.phone}</p>
            <p className="text-muted-taupe text-[11px] font-mono">{order.customer.email}</p>
          </div>

          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-cocoa block mb-1">
              Dispatch Destination
            </span>
            <p className="font-medium text-[#141414] text-[11px] leading-snug">{order.customer.address}</p>
            <p className="font-semibold text-[#141414] text-[11px] mt-0.5">{order.customer.city}, {order.customer.state}</p>
            {order.customer.deliveryNotes && (
              <p className="text-[10px] text-cocoa italic mt-1 bg-bone/40 p-1 rounded-xs">
                Rider note: “{order.customer.deliveryNotes}”
              </p>
            )}
          </div>
        </div>

        {/* Itemized Allocation Table */}
        <div className="py-4 border-b border-cocoa/20">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cocoa/30 text-[9px] uppercase tracking-[0.16em] text-cocoa font-bold">
                <th className="py-1.5 font-bold">Item Specification</th>
                <th className="py-1.5 font-bold">Colourway</th>
                <th className="py-1.5 font-bold">Size</th>
                <th className="py-1.5 text-center font-bold">Qty</th>
                <th className="py-1.5 text-right font-bold">Unit Price</th>
                <th className="py-1.5 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/15">
              {order.items.map((item, idx) => {
                const itemTotal = item.product.price * item.quantity;
                return (
                  <tr key={idx} className="text-xs">
                    <td className="py-2.5 pr-2">
                      <span className="font-bold text-[#141414] block">{item.product.name}</span>
                      <span className="text-[10px] text-muted-taupe block leading-tight">
                        Full-grain Nigerian leather · Hand-beveled sole
                      </span>
                      {item.withHeartCharm && (
                        <span className="text-[10px] text-oxblood font-semibold block mt-0.5">
                          + Custom Heart Charm {item.engravedText ? `(‘${item.engravedText}’)` : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 font-medium text-[#141414]">
                      {item.selectedColour || item.product.colour}
                    </td>
                    <td className="py-2.5 font-mono font-bold text-[#141414]">
                      {item.selectedSize}
                    </td>
                    <td className="py-2.5 text-center font-mono font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 text-right font-mono text-muted-taupe">
                      ₦{item.product.price.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#141414]">
                      ₦{itemTotal.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ledger Summary */}
        <div className="py-3 border-b-2 border-[#141414] flex justify-end">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-taupe">
              <span>Items Subtotal:</span>
              <span className="font-mono font-semibold text-[#141414]">₦{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-taupe">
              <span>Tracked Delivery:</span>
              <span className="font-semibold text-cocoa">Pay rider on delivery</span>
            </div>
            <div className="pt-2 border-t border-cocoa/30 flex justify-between items-baseline text-sm">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#141414]">
                Total Settled:
              </span>
              <span className="font-mono text-base font-bold text-[#141414]">
                ₦{order.total.toLocaleString()}
              </span>
            </div>
            <div className="text-right text-[9px] uppercase tracking-wider text-muted-taupe font-mono">
              Via {order.payment.provider.replace('_', ' ').toUpperCase()} (256-bit Encrypted)
            </div>
          </div>
        </div>

        {/* Wolf & Clarity Editorial Certifications & Care Guarantee */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] leading-relaxed text-[#231815]/90">
          <div className="p-3 bg-stone-50 border border-cocoa/20 rounded-xs space-y-1">
            <span className="uppercase tracking-[0.18em] font-bold text-cocoa block text-[9px]">
              The NOVEQ Perspective // Wear in Good Health
            </span>
            <p className="italic font-serif text-[11px] text-[#141414]">
              “Same purpose. A new perspective.”
            </p>
            <p className="text-muted-taupe leading-normal">
              You know those outfits where the clothes are simple but the footwear completely elevates the look? That is what we built this pair for. Handcrafted in Nigeria with architectural discipline to anchor your everyday movement with quiet confidence.
            </p>
          </div>

          <div className="p-3 bg-stone-50 border border-cocoa/20 rounded-xs space-y-1">
            <span className="uppercase tracking-[0.18em] font-bold text-cocoa block text-[9px]">
              Artisan Check & Leather Care
            </span>
            <p className="text-muted-taupe leading-normal">
              Individually inspected, tempered, and wax-conditioned before handover to the courier. Wipe with a dry cotton cloth after wear. Buff lightly with neutral wax balm monthly to maintain rich suppleness.
            </p>
            <div className="pt-1 flex items-center gap-1 font-mono text-[9px] text-cocoa font-bold">
              <ShieldCheck className="w-3 h-3 text-cocoa inline" />
              <span>Certified Artisan Batch · Drop 001 Priority</span>
            </div>
          </div>
        </div>

        {/* Concierge Support Footer */}
        <div className="mt-4 pt-3 border-t border-cocoa/20 flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px] text-muted-taupe font-mono">
          <div>
            <span>Concierge WhatsApp: +234 810 000 0000</span>
            <span className="mx-2">·</span>
            <span>Email: concierge@noveq.com.ng</span>
          </div>
          <div className="uppercase tracking-[0.15em] text-[#141414] font-bold">
            noveq / crafted to move.
          </div>
        </div>
      </div>
    </div>
  );
}
