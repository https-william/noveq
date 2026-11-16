'use client';

import React from 'react';
import Image from 'next/image';
import {
  Search,
  RefreshCw,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Check,
  MessageCircle,
  FileText,
  Eye,
  Download,
  Trash2,
} from 'lucide-react';
import { Order } from '@/types/commerce';
import {
  getOrderStatusBadge,
  normalizeOrderStatus,
  getWhatsAppUrlForOrder,
  generateWaybillText,
} from './adminUtils';

interface StatusCounts {
  all: number;
  paid: number;
  sourcing: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
}

interface AdminOrdersTabProps {
  orders: Order[];
  filteredOrders: Order[];
  statusCounts: StatusCounts;
  loading: boolean;
  filterStatus: string;
  searchQuery: string;
  expandedOrderId: string | null;
  savingStatusId: string | null;
  statusSaveFeedback: Record<string, string>;
  copiedId: string | null;
  onFilterStatusChange: (status: string) => void;
  onSearchQueryChange: (query: string) => void;
  onToggleExpandOrder: (orderId: string | null) => void;
  onInstantStatusChange: (orderId: string, status: Order['status']) => void;
  onCopy: (text: string, id: string) => void;
  onOpenOrderModal: (order: Order) => void;
  onRequestDeleteOrder: (order: Order) => void;
}

export function AdminOrdersTab({
  filteredOrders,
  statusCounts,
  loading,
  filterStatus,
  searchQuery,
  expandedOrderId,
  savingStatusId,
  statusSaveFeedback,
  copiedId,
  onFilterStatusChange,
  onSearchQueryChange,
  onToggleExpandOrder,
  onInstantStatusChange,
  onCopy,
  onOpenOrderModal,
  onRequestDeleteOrder,
}: AdminOrdersTabProps) {
  return (
    <div className="bg-warm-white border border-cocoa/20 rounded-2xl shadow-apple-sm space-y-5 p-4 sm:p-6">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
        <div>
          <h2 className="font-editorial text-2xl font-normal text-ink-black">
            Orders &amp; Delivery Queue
          </h2>
          <p className="text-xs text-muted-taupe mt-0.5">
            Newest orders appear first. Tap any order to update progress, copy a courier waybill, or message the buyer.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search
            className="w-4 h-4 absolute left-3.5 top-3 text-cocoa"
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Search orders"
            placeholder="Search order ID, name, phone, city..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-bone/60 border border-cocoa/30 rounded-full focus:outline-none focus:border-ink-black text-ink-black font-medium min-h-[42px]"
          />
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Orders', count: statusCounts.all },
          { id: 'paid', label: 'Paid', count: statusCounts.paid },
          { id: 'sourcing', label: 'In Studio', count: statusCounts.sourcing },
          {
            id: 'out for delivery',
            label: 'Out for Delivery',
            count: statusCounts.outForDelivery,
          },
          { id: 'delivered', label: 'Delivered', count: statusCounts.delivered },
          { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
        ].map((tab) => {
          const isSelected = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterStatusChange(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-colors min-h-[40px] cursor-pointer ${
                isSelected
                  ? 'bg-ink-black text-warm-white shadow-xs'
                  : 'bg-bone/70 text-cocoa hover:text-ink-black hover:bg-bone border border-cocoa/20'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full tabular-nums ${
                  isSelected
                    ? 'bg-warm-white/20 text-warm-white'
                    : 'bg-cocoa/10 text-ink-black'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading orders">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-4 bg-bone/40 border border-cocoa/15 rounded-xl animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-28 bg-cocoa/15 rounded" />
                <div className="h-4 w-16 bg-cocoa/10 rounded" />
              </div>
              <div className="h-4 w-32 bg-cocoa/15 rounded" />
              <div className="h-5 w-24 bg-cocoa/15 rounded" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-14 text-center text-xs text-muted-taupe space-y-3 border border-dashed border-cocoa/25 rounded-xl bg-bone/30 p-6">
          <ShoppingBag className="w-8 h-8 text-cocoa/40 mx-auto" />
          <div className="space-y-1">
            <p className="font-semibold text-ink-black text-sm">
              No orders match your view
            </p>
            <p>Try clearing your search text or choosing &ldquo;All Orders&rdquo;.</p>
          </div>
          {(searchQuery || filterStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                onSearchQueryChange('');
                onFilterStatusChange('all');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-warm-white border border-cocoa/30 hover:bg-espresso hover:text-warm-white text-ink-black text-xs uppercase tracking-wider font-semibold rounded-full transition-colors min-h-[40px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const statusSaved = statusSaveFeedback[order.id];
            const currentNormalizedStatus = normalizeOrderStatus(order.status);
            const hasNov27Discount = Boolean(
              order.discountAmount && order.discountAmount > 0
            );

            return (
              <div
                key={order.id}
                className={`border rounded-xl transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-ink-black/40 bg-warm-white shadow-apple-sm'
                    : 'border-cocoa/20 bg-bone/25 hover:bg-warm-white hover:border-cocoa/40'
                }`}
              >
                {/* Tappable Summary Row */}
                <div
                  onClick={() =>
                    onToggleExpandOrder(isExpanded ? null : order.id)
                  }
                  className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                >
                  {/* Left: ID, Channel, Date, Nov 27 pill */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <span className="font-mono text-xs font-bold text-ink-black">
                      {order.id}
                    </span>
                    <span
                      className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-semibold ${
                        order.id.startsWith('NOV-OFF')
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {order.id.startsWith('NOV-OFF') ? 'Offline' : 'Online'}
                    </span>
                    {hasNov27Discount && (
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-[#111111] text-[#b89b72] border border-[#b89b72]/40 font-semibold">
                        Nov 27 · -₦{order.discountAmount?.toLocaleString()}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-taupe">
                      {new Date(order.createdAt).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Middle: Customer & Destination */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-ink-black">
                      {order.customer.fullName}
                    </span>
                    <span className="text-muted-taupe">·</span>
                    <span className="text-muted-taupe">
                      {order.customer.city}
                    </span>
                    <span className="text-muted-taupe">·</span>
                    <span className="font-mono text-espresso font-medium">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} pair
                      {order.items.reduce((s, i) => s + i.quantity, 0) > 1
                        ? 's'
                        : ''}
                    </span>
                  </div>

                  {/* Right: Total, Status Pill, Expand Icon */}
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="font-mono font-bold text-ink-black text-sm tabular-nums">
                      ₦{order.total.toLocaleString()}
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border tracking-wider ${getOrderStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <div className="text-cocoa p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-ink-black" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Order Panel */}
                {isExpanded && (
                  <div className="border-t border-cocoa/15 bg-bone/40 p-4 sm:p-6 space-y-5 animate-in fade-in duration-150">
                    {/* 1. Ordered Pairs */}
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-cocoa">
                        Pairs Ordered ({order.items.length})
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-warm-white border border-cocoa/15 rounded-xl"
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
                            <div className="flex-1 min-w-0 text-xs">
                              <div className="font-semibold text-ink-black truncate">
                                {item.product.name}
                              </div>
                              <div className="text-[11px] text-espresso font-mono mt-0.5">
                                {item.selectedColour || item.product.colour} ·{' '}
                                {item.selectedSize} · Qty {item.quantity}
                              </div>
                              <div className="text-[11px] text-muted-taupe font-mono mt-0.5">
                                ₦{item.product.price.toLocaleString()} each
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Customer Contact & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-warm-white border border-cocoa/15 rounded-xl space-y-1.5">
                        <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-cocoa">
                          Buyer Contact
                        </div>
                        <div className="font-semibold text-sm text-ink-black">
                          {order.customer.fullName}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-taupe">Phone:</span>
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="font-mono text-espresso font-semibold hover:underline"
                          >
                            {order.customer.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-muted-taupe">Email:</span>
                          <span className="font-mono text-muted-taupe truncate">
                            {order.customer.email.includes('@client.noveq') ? (
                              <span className="italic">No email (offline entry)</span>
                            ) : (
                              order.customer.email
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-warm-white border border-cocoa/15 rounded-xl space-y-2">
                        <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-cocoa">
                          Delivery Destination
                        </div>
                        <div className="font-medium text-ink-black leading-relaxed">
                          {order.customer.address}, {order.customer.city},{' '}
                          {order.customer.state}
                        </div>
                        {order.customer.deliveryNotes ? (
                          <div className="p-2.5 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-lg text-[11px]">
                            <span className="font-semibold">Courier note: </span>
                            &ldquo;{order.customer.deliveryNotes}&rdquo;
                          </div>
                        ) : (
                          <div className="text-muted-taupe text-[11px] italic">
                            No special courier note added.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Status Control & Quick Actions */}
                    <div className="p-4 bg-warm-white border border-cocoa/20 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <label className="text-[11px] uppercase tracking-[0.14em] font-semibold text-cocoa">
                          Progress:
                        </label>

                        <select
                          value={currentNormalizedStatus}
                          disabled={savingStatusId === order.id}
                          onChange={(e) =>
                            onInstantStatusChange(
                              order.id,
                              e.target.value as Order['status']
                            )
                          }
                          className={`text-xs font-semibold px-3.5 py-2 rounded-lg border tracking-wide focus:outline-none focus:border-ink-black cursor-pointer min-h-[40px] ${getOrderStatusBadge(
                            order.status
                          )}`}
                        >
                          <option value="paid">Paid · Ready for Workshop</option>
                          <option value="sourcing">In Studio · Handcrafting</option>
                          <option value="out for delivery">
                            Out for Delivery · With Courier
                          </option>
                          <option value="delivered">Delivered · Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {statusSaved && (
                          <span className="text-xs font-semibold text-emerald-700 animate-in fade-in flex items-center gap-1 font-mono">
                            <Check className="w-3.5 h-3.5" />
                            {statusSaved}
                          </span>
                        )}
                        {savingStatusId === order.id && (
                          <span className="text-xs text-muted-taupe flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin text-espresso" />
                            Saving...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={getWhatsAppUrlForOrder(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-warm-white text-xs uppercase tracking-wider font-semibold rounded-full transition-colors shadow-xs min-h-[42px] cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp Update</span>
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            onCopy(
                              generateWaybillText(order),
                              `waybill-${order.id}`
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-bone/70 border border-cocoa/25 hover:bg-warm-white text-ink-black text-xs font-medium rounded-full transition-colors min-h-[42px] cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-cocoa" />
                          <span>
                            {copiedId === `waybill-${order.id}`
                              ? 'Waybill Copied'
                              : 'Copy Waybill'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenOrderModal(order)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-bone/70 border border-cocoa/25 hover:bg-warm-white text-ink-black text-xs font-medium rounded-full transition-colors min-h-[42px] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-espresso" />
                          <span>Summary</span>
                        </button>

                        <a
                          href={`/order-confirmation/${order.id}/receipt`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-bone/70 border border-cocoa/25 hover:bg-warm-white text-ink-black text-xs font-medium rounded-full transition-colors min-h-[42px]"
                        >
                          <Download className="w-3.5 h-3.5 text-cocoa" />
                          <span>Receipt</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => onRequestDeleteOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-bone/70 border border-oxblood/25 hover:bg-oxblood/10 text-oxblood text-xs font-medium rounded-full transition-colors min-h-[42px] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
