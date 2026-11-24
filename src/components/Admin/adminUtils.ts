import { Order } from '@/types/commerce';
import { Subscriber } from '@/lib/subscribers';

export type AdminTab =
  | 'orders'
  | 'products'
  | 'dashboard'
  | 'customers'
  | 'subscribers'
  | 'sheets'
  | 'bot';

export type SheetsSubTab = 'orders' | 'pnl' | 'summary' | 'sync';

export type SubscriberSegment = 'all' | 'nov27' | 'restock' | 'storefront';

export interface CustomerSummary {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface OfflineOrderForm {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  deliveryNotes: string;
  productName: string;
  colour: string;
  size: string;
  quantity: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'success' | 'pending';
  applyBlackFridayDiscount: boolean;
}

export const INITIAL_OFFLINE_FORM: OfflineOrderForm = {
  customerName: '',
  phone: '',
  email: '',
  address: '',
  city: 'Lagos',
  state: 'Lagos',
  deliveryNotes: '',
  productName: 'The Weave Slide Pam',
  colour: 'Black',
  size: 'EU 40',
  quantity: 1,
  total: 20000,
  paymentMethod: 'Direct Bank Transfer',
  paymentStatus: 'success',
  applyBlackFridayDiscount: false,
};

export function normalizeOrderStatus(status: Order['status']): Order['status'] {
  if (status === 'processing') return 'sourcing';
  if (status === 'shipped') return 'out for delivery';
  return status;
}

export function getOrderStatusBadge(status: Order['status']): string {
  switch (status) {
    case 'paid':
      return 'bg-amber-500/10 text-amber-900 border-amber-600/30';
    case 'sourcing':
    case 'processing':
      return 'bg-espresso/10 text-espresso border-espresso/25';
    case 'out for delivery':
    case 'shipped':
      return 'bg-indigo-500/10 text-indigo-900 border-indigo-400/30';
    case 'delivered':
      return 'bg-emerald-600/10 text-emerald-800 border-emerald-600/30';
    case 'cancelled':
      return 'bg-oxblood/10 text-oxblood border-oxblood/20';
    default:
      return 'bg-bone text-cocoa border-cocoa/30';
  }
}

export function getWhatsAppMessageForStatus(
  order: Order,
  status: Order['status']
): string {
  const customerName = order.customer.fullName.trim();
  const orderId = order.id;
  const city = order.customer.city || 'your delivery address';
  const itemsSummary = order.items
    .map(
      (i) =>
        `${i.product.name} (${i.selectedColour || i.product.colour}, Size ${i.selectedSize})`
    )
    .join(', ');

  switch (status) {
    case 'paid':
      return `Hello ${customerName}, thank you for choosing NOVEQ. We've received your order *${orderId}* for ${itemsSummary}. Your pair is now scheduled with our Lagos shoemakers for hand-finishing.`;

    case 'sourcing':
    case 'processing':
      return `Hello ${customerName}, a quick update on your NOVEQ order *${orderId}*: your pair (${itemsSummary}) is currently being shaped and cushioned by hand in our studio. We will let you know as soon as it goes out for delivery.`;

    case 'out for delivery':
    case 'shipped':
      return `Hello ${customerName}, your NOVEQ order *${orderId}* (${itemsSummary}) is out for delivery today to ${city}. Please keep your phone nearby for our courier. Everything is already paid in full online — no cash needed at the door.`;

    case 'delivered':
      return `Hello ${customerName}, our courier has confirmed delivery of your NOVEQ order (${itemsSummary}). We hope the fit and soft leather feel wonderful. If you ever need care tips or sizing help, simply reply here.`;

    case 'cancelled':
      return `Hello ${customerName}, your NOVEQ order *${orderId}* has been cancelled as requested. If you have any questions or would like to choose another pair later, we are always happy to help.`;

    default:
      return `Hello ${customerName}, thank you for choosing NOVEQ. Checking in on your order *${orderId}* (${itemsSummary}). Let us know if you need anything at all.`;
  }
}

export function formatNigeriaWhatsAppPhone(phone: string): string {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '234' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('234') && cleanPhone.length === 10) {
    cleanPhone = '234' + cleanPhone;
  }
  return cleanPhone;
}

export function getWhatsAppUrlForOrder(
  order: Order,
  statusOverride?: Order['status']
): string {
  const status = statusOverride || order.status;
  const message = getWhatsAppMessageForStatus(order, status);
  const cleanPhone = formatNigeriaWhatsAppPhone(order.customer.phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateWaybillText(order: Order): string {
  const itemsList = order.items
    .map(
      (i) =>
        `• ${i.product.name} — Colour: ${i.selectedColour || i.product.colour}, Size: ${i.selectedSize} (Qty: ${i.quantity})`
    )
    .join('\n');

  const discountNote =
    order.discountAmount && order.discountAmount > 0
      ? `\n24-Hour Edit Discount: -₦${order.discountAmount.toLocaleString()}`
      : '';

  return `NOVEQ DISPATCH WAYBILL
Order Reference: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}
Recipient: ${order.customer.fullName}
Phone: ${order.customer.phone}
Destination: ${order.customer.address}, ${order.customer.city}, ${order.customer.state}
Items:
${itemsList}
Notes: ${order.customer.deliveryNotes || 'None'}${discountNote}
Payment: Paid in Full (₦${order.total.toLocaleString()})
Delivery Fee: ₦${order.deliveryFee.toLocaleString()} (Settled online)`.trim();
}

export function isNov27Subscriber(sub: Subscriber): boolean {
  return (
    sub.source === 'black_friday_2026' ||
    (sub.tags || []).some((t) => t.includes('black_friday'))
  );
}

export function isRestockSubscriber(sub: Subscriber): boolean {
  return (
    sub.source.startsWith('restock_') ||
    (sub.tags || []).some((t) => t.startsWith('restock_'))
  );
}

export function getRestockTargetLabel(sub: Subscriber): string | null {
  const raw = sub.source.startsWith('restock_')
    ? sub.source
    : (sub.tags || []).find((t) => t.startsWith('restock_'));
  if (!raw) return null;

  const slug = raw.replace(/^restock_/, '');
  return slug
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ''))
    .join(' ');
}

export function getSourceDisplayLabel(sub: Subscriber): string {
  if (isNov27Subscriber(sub)) return 'Nov 27 Edit Reminder';
  const restockLabel = getRestockTargetLabel(sub);
  if (restockLabel) return `Restock · ${restockLabel}`;
  if (sub.source === 'checkout') return 'Order Checkout';
  if (sub.source === 'footer_newsletter' || sub.source === 'footer') {
    return 'Footer Newsletter';
  }
  return sub.source.replace(/_/g, ' ');
}
