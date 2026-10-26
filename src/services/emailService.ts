import { Order } from '@/types/commerce';
import { SITE_SETTINGS } from '@/config/siteSettings';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.noveq.com.ng';
const BRAND_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'noveqthebrand@gmail.com';

/**
 * Generate luxury-styled HTML email receipt for the customer
 */
export function generateCustomerReceiptHtml(order: Order): string {
  const firstName = order.customer.fullName.split(' ')[0] || order.customer.fullName;
  const formattedTotal = `₦${order.total.toLocaleString()}`;
  const receiptUrl = `${SITE_URL}/order-confirmation/${order.id}/receipt`;
  const cleanPhone = SITE_SETTINGS.supportContact.phone;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #EBE7DF;">
        <td style="padding: 14px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong style="color: #2A1B15; font-size: 14px; display: block;">${item.product.name}</strong>
          <span style="color: #7A7265; font-size: 12px;">Size: ${item.selectedSize} · Colour: ${item.selectedColour || item.product.colour}</span>
          ${item.withHeartCharm ? `<div style="color: #7C3F1D; font-size: 11px; margin-top: 3px;">+ Brass Heart Charm${item.engravedText ? ` (Engraved: "${item.engravedText}")` : ''}</div>` : ''}
        </td>
        <td style="padding: 14px 0; text-align: center; color: #5B4033; font-size: 13px;">
          x${item.quantity}
        </td>
        <td style="padding: 14px 0; text-align: right; color: #2A1B15; font-weight: 600; font-size: 14px;">
          ₦${(item.product.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>NOVEQ Order Confirmed</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2A1B15; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F4; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E8E3D8; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(42, 27, 21, 0.04);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2A1B15; padding: 32px 24px; text-align: center;">
              <span style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; letter-spacing: 0.15em; color: #FAF8F4; text-transform: uppercase; display: block;">
                NOVEQ
              </span>
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #BAAA9E; margin-top: 4px; display: block;">
                Drop 001 · Lagos Workshop
              </span>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 32px 28px 20px 28px;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #7C3F1D; font-weight: 700; display: block; margin-bottom: 8px;">
                Payment Verified & Confirmed
              </span>
              <h1 style="font-size: 24px; font-weight: 700; color: #2A1B15; margin: 0 0 12px 0; letter-spacing: -0.02em;">
                Thank you, ${firstName}.
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 20px 0;">
                Your order <strong>${order.id}</strong> has been confirmed and placed in our workshop dispatch schedule. Every pair in Drop 001 is hand-finished in Lagos with full-grain Nigerian hides.
              </p>

              <!-- Order Summary Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0 16px 0; border-top: 2px solid #2A1B15;">
                <thead>
                  <tr style="border-bottom: 1px solid #EBE7DF; text-transform: uppercase; font-size: 10px; letter-spacing: 0.15em; color: #7A7265;">
                    <th align="left" style="padding: 10px 0;">Item</th>
                    <th align="center" style="padding: 10px 0;">Qty</th>
                    <th align="right" style="padding: 10px 0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Financial Totals -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 8px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #7A7265;">Subtotal</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #2A1B15; font-weight: 600;">₦${order.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #7A7265;">Delivery Fee</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #2A1B15;">
                    ${order.deliveryFee > 0 ? `₦${order.deliveryFee.toLocaleString()}` : 'Pay to rider on arrival'}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #2A1B15; font-size: 16px;">
                  <td style="padding: 12px 0; font-weight: 700; color: #2A1B15;">Total Paid</td>
                  <td align="right" style="padding: 12px 0; font-weight: 700; color: #2A1B15; font-size: 18px;">${formattedTotal}</td>
                </tr>
              </table>

              <!-- Delivery Destination Box -->
              <div style="background-color: #FAF8F4; border: 1px solid #EBE7DF; border-radius: 4px; padding: 18px; margin: 24px 0;">
                <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; color: #7C3F1D; font-weight: 700; display: block; margin-bottom: 6px;">
                  Delivery Destination
                </span>
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #2A1B15;">
                  <strong>${order.customer.fullName}</strong> (${order.customer.phone})<br />
                  ${order.customer.address}, ${order.customer.city}, ${order.customer.state}<br />
                  <span style="color: #7A7265; font-size: 12px;">Expected Dispatch: ${order.deliveryExpectation}</span>
                </p>
              </div>

              <!-- Action Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${receiptUrl}" style="background-color: #2A1B15; color: #FAF8F4; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.18em; border-radius: 2px; display: inline-block;">
                      View Official Receipt
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; line-height: 1.5; color: #7A7265; text-align: center; margin: 20px 0 0 0;">
                Have a question or custom request? Chat directly with our team on
                <a href="https://wa.me/${cleanPhone}" style="color: #7C3F1D; text-decoration: underline;">WhatsApp (+${cleanPhone})</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F1E9; padding: 20px 24px; text-align: center; border-top: 1px solid #E8E3D8; font-size: 11px; color: #8F8475;">
              NOVEQ · Handcrafted in Lagos, Nigeria · All Rights Reserved.<br />
              <a href="${SITE_URL}" style="color: #5B4033; text-decoration: underline; margin-top: 4px; display: inline-block;">noveq.com.ng</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate internal alert email for founding team
 */
export function generateAdminOrderAlertHtml(order: Order): string {
  const itemsText = order.items
    .map((item) => `• ${item.product.name} (${item.selectedSize}, ${item.selectedColour || item.product.colour}) x${item.quantity}`)
    .join('<br />');

  const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');

  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; color: #111; padding: 20px;">
  <h2 style="color: #7C3F1D; margin: 0 0 10px 0;">🚨 New Verified NOVEQ Order: ${order.id}</h2>
  <p><strong>Customer:</strong> ${order.customer.fullName} (<a href="tel:${order.customer.phone}">${order.customer.phone}</a>)</p>
  <p><strong>Email:</strong> <a href="mailto:${order.customer.email}">${order.customer.email}</a></p>
  <p><strong>Delivery Destination:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.state}</p>
  ${order.customer.deliveryNotes ? `<p><strong>Delivery Note:</strong> <em>${order.customer.deliveryNotes}</em></p>` : ''}
  <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
  <p><strong>Items:</strong><br />${itemsText}</p>
  <p><strong>Total Paid:</strong> ₦${order.total.toLocaleString()} (Verified via Paystack)</p>
  <p><strong>Reference:</strong> <code>${order.payment?.reference || 'N/A'}</code></p>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
  <p>
    <a href="https://wa.me/${cleanPhone}" style="background: #25D366; color: white; padding: 10px 18px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
      Message Customer on WhatsApp
    </a>
  </p>
</body>
</html>
  `.trim();
}

/**
 * Send order confirmation emails via available providers (Resend API or Google Apps Script Webhook forwarding)
 */
export async function sendOrderEmails(order: Order): Promise<{ customerSent: boolean; adminSent: boolean; method: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. Direct Resend API if configured
  if (resendApiKey) {
    try {
      const customerHtml = generateCustomerReceiptHtml(order);
      const adminHtml = generateAdminOrderAlertHtml(order);

      const customerPromise = fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'NOVEQ <orders@noveq.com.ng>',
          to: [order.customer.email],
          subject: `Order Confirmed: ${order.id} | NOVEQ Drop 001`,
          html: customerHtml,
        }),
      });

      const adminPromise = fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'NOVEQ System <orders@noveq.com.ng>',
          to: [BRAND_EMAIL],
          subject: `🚨 [New Order] ${order.id} - ${order.customer.fullName} (₦${order.total.toLocaleString()})`,
          html: adminHtml,
        }),
      });

      await Promise.allSettled([customerPromise, adminPromise]);
      return { customerSent: true, adminSent: true, method: 'resend' };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[EmailService] Resend dispatch failed:', err);
    }
  }

  // Fallback: Google Apps Script Webhook automatically handles customer & brand notification
  return { customerSent: false, adminSent: false, method: 'apps_script_queued' };
}
