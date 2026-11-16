'use client';

import React from 'react';
import Image from 'next/image';
import { X, FileText, MessageCircle, Trash2 } from 'lucide-react';
import { Order } from '@/types/commerce';
import { generateWaybillText, getWhatsAppUrlForOrder } from './adminUtils';

interface AdminOrderDetailModalProps {
  order: Order;
  copiedId: string | null;
  onCopyWaybill: (text: string, id: string) => void;
  onRequestDelete: (order: Order) => void;
  onClose: () => void;
}

export function AdminOrderDetailModal({
  order,
  copiedId,
  onCopyWaybill,
  onRequestDelete,
  onClose,
}: AdminOrderDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-warm-white border border-cocoa/30 max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-cocoa/15 bg-bone/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] text-cocoa block">
              Order Record
            </span>
            <h3 className="text-xl font-bold font-mono text-ink-black">
              {order.id}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="p-1.5 hover:bg-cocoa/10 rounded-full text-ink-black min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 text-xs">
          <div className="p-4 bg-bone/60 border border-cocoa/15 rounded-xl space-y-1">
            <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-cocoa">
              Buyer &amp; Delivery Address
            </div>
            <div className="text-sm font-semibold text-ink-black">
              {order.customer.fullName}
            </div>
            <div className="font-mono text-espresso">{order.customer.phone}</div>
            <div className="text-muted-taupe">{order.customer.email}</div>
            <div className="text-ink-black pt-1 font-medium">
              {order.customer.address}, {order.customer.city},{' '}
              {order.customer.state}
            </div>
            {order.customer.deliveryNotes && (
              <div className="pt-2 text-cocoa italic">
                Note: &ldquo;{order.customer.deliveryNotes}&rdquo;
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-cocoa">
              Pairs Ordered ({order.items.length})
            </div>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-bone/30 border border-cocoa/15 rounded-xl"
              >
                <div className="relative w-12 h-12 bg-bone border border-cocoa/20 rounded-lg shrink-0 overflow-hidden">
                  <Image
                    src={
                      item.product.images[0]?.src ||
                      '/images/products/the-weave-black.jpg'
                    }
                    alt={item.product.name}
                    fill
                    unoptimized={Boolean(
                      item.product.images[0]?.src?.startsWith('data:') ||
                        item.product.images[0]?.src?.startsWith('http')
                    )}
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-black truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-espresso font-mono">
                    {item.selectedColour || item.product.colour} ·{' '}
                    {item.selectedSize} · Qty {item.quantity} · ₦
                    {item.product.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-bone/50 border border-cocoa/20 rounded-xl space-y-2 font-mono">
            <div className="flex justify-between text-muted-taupe">
              <span>
                {order.discountAmount ? 'Pairs Regular Total' : 'Subtotal'}
              </span>
              <span>
                ₦{(order.originalSubtotal ?? order.subtotal).toLocaleString()}
              </span>
            </div>
            {order.discountAmount && order.discountAmount > 0 ? (
              <div className="flex justify-between text-cocoa font-semibold">
                <span>24-Hour Edit (25% Off Pairs)</span>
                <span>-₦{order.discountAmount.toLocaleString()}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-muted-taupe">
              <span>
                Delivery Fee{order.discountAmount ? ' (Excluded)' : ''}
              </span>
              <span>₦{order.deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-ink-black pt-2 border-t border-cocoa/20">
              <span>Total Paid</span>
              <span>₦{order.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() =>
                onCopyWaybill(
                  generateWaybillText(order),
                  `modal-waybill-${order.id}`
                )
              }
              className="py-3 px-4 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-bone transition-colors flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
            >
              <FileText className="w-4 h-4 text-cocoa" />
              <span>
                {copiedId === `modal-waybill-${order.id}`
                  ? 'Waybill Copied!'
                  : 'Copy Dispatch Waybill'}
              </span>
            </button>

            <a
              href={getWhatsAppUrlForOrder(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-xs uppercase tracking-wider font-semibold rounded-full transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Buyer</span>
            </a>
          </div>
        </div>

        <div className="p-4 border-t border-cocoa/15 bg-bone/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onRequestDelete(order)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-warm-white border border-oxblood/30 text-oxblood text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-oxblood/10 transition-colors min-h-[44px] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Order</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-espresso transition-colors min-h-[44px] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
