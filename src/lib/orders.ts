import { Order, PaymentStatus } from '@/types/commerce';
import { DROP_001_PRODUCTS } from '@/data/products';

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

// Pre-populate initial 3 Drop 001 orders if store is empty
if (ordersStore.size === 0) {
  const sampleOrders: Order[] = [
    {
      id: 'NVQ-2026-001',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      customer: {
        fullName: 'Amina Bello',
        email: 'amina.bello@gmail.com',
        phone: '+2348031234567',
        address: '14 Admiralty Way, Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos State',
        zoneId: 'lagos-island',
        deliveryNotes: 'Please call on arrival, leave with security if unavailable.',
      },
      items: [
        {
          product: DROP_001_PRODUCTS[0], // The Twist Slide Pam
          selectedSize: 'EU 38',
          quantity: 1,
          withHeartCharm: true,
          engravedText: 'AB',
        },
      ],
      subtotal: 20000,
      deliveryFee: 3000,
      total: 23000,
      currency: 'NGN',
      status: 'paid',
      payment: {
        status: 'success',
        reference: 'PST_PAY_001_982341',
        provider: 'paystack',
        paidAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      },
      deliveryExpectation: 'Dispatch scheduled within 24 hours via Lagos Express.',
    },
    {
      id: 'NVQ-2026-002',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      customer: {
        fullName: 'Chioma Okonkwo',
        email: 'chioma.o@yahoo.com',
        phone: '+2348129876543',
        address: '8 Isaac John Street, GRA Ikeja',
        city: 'Lagos',
        state: 'Lagos State',
        zoneId: 'lagos-mainland',
      },
      items: [
        {
          product: DROP_001_PRODUCTS[1], // The Bar Slide Pam
          selectedSize: 'EU 39',
          quantity: 1,
        },
      ],
      subtotal: 20000,
      deliveryFee: 3000,
      total: 23000,
      currency: 'NGN',
      status: 'processing',
      payment: {
        status: 'success',
        reference: 'PST_PAY_002_771239',
        provider: 'paystack',
        paidAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
      },
      deliveryExpectation: 'Craft inspection completed. Preparing packaging suite.',
    },
    {
      id: 'NVQ-2026-003',
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
      customer: {
        fullName: 'Zainab Danjuma',
        email: 'zainab.danjuma@outlook.com',
        phone: '+2349051122334',
        address: 'Plot 412 Maitama Avenue',
        city: 'Abuja',
        state: 'FCT',
        zoneId: 'fct-abuja',
      },
      items: [
        {
          product: DROP_001_PRODUCTS[2], // The Double Skin Pam
          selectedSize: 'EU 37',
          quantity: 1,
        },
      ],
      subtotal: 20000,
      deliveryFee: 5000,
      total: 25000,
      currency: 'NGN',
      status: 'shipped',
      payment: {
        status: 'success',
        reference: 'PST_PAY_003_449120',
        provider: 'paystack',
        paidAt: new Date(Date.now() - 1000 * 60 * 230).toISOString(),
      },
      deliveryExpectation: 'Handed over to GIG Logistics tracked regional dispatch.',
    },
  ];

  sampleOrders.forEach((order) => ordersStore.set(order.id, order));
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
