'use client';

import Link from 'next/link';
import { Printer, ArrowLeft } from 'lucide-react';
import { Order } from '@/types/commerce';

interface OrderReceiptClientProps {
  order: Order;
}

export default function OrderReceiptClient({ order }: OrderReceiptClientProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-stone-100 text-ink-black py-6 print:bg-white print:py-0">
      {/* Action Bar - hidden on print */}
      <div className="max-w-2xl mx-auto px-4 mb-5 print:hidden">
        <div className="flex items-center justify-between">
          <Link
            href={`/order-confirmation/${order.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-cocoa hover:text-ink-black font-semibold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black hover:bg-espresso text-warm-white text-xs uppercase tracking-[0.14em] font-bold rounded-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Save as PDF
          </button>
        </div>
      </div>

      {/* Receipt Sheet */}
      <div className="receipt-sheet max-w-2xl mx-auto bg-white border border-cocoa/20 p-8 print:border-none print:shadow-none print:p-6 print:max-w-none">

        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-[#141414] pb-4 mb-5">
          <div>
            <p className="font-bold tracking-[0.3em] uppercase text-xl">n o v e q</p>
            <p className="text-[10px] text-cocoa uppercase tracking-[0.2em] font-semibold mt-0.5">Order Receipt</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-taupe uppercase tracking-wider">Order</p>
            <p className="font-mono text-sm font-bold">{order.id}</p>
            <p className="text-[10px] text-muted-taupe mt-0.5">{formattedDate}</p>
            <span className="inline-block mt-1 text-[9px] font-bold text-emerald-800 uppercase tracking-wider">● Payment Confirmed</span>
          </div>
        </div>

        {/* Customer */}
        <div className="grid grid-cols-2 gap-6 mb-5 text-xs">
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-cocoa font-bold mb-1">Billed To</p>
            <p className="font-semibold">{order.customer.fullName}</p>
            <p className="text-muted-taupe">{order.customer.phone}</p>
            <p className="text-muted-taupe">{order.customer.email}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-cocoa font-bold mb-1">Deliver To</p>
            <p className="font-medium leading-snug">{order.customer.address}</p>
            <p className="font-semibold">{order.customer.city}, {order.customer.state}</p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-xs mb-5">
          <thead>
            <tr className="border-b border-cocoa/30 text-[9px] uppercase tracking-[0.15em] text-cocoa font-bold">
              <th className="py-1.5 text-left font-bold">Item</th>
              <th className="py-1.5 text-left font-bold">Colour / Size</th>
              <th className="py-1.5 text-center font-bold">Qty</th>
              <th className="py-1.5 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa/10">
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-2.5 font-semibold">{item.product.name}</td>
                <td className="py-2.5 text-muted-taupe">{item.selectedColour || item.product.colour} · {item.selectedSize}</td>
                <td className="py-2.5 text-center font-mono tabular-nums">{item.quantity}</td>
                <td className="py-2.5 text-right font-mono tabular-nums font-bold">₦{(item.product.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-56 space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-taupe">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums font-semibold text-ink-black">₦{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-taupe">
              <span>Delivery</span>
              <span className="text-cocoa font-semibold">Pay rider</span>
            </div>
            <div className="flex justify-between border-t border-cocoa/30 pt-2 text-sm font-bold">
              <span>Total Paid</span>
              <span className="font-mono tabular-nums">₦{order.total.toLocaleString()}</span>
            </div>
            <p className="text-right text-[9px] text-muted-taupe font-mono uppercase tracking-wider">
              via {order.payment.provider.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-cocoa/20 pt-4 flex justify-between items-center text-[9px] text-muted-taupe font-mono">
          <span>concierge@noveq.com.ng · +234 810 000 0000</span>
          <span className="uppercase tracking-[0.15em] text-ink-black font-bold">noveq / crafted to move.</span>
        </div>
      </div>
    </div>
  );
}
