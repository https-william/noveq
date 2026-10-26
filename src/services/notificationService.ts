import { Order } from '@/types/commerce';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { syncOrderToGoogleSheets } from '@/services/googleSheetsService';
import { sendTelegramOrderNotification } from '@/services/telegramService';
import { sendOrderEmails } from '@/services/emailService';

/**
 * NOVEQ Post-Purchase Multi-Channel Notification Orchestrator
 * 
 * Delivers verified order events across all brand channels:
 * 1. Customer Order Confirmation Email & Founder Order Alert Email
 * 2. Telegram Founding Team Bot Alert
 * 3. Google Sheets Real-Time Ledger Sync
 * 4. WhatsApp Direct Concierge link prefilling
 */

export interface NotificationResult {
  orderId: string;
  emailSent: boolean;
  telegramSent: boolean;
  sheetsSynced: boolean;
  whatsAppDirectUrl: string;
  timestamp: string;
}

export async function dispatchOrderConfirmation(order: Order): Promise<NotificationResult> {
  const itemsSummary = order.items
    .map(
      (item) =>
        `• ${item.product.name} (${item.selectedSize}) x${item.quantity}${
          item.withHeartCharm ? ` [Heart Charm${item.engravedText ? ` - "${item.engravedText}"` : ''}]` : ''
        }`
    )
    .join('\n');

  const formattedTotal = `₦${order.total.toLocaleString()}`;

  // WhatsApp support prefilled message
  const whatsAppMessage = encodeURIComponent(
    `Hello NOVEQ team,\n\nI just placed order *${order.id}* for Drop 001.\n\nSummary:\n${itemsSummary}\n\nTotal Paid: ${formattedTotal}\nDelivery to: ${order.customer.city}, ${order.customer.state}\n\nPlease confirm dispatch schedule. Thank you!`
  );

  const supportPhone = SITE_SETTINGS.supportContact.phone;
  const whatsAppDirectUrl = `https://wa.me/${supportPhone}?text=${whatsAppMessage}`;

  // Server-side logging for confirmation verification
  // eslint-disable-next-line no-console
  console.info(`[NOVEQ Order Dispatch] Order ${order.id} confirmed:`, {
    customer: order.customer.fullName,
    email: order.customer.email,
    phone: order.customer.phone,
    total: formattedTotal,
    deliveryExpectation: order.deliveryExpectation,
  });

  // 1. Dispatch Emails (Direct via Resend or Google Apps Script queued)
  const emailPromise = sendOrderEmails(order).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[NotificationService] Email delivery error:', err);
    return { customerSent: false, adminSent: false, method: 'failed' };
  });

  // 2. Dispatch Telegram alert to founding team
  const telegramPromise = sendTelegramOrderNotification(order).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[NotificationService] Telegram alert error:', err);
    return false;
  });

  // 3. Sync to Google Sheets
  const sheetsPromise = syncOrderToGoogleSheets(order).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[NotificationService] Google Sheets sync error:', err);
    return { success: false, status: 0, message: String(err) };
  });

  // Await all notification channels concurrently
  const [emailResult, telegramResult, sheetsResult] = await Promise.all([
    emailPromise,
    telegramPromise,
    sheetsPromise,
  ]);

  return {
    orderId: order.id,
    emailSent: emailResult.customerSent || emailResult.method === 'apps_script_queued',
    telegramSent: Boolean(telegramResult),
    sheetsSynced: Boolean(sheetsResult?.success),
    whatsAppDirectUrl,
    timestamp: new Date().toISOString(),
  };
}
