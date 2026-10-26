import fs from 'fs';
import path from 'path';
import { Order, PaymentStatus } from '@/types/commerce';
import { supabaseAdmin } from './supabase';

/**
 * Authoritative Server-Side Order Repository
 * 
 * Multi-layer persistence:
 * 1. Fast in-memory cache (`ordersStore`)
 * 2. Cloud persistence via Supabase Storage (`products` bucket, `orders/` path)
 * 3. Postgres `orders` table sync (when schema exists)
 * 4. Local disk file `data/orders.json` (for local development)
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const STORAGE_BUCKET = 'products';
const STORAGE_ORDERS_FILE = 'orders/orders.json';

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
    console.error('Failed to load initial orders from disk:', err);
  }
  return map;
}

const ordersStore: Map<string, Order> =
  global.__noveq_orders ?? loadInitialOrders();

if (process.env.NODE_ENV !== 'production') {
  global.__noveq_orders = ordersStore;
}

/**
 * Safe local disk persistence (does not crash on read-only serverless filesystems like Vercel)
 */
function persistOrdersToFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(ordersStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // Serverless runtime environment (e.g. Vercel read-only filesystem)
  }
}

/**
 * Upload single order and aggregated order catalog to Supabase Storage
 */
async function syncOrderToCloudStorage(order: Order): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }
  try {
    // 1. Upload individual order file for lightning-fast direct lookup
    await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(`orders/${order.id}.json`, Buffer.from(JSON.stringify(order, null, 2)), {
        contentType: 'application/json',
        upsert: true,
      });

    // 2. Upload aggregated catalog file
    const allList = Array.from(ordersStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_ORDERS_FILE, Buffer.from(JSON.stringify(allList, null, 2)), {
        contentType: 'application/json',
        upsert: true,
      });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[OrderStore] Supabase storage upload warning:', err);
  }
}

/**
 * Sync to Supabase Postgres (non-blocking fallback)
 */
function syncOrderToPostgres(order: Order): void {
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
      .then(
        ({ error }) => {
          if (error && !error.message?.includes('schema cache')) {
            // eslint-disable-next-line no-console
            console.error('[OrderStore] Postgres sync error:', error.message);
          }
        },
        () => {}
      );
  } catch {
    // Non-blocking
  }
}

/**
 * Save an order with multi-tier persistence
 */
export async function saveOrder(order: Order): Promise<Order> {
  ordersStore.set(order.id, order);
  persistOrdersToFile();

  // Non-blocking Postgres sync
  syncOrderToPostgres(order);

  // Cloud storage sync ensures persistence across all serverless lambda instances
  await syncOrderToCloudStorage(order);

  return order;
}

/**
 * Fetch a single order by ID with cloud-backed failover
 */
export async function getOrderById(orderId: string): Promise<Order | undefined> {
  // 1. Check in-memory store
  if (ordersStore.has(orderId)) {
    return ordersStore.get(orderId);
  }

  // 2. Fetch directly from cloud storage by individual order path
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .download(`orders/${orderId}.json`);

      if (!error && data) {
        const text = await data.text();
        const parsed: Order = JSON.parse(text);
        ordersStore.set(parsed.id, parsed);
        return parsed;
      }
    } catch {
      // Continue to next fallback
    }

    // 3. Check aggregated cloud storage catalog
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .download(STORAGE_ORDERS_FILE);

      if (!error && data) {
        const text = await data.text();
        const list: Order[] = JSON.parse(text);
        for (const item of list) {
          ordersStore.set(item.id, item);
        }
        if (ordersStore.has(orderId)) {
          return ordersStore.get(orderId);
        }
      }
    } catch {
      // Continue to next fallback
    }
  }

  // 4. Fallback to local disk file
  reloadOrdersFromDisk();
  return ordersStore.get(orderId);
}

/**
 * Reload local orders from disk
 */
export function reloadOrdersFromDisk(): Map<string, Order> {
  const diskOrders = loadInitialOrders();
  for (const [k, v] of diskOrders.entries()) {
    if (!ordersStore.has(k)) {
      ordersStore.set(k, v);
    }
  }
  return ordersStore;
}

/**
 * Fetch all orders, refreshing from cloud storage
 */
export async function getAllOrders(): Promise<Order[]> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .download(STORAGE_ORDERS_FILE);

      if (!error && data) {
        const text = await data.text();
        const list: Order[] = JSON.parse(text);
        for (const item of list) {
          ordersStore.set(item.id, item);
        }
      }
    } catch {
      // Fall back to memory
    }
  }

  reloadOrdersFromDisk();

  return Array.from(ordersStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Look up an order by its Paystack transaction reference
 */
export async function getOrderByReference(reference: string): Promise<Order | undefined> {
  // Check memory
  for (const order of ordersStore.values()) {
    if (order.payment?.reference === reference) {
      return order;
    }
  }

  // Refresh from cloud storage
  await getAllOrders();

  for (const order of ordersStore.values()) {
    if (order.payment?.reference === reference) {
      return order;
    }
  }

  return undefined;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<Order | undefined> {
  const order = await getOrderById(orderId);
  if (!order) return undefined;

  order.status = status;
  await saveOrder(order);
  return order;
}

/**
 * Update order payment details and sync everywhere
 */
export async function updateOrderPayment(
  orderId: string,
  paymentStatus: PaymentStatus,
  details?: { paidAt?: string; errorMessage?: string }
): Promise<Order | undefined> {
  const order = await getOrderById(orderId);
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

  await saveOrder(order);
  return order;
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string): Promise<boolean> {
  const removed = ordersStore.delete(orderId);
  if (removed) {
    persistOrdersToFile();

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([`orders/${orderId}.json`]);

        const allList = Array.from(ordersStore.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        await supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .upload(STORAGE_ORDERS_FILE, Buffer.from(JSON.stringify(allList, null, 2)), {
            contentType: 'application/json',
            upsert: true,
          });

        supabaseAdmin.from('orders').delete().eq('id', orderId).then(() => {});
      } catch {
        // Non-blocking
      }
    }
  }
  return removed;
}
