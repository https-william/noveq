import fs from 'fs';
import path from 'path';
import { Order, PaymentStatus } from '@/types/commerce';
import { supabaseAdmin } from './supabase';

/**
 * Authoritative Server-Side Order Repository
 * 
 * Synchronizes with Supabase Postgres table `orders` and provides
 * local disk persistence `data/orders.json` and in-memory caching.
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

declare global {
  // eslint-disable-next-line no-var
  var __noveq_orders: Map<string, Order> | undefined;
}

function loadInitialOrders(): Map<string, Order> {
  const map = new Map<string, Order>();
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const list: Order[] = JSON.parse(data);
      for (const item of list) {
        map.set(item.id, item);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load orders from disk:', err);
  }
  return map;
}

const ordersStore: Map<string, Order> =
  global.__noveq_orders ?? loadInitialOrders();

if (process.env.NODE_ENV !== 'production') {
  global.__noveq_orders = ordersStore;
}

function persistOrdersToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(ordersStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist orders to disk:', err);
  }
}

function syncOrderToSupabase(order: Order) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }
  try {
    supabaseAdmin
      .from('orders')
      .upsert({
        id: order.id,
        created_at: order.createdAt,
        status: order.status,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee,
        total: order.total,
        currency: order.currency,
        delivery_expectation: order.deliveryExpectation,
        payment: order.payment,
        notes: order.notes || null,
      })
      .then(({ error }) => {
        if (error && !error.message?.includes('schema cache')) {
          // eslint-disable-next-line no-console
          console.error('Supabase order sync error:', error.message);
        }
      });
  } catch {
    // Non-blocking for commerce execution
  }
}

export function saveOrder(order: Order): Order {
  ordersStore.set(order.id, order);
  persistOrdersToFile();
  syncOrderToSupabase(order);
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
  persistOrdersToFile();
  syncOrderToSupabase(order);
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
  persistOrdersToFile();
  syncOrderToSupabase(order);
  return order;
}
