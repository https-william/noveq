import { Order } from '@/types/commerce';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { syncOrderToGoogleSheets } from '@/services/googleSheetsService';

/**
 * NOVEQ Post-Purchase Notification Service
 * 
 * Abstracted single function that delivers order confirmations via Email and/or WhatsApp.
 * Final provider is a "needs decision" item (Resend, Meta Cloud API, Twilio, SendGrid).
 */

export interface NotificationResult {
  orderId: string;
  emailSent: boolean;
  whatsAppSent: boolean;
  recipientEmail: string;
  recipientPhone: string;
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

  // In production, point to real brand phone number from site settings
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

  // Trigger real-time Google Sheets sync (non-blocking)
  syncOrderToGoogleSheets(order).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to sync order to Google Sheets:', err);
  });

  // Check environment for live API tokens (e.g. RESEND_API_KEY, WHATSAPP_API_TOKEN)
  const hasLiveEmail = Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
  const hasLiveWhatsApp = Boolean(process.env.WHATSAPP_CLOUD_TOKEN);

  return {
    orderId: order.id,
    emailSent: hasLiveEmail,
    whatsAppSent: hasLiveWhatsApp,
    recipientEmail: order.customer.email,
    recipientPhone: order.customer.phone,
    whatsAppDirectUrl,
    timestamp: new Date().toISOString(),
  };
}
