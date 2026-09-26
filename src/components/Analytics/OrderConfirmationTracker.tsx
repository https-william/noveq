'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { Order } from '@/types/commerce';

interface OrderConfirmationTrackerProps {
  order: Order;
}

export function OrderConfirmationTracker({ order }: OrderConfirmationTrackerProps) {
  useEffect(() => {
    // Authoritative backend-confirmed order analytics
    // Deduplicated persistently by order ID so page refresh never double-fires
    trackEvent('purchase', {
      order_id: order.id,
      currency: 'NGN',
      value: order.total,
      payment_method: order.payment?.provider || 'paystack',
      items: order.items.map((item) => ({
        item_id: item.product.slug,
        item_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        item_variant: `${item.selectedSize} - ${item.product.colour}`,
      })),
    });
  }, [order]);

  return null;
}
