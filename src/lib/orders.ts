import { Order, PaymentStatus } from '@/types/commerce';

/**
 * Authoritative Server-Side Order Repository
 * 
 * Supports real-time back-office management, Paystack webhooks,
 * and instant CEO dispatch notifications.
 */

declare global {
  // eslint-disable-next-line no-var
  var __noveq_orders: Map<string, Order> | undefined;
}

const ordersStore: Map<string, Order> =
  global.__noveq_orders ?? new Map<string, Order>();

if (process.env.NODE_ENV !== 'production') {
  global.__noveq_orders = ordersStore;
}

export function saveOrder(order: Order): Order {
  ordersStore.set(order.id, order);
  return order;
}

export function getOrderById(orderId: string): Order | undefined {
  return ordersStore.get(orderId);
}

export function getAllOrders(): Order[] {
  return Array.from(ordersStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderByReference(reference: string): Order | undefined {
  for (const order of ordersStore.values()) {
    if (order.payment.reference === reference) {
      return order;
    }
  }
  return undefined;
}

export function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Order | undefined {
  const order = ordersStore.get(orderId);
  if (!order) return undefined;
  order.status = status;
  ordersStore.set(orderId, order);
  return order;
}

export function updateOrderPayment(
  orderId: string,
  paymentStatus: PaymentStatus,
  details?: { paidAt?: string; errorMessage?: string }
): Order | undefined {
  const order = ordersStore.get(orderId);
  if (!order) return undefined;

  order.payment.status = paymentStatus;
  if (paymentStatus === 'success') {
    order.status = 'paid';
    order.payment.paidAt = details?.paidAt || new Date().toISOString();
  } else if (paymentStatus === 'failed') {
    order.payment.errorMessage = details?.errorMessage || 'Payment failed or declined.';
  } else if (paymentStatus === 'cancelled') {
    order.payment.errorMessage = 'Payment was cancelled by the customer.';
  } else if (paymentStatus === 'timed_out') {
    order.payment.errorMessage = 'Payment session timed out.';
  }

  ordersStore.set(orderId, order);
  return order;
}
