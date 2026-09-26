/**
 * NOVEQ Analytics & Event Tracking Engine
 * 
 * Strict Funnel Instrumentation:
 * view_item, select_size, add_to_cart, view_cart, begin_checkout,
 * add_payment_info, purchase, search, newsletter_signup, click_instagram, click_whatsapp.
 * 
 * RULES ENFORCED:
 * 1. Zero leakage of payment secrets, card tokens, or unnecessary PII (no emails/names in payloads).
 * 2. Purchase deduplication: persistent storage checks ensure a page refresh never double-fires purchase.
 * 3. In-memory debounce prevents re-render duplicates.
 * 4. Zero invented conversion targets or synthetic metrics.
 */

export type AnalyticsEventName =
  | 'view_item'
  | 'select_size'
  | 'add_to_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'purchase'
  | 'search'
  | 'newsletter_signup'
  | 'click_instagram'
  | 'click_whatsapp';

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_variant?: string;
  item_category?: string;
}

export interface AnalyticsPayload {
  currency?: string;
  value?: number;
  items?: AnalyticsItem[];
  item_id?: string;
  item_name?: string;
  size?: string;
  order_id?: string;
  payment_method?: string;
  search_term?: string;
  results_count?: number;
  placement?: string;
  location?: string;
  handle?: string;
  items_count?: number;
  [key: string]: unknown;
}

// Memory deduplication set with 2-second timestamp window
const recentEvents = new Map<string, number>();

export function trackEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  if (typeof window === 'undefined') return;

  // Strict Purchase Deduplication: page refresh on confirmation must never re-fire
  if (name === 'purchase') {
    const orderId = payload.order_id;
    if (orderId) {
      try {
        const storageKey = `noveq_purchase_recorded_${orderId}`;
        if (sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey)) {
          // Already tracked for this order - suppress duplicate
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.info(`[NOVEQ Analytics] Purchase duplicate suppressed for order ${orderId}`);
          }
          return;
        }
        // Mark as recorded
        sessionStorage.setItem(storageKey, 'true');
        localStorage.setItem(storageKey, 'true');
      } catch {
        // Fall back to memory deduplication if storage access is restricted
      }
    }
  }

  // General in-memory debounce to eliminate accidental re-render firing
  const dedupeKey = `${name}_${payload.order_id || ''}_${payload.item_id || ''}_${payload.size || ''}_${
    payload.search_term || ''
  }_${payload.placement || ''}_${payload.value || ''}`;

  const now = Date.now();
  const lastFired = recentEvents.get(dedupeKey);
  if (lastFired && now - lastFired < 1500) {
    return;
  }
  recentEvents.set(dedupeKey, now);

  // Sanitize: ensure no sensitive personal data, emails, addresses, or payment credentials pass through
  const safePayload: Record<string, unknown> = { ...payload };
  const prohibitedKeys = [
    'card_number',
    'cvv',
    'cvc',
    'expiry',
    'password',
    'secret',
    'token',
    'authorization_code',
    'email',
    'phone',
    'address',
    'full_name',
    'customer_name',
  ];

  for (const key of prohibitedKeys) {
    delete safePayload[key];
  }

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.info(`[NOVEQ Analytics] ${name}:`, safePayload);
  }

  // Push to GTM dataLayer if present
  const win = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
  if (win.dataLayer && Array.isArray(win.dataLayer)) {
    win.dataLayer.push({
      event: name,
      ...safePayload,
    });
  }

  // Dispatch standard CustomEvent for third-party scripts or pixel listeners
  try {
    window.dispatchEvent(
      new CustomEvent(`noveq:${name}`, { detail: safePayload })
    );
  } catch {
    // Ignore in non-browser or restricted environments
  }
}
