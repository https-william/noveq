'use client';

import React, { useMemo } from 'react';
import { Order, Product } from '@/types/commerce';
import { WORLDWIDE_WOMEN_SIZES } from '@/config/sizing';
import { AdminTab } from './adminUtils';

interface StatusCounts {
  all: number;
  paid: number;
  sourcing: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
}

interface AdminMetricsTabProps {
  orders: Order[];
  products: Product[];
  statusCounts: StatusCounts;
  onJumpToFilteredOrders: (status: string) => void;
  onSwitchTab: (tab: AdminTab) => void;
}

export function AdminMetricsTab({
  orders,
  products,
  statusCounts,
  onJumpToFilteredOrders,
}: AdminMetricsTabProps) {
  const analytics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const onlineRevenue = activeOrders
      .filter((o) => !o.id.startsWith('NOV-OFF'))
      .reduce((s, o) => s + o.total, 0);
    const offlineRevenue = activeOrders
      .filter((o) => o.id.startsWith('NOV-OFF'))
      .reduce((s, o) => s + o.total, 0);
    const totalRevenue = onlineRevenue + offlineRevenue;
    const avgOrderValue =
      activeOrders.length > 0 ? Math.round(totalRevenue / activeOrders.length) : 0;

    const discountedOrders = activeOrders.filter(
      (o) => Boolean(o.discountAmount && o.discountAmount > 0)
    );
    const totalDiscountsGiven = discountedOrders.reduce(
      (s, o) => s + (o.discountAmount || 0),
      0
    );

    // Demand across worldwide sizes EU 34–44
    const sizeMap = new Map<string, number>();
    WORLDWIDE_WOMEN_SIZES.forEach((s) => sizeMap.set(s.eu, 0));
    activeOrders.forEach((o) => {
      o.items.forEach((item) => {
        const key = item.selectedSize.trim().toUpperCase();
        sizeMap.set(key, (sizeMap.get(key) || 0) + item.quantity);
      });
    });

    const sizeEntries = Array.from(sizeMap.entries());
    const maxSizeCount = Math.max(1, ...sizeEntries.map(([, c]) => c));

    // Top cities
    const cityMap = new Map<string, { orders: number; revenue: number }>();
    activeOrders.forEach((o) => {
      const city = (o.customer.city || 'Lagos').trim();
      const prev = cityMap.get(city) || { orders: 0, revenue: 0 };
      cityMap.set(city, {
        orders: prev.orders + 1,
        revenue: prev.revenue + o.total,
      });
    });
    const topCities = Array.from(cityMap.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);

    return {
      onlineRevenue,
      offlineRevenue,
      totalRevenue,
      avgOrderValue,
      discountedCount: discountedOrders.length,
      totalDiscountsGiven,
      sizeEntries,
      maxSizeCount,
      topCities,
    };
  }, [orders]);

  return (
    <div className="bg-warm-white border border-cocoa/12 rounded-2xl space-y-6 p-5 sm:p-6">
      <div className="border-b border-cocoa/12 pb-4">
        <h2 className="font-editorial text-2xl font-normal text-ink-black">
          Sales, Sizes &amp; Workshop Pipeline
        </h2>
        <p className="text-xs text-muted-taupe mt-0.5">
          Clear look at where orders sit right now, which sizes sell fastest, and how online vs. offline sales compare.
        </p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-bone/50 border border-cocoa/12 space-y-1">
          <span className="text-[11px] text-cocoa font-medium">
            Website vs. Offline Sales
          </span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xs text-muted-taupe">Online Paystack</span>
            <span className="font-mono font-medium text-ink-black tabular-nums">
              ₦{analytics.onlineRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-taupe">Manual / Offline</span>
            <span className="font-mono font-medium text-espresso tabular-nums">
              ₦{analytics.offlineRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-bone/50 border border-cocoa/12 space-y-1">
          <span className="text-[11px] text-cocoa font-medium">
            Average Order Value
          </span>
          <div className="text-2xl font-medium font-mono text-ink-black pt-1 tabular-nums">
            ₦{analytics.avgOrderValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-taupe">
            Across active non-cancelled orders
          </p>
        </div>

        <div className="p-4 rounded-xl bg-bone/50 border border-cocoa/12 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-cocoa font-medium">
              Nov 27 · 25% Edit Impact
            </span>
            <span className="px-2 py-0.5 rounded-full bg-warm-white border border-cocoa/12 text-[10px] font-mono text-espresso">
              24-Hour Edit
            </span>
          </div>
          <div className="text-2xl font-medium font-mono text-ink-black pt-1 tabular-nums">
            {analytics.discountedCount} orders
          </div>
          <p className="text-[11px] text-muted-taupe">
            ₦{analytics.totalDiscountsGiven.toLocaleString()} total savings applied
          </p>
        </div>
      </div>

      {/* Fulfillment Pipeline Bar */}
      <div className="p-4 sm:p-5 bg-bone/50 border border-cocoa/12 rounded-xl space-y-3">
        <div className="flex justify-between items-center text-xs font-medium text-cocoa">
          <span>Order Progress Pipeline (Tap any stage to filter)</span>
          <span className="font-mono text-ink-black tabular-nums">{orders.length} Total</span>
        </div>

        <div className="h-3.5 w-full bg-warm-white rounded-full overflow-hidden flex border border-cocoa/20">
          {orders.length > 0 ? (
            <>
              <div
                style={{ width: `${(statusCounts.paid / orders.length) * 100}%` }}
                className="bg-amber-500 transition-all"
                title={`Paid: ${statusCounts.paid}`}
              />
              <div
                style={{
                  width: `${(statusCounts.sourcing / orders.length) * 100}%`,
                }}
                className="bg-blue-600 transition-all"
                title={`In Studio: ${statusCounts.sourcing}`}
              />
              <div
                style={{
                  width: `${(statusCounts.outForDelivery / orders.length) * 100}%`,
                }}
                className="bg-purple-600 transition-all"
                title={`Out for Delivery: ${statusCounts.outForDelivery}`}
              />
              <div
                style={{
                  width: `${(statusCounts.delivered / orders.length) * 100}%`,
                }}
                className="bg-emerald-600 transition-all"
                title={`Delivered: ${statusCounts.delivered}`}
              />
              <div
                style={{
                  width: `${(statusCounts.cancelled / orders.length) * 100}%`,
                }}
                className="bg-gray-400 transition-all"
                title={`Cancelled: ${statusCounts.cancelled}`}
              />
            </>
          ) : (
            <div className="w-full bg-bone" />
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          {[
            {
              key: 'paid',
              label: 'Paid',
              count: statusCounts.paid,
              dot: 'bg-amber-500',
              text: 'text-amber-900',
            },
            {
              key: 'sourcing',
              label: 'In Studio',
              count: statusCounts.sourcing,
              dot: 'bg-blue-600',
              text: 'text-blue-900',
            },
            {
              key: 'out for delivery',
              label: 'Out for Delivery',
              count: statusCounts.outForDelivery,
              dot: 'bg-purple-600',
              text: 'text-purple-900',
            },
            {
              key: 'delivered',
              label: 'Delivered',
              count: statusCounts.delivered,
              dot: 'bg-emerald-600',
              text: 'text-emerald-900',
            },
            {
              key: 'cancelled',
              label: 'Cancelled',
              count: statusCounts.cancelled,
              dot: 'bg-gray-400',
              text: 'text-gray-700',
            },
          ].map((stage) => (
            <button
              key={stage.key}
              type="button"
              onClick={() => onJumpToFilteredOrders(stage.key)}
              className="text-left p-2 rounded-lg hover:bg-warm-white transition-colors cursor-pointer"
            >
              <div className={`flex items-center gap-1.5 font-semibold ${stage.text}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                <span>{stage.label}</span>
              </div>
              <div className="font-mono font-bold text-sm tabular-nums mt-0.5 text-ink-black">
                {stage.count} orders
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Size Demand & Top Cities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Size Demand Heatmap (EU 34–44) */}
        <div className="lg:col-span-7 p-4 sm:p-5 bg-bone/50 border border-cocoa/12 rounded-2xl space-y-3">
          <div>
            <h3 className="text-xs font-medium text-ink-black">
              Pairs Ordered by Worldwide Size (EU 34–44)
            </h3>
            <p className="text-[11px] text-muted-taupe mt-0.5">
              Helps your shoemakers cut soles for the sizes clients buy most.
            </p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {analytics.sizeEntries.map(([size, count]) => {
              const intensity = count / analytics.maxSizeCount;
              return (
                <div
                  key={size}
                  className={`p-2.5 rounded-xl border text-center transition-colors ${
                    count === 0
                      ? 'bg-warm-white/60 border-cocoa/12 text-muted-taupe'
                      : intensity >= 0.65
                      ? 'bg-espresso border-espresso text-warm-white'
                      : 'bg-warm-white border-cocoa/20 text-ink-black'
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-80">{size}</div>
                  <div className="text-sm font-medium font-mono mt-0.5 tabular-nums">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Cities */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-bone/50 border border-cocoa/12 rounded-2xl space-y-3">
          <h3 className="text-xs font-medium text-ink-black">
            Top Delivery Cities
          </h3>
          {analytics.topCities.length === 0 ? (
            <p className="text-xs text-muted-taupe py-4">
              City demand appears here once orders come in.
            </p>
          ) : (
            <div className="space-y-2.5">
              {analytics.topCities.map(([city, info]) => (
                <div
                  key={city}
                  className="flex items-center justify-between text-xs p-3 rounded-xl bg-warm-white border border-cocoa/12"
                >
                  <div>
                    <span className="font-medium text-ink-black">{city}</span>
                    <span className="text-[11px] text-muted-taupe ml-2">
                      {info.orders} order{info.orders > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="font-mono font-medium text-ink-black tabular-nums">
                    ₦{info.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Performance */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-ink-black">
          Style Performance &amp; Stock Left
        </h3>

        <div className="overflow-x-auto border border-cocoa/12 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-cocoa/12 text-muted-taupe font-medium text-[11px] bg-bone/50">
                <th className="p-3">Style</th>
                <th className="p-3">Price</th>
                <th className="p-3">Pairs Sold</th>
                <th className="p-3">Est. Value</th>
                <th className="p-3">Stock Left</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/15 bg-warm-white">
              {products.map((prod) => {
                const soldCount = orders
                  .filter((o) => o.status !== 'cancelled')
                  .reduce((sum, o) => {
                    const matching = o.items.filter(
                      (i) =>
                        i.product.slug === prod.slug ||
                        i.product.name.toLowerCase() === prod.name.toLowerCase()
                    );
                    return sum + matching.reduce((mSum, m) => mSum + m.quantity, 0);
                  }, 0);
                const prodRevenue = soldCount * prod.price;

                return (
                  <tr key={prod.slug} className="hover:bg-bone/40 transition-colors">
                    <td className="p-3 font-semibold text-ink-black">
                      {prod.name}
                    </td>
                    <td className="p-3 font-mono font-medium">
                      ₦{prod.price.toLocaleString()}
                    </td>
                    <td className="p-3 font-mono font-bold text-espresso">
                      {soldCount} pairs
                    </td>
                    <td className="p-3 font-mono font-bold text-ink-black">
                      ₦{prodRevenue.toLocaleString()}
                    </td>
                    <td className="p-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          prod.stock <= 2
                            ? 'bg-oxblood/10 text-oxblood'
                            : 'bg-bone text-ink-black'
                        }`}
                      >
                        {prod.stock} pairs
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-semibold ${
                          prod.restocking
                            ? 'bg-amber-100 text-amber-900'
                            : prod.hidden
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {prod.restocking
                          ? 'Restocking'
                          : prod.hidden
                          ? 'Hidden'
                          : 'Open'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
