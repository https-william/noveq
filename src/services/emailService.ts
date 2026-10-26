import { Order } from '@/types/commerce';
import { SITE_SETTINGS } from '@/config/siteSettings';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.noveq.com.ng';
const BRAND_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'noveqthebrand@gmail.com';

/**
 * Generate plain-English, warm, understated customer receipt and welcome email
 * Strictly adheres to /design-genius, /ui-ux-ui-styling, /clarity, and /humanizer:
 * Zero jargon, zero emojis (prevents character encoding corruption), clean editorial luxury aesthetic
 */
export function generateCustomerReceiptHtml(order: Order): string {
  const firstName = order.customer.fullName.split(' ')[0] || order.customer.fullName;
  const formattedTotal = `₦${order.total.toLocaleString()}`;
  const receiptUrl = `${SITE_URL}/order-confirmation/${order.id}/receipt`;
  const cleanPhone = SITE_SETTINGS.supportContact.phone;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #EAE6DE;">
        <td style="padding: 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <strong style="color: #1A1615; font-size: 15px; font-weight: 600; display: block; margin-bottom: 4px;">${item.product.name}</strong>
          <span style="color: #635B54; font-size: 13px;">Size: ${item.selectedSize} · Colour: ${item.selectedColour || item.product.colour}</span>
          ${item.withHeartCharm ? `<div style="color: #7C3F1D; font-size: 12px; margin-top: 4px; font-weight: 500;">+ Heart Charm Attached</div>` : ''}
        </td>
        <td style="padding: 16px 0; text-align: center; color: #635B54; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          x${item.quantity}
        </td>
        <td style="padding: 16px 0; text-align: right; color: #1A1615; font-weight: 600; font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
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
  <title>Your NOVEQ Order is Confirmed</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #F7F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1615; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F5F0; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #EAE6DE; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 24px rgba(26, 22, 21, 0.04);">
          <!-- Minimalist Editorial Header -->
          <tr>
            <td style="background-color: #1A1615; padding: 32px 24px; text-align: center;">
              <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; letter-spacing: 0.22em; color: #F7F5F0; text-transform: uppercase; display: block;">
                NOVEQ
              </span>
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.24em; color: #A89F91; margin-top: 6px; display: block;">
                Handcrafted Leather Footwear · Lagos
              </span>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="font-size: 22px; font-weight: 600; color: #1A1615; margin: 0 0 14px 0; letter-spacing: -0.01em;">
                Thank you for your order, ${firstName}.
              </h1>
              
              <p style="font-size: 14px; line-height: 1.6; color: #635B54; margin: 0 0 24px 0;">
                Your pair is confirmed and currently in line at our Lagos workshop. We make each piece by hand with soft leather designed for everyday comfort.
              </p>

              <!-- Order Summary Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 20px 0; border-top: 1px solid #1A1615;">
                <thead>
                  <tr style="border-bottom: 1px solid #EAE6DE; text-transform: uppercase; font-size: 10px; letter-spacing: 0.16em; color: #8F877D;">
                    <th align="left" style="padding: 12px 0; font-weight: 600;">Your Pair</th>
                    <th align="center" style="padding: 12px 0; font-weight: 600;">Quantity</th>
                    <th align="right" style="padding: 12px 0; font-weight: 600;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 4px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #8F877D;">Subtotal</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #1A1615; font-weight: 500;">₦${order.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #8F877D;">Delivery</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #1A1615;">
                    ${order.deliveryFee > 0 ? `₦${order.deliveryFee.toLocaleString()}` : 'Included / Courier'}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #1A1615;">
                  <td style="padding: 14px 0 0 0; font-weight: 600; color: #1A1615; font-size: 15px;">Total Paid</td>
                  <td align="right" style="padding: 14px 0 0 0; font-weight: 600; color: #1A1615; font-size: 16px;">${formattedTotal}</td>
                </tr>
              </table>

              <!-- Delivery Destination Box -->
              <div style="background-color: #FAF8F5; border: 1px solid #EAE6DE; border-radius: 4px; padding: 16px 20px; margin: 26px 0;">
                <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #7C3F1D; font-weight: 700; display: block; margin-bottom: 6px;">
                  Delivery Destination
                </span>
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1A1615;">
                  <strong>${order.customer.fullName}</strong> (${order.customer.phone})<br />
                  ${order.customer.address}, ${order.customer.city}, ${order.customer.state}
                </p>
              </div>

              <!-- Button to view online receipt -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${receiptUrl}" style="background-color: #1A1615; color: #F7F5F0; padding: 14px 32px; text-decoration: none; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.16em; border-radius: 3px; display: inline-block;">
                      View Digital Receipt
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Cross-Sell / Other Pieces from Drop 001 -->
              <div style="border-top: 1px solid #EAE6DE; margin-top: 32px; padding-top: 26px;">
                <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; color: #1A1615; margin: 0 0 6px 0; text-align: center;">
                  Other Pieces From Drop 001
                </h3>
                <p style="font-size: 12px; color: #8F877D; line-height: 1.5; text-align: center; margin: 0 0 18px 0;">
                  Crafted with the same focus on comfort and quiet style:
                </p>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 14px; width: 48%; vertical-align: top; background: #FAF8F5; border: 1px solid #EAE6DE; border-radius: 4px;">
                      <strong style="font-size: 13px; color: #1A1615; display: block; margin-bottom: 4px;">The Ring Slide Pam</strong>
                      <span style="font-size: 11px; color: #635B54; line-height: 1.4; display: block; margin-bottom: 8px;">Clean wide leather strap anchored with a solid brass ring.</span>
                      <a href="${SITE_URL}/shop/the-ring-slide-pam" style="color: #7C3F1D; font-size: 11px; font-weight: 600; text-decoration: none;">View Pair &rarr;</a>
                    </td>
                    <td style="width: 4%;"></td>
                    <td style="padding: 14px; width: 48%; vertical-align: top; background: #FAF8F5; border: 1px solid #EAE6DE; border-radius: 4px;">
                      <strong style="font-size: 13px; color: #1A1615; display: block; margin-bottom: 4px;">The Twist Slide Pam</strong>
                      <span style="font-size: 11px; color: #635B54; line-height: 1.4; display: block; margin-bottom: 8px;">Smooth crossover leather strap that hugs your foot softly.</span>
                      <a href="${SITE_URL}/shop/the-twist-slide-pam" style="color: #7C3F1D; font-size: 11px; font-weight: 600; text-decoration: none;">View Pair &rarr;</a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Personal Support Note -->
              <p style="font-size: 12px; line-height: 1.6; color: #8F877D; text-align: center; margin: 28px 0 0 0;">
                If you have any questions about your pair or want to update your delivery details, message us directly on 
                <a href="https://wa.me/${cleanPhone}" style="color: #7C3F1D; font-weight: 600; text-decoration: underline;">WhatsApp (+${cleanPhone})</a>.
              </p>
            </td>
          </tr>

          <!-- Minimalist Footer -->
          <tr>
            <td style="background-color: #F7F5F0; padding: 20px 24px; text-align: center; border-top: 1px solid #EAE6DE; font-size: 11px; color: #8F877D;">
              NOVEQ · Handcrafted in Lagos, Nigeria.<br />
              <a href="${SITE_URL}" style="color: #635B54; text-decoration: underline; margin-top: 4px; display: inline-block;">noveq.com.ng</a>
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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1A1615; padding: 24px; background: #F7F5F0;">
  <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border: 1px solid #EAE6DE; border-radius: 6px; padding: 28px;">
    <div style="display: inline-block; background-color: #F0EAE1; color: #7C3F1D; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 12px;">Verified Order</div>
    <h2 style="color: #1A1615; margin: 0 0 14px 0; font-size: 18px;">New NOVEQ Order: ${order.id}</h2>
    <p style="font-size: 14px; margin: 4px 0;"><strong>Customer:</strong> ${order.customer.fullName} (<a href="tel:${order.customer.phone}" style="color: #7C3F1D;">${order.customer.phone}</a>)</p>
    <p style="font-size: 14px; margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${order.customer.email}" style="color: #7C3F1D;">${order.customer.email}</a></p>
    <p style="font-size: 14px; margin: 4px 0;"><strong>Delivery Destination:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.state}</p>
    ${order.customer.deliveryNotes ? `<p style="font-size: 13px; color: #635B54; margin: 6px 0;"><em>Delivery Note: ${order.customer.deliveryNotes}</em></p>` : ''}
    <hr style="border: 0; border-top: 1px solid #EAE6DE; margin: 16px 0;" />
    <p style="font-size: 14px; line-height: 1.5;"><strong>Items:</strong><br />${itemsText}</p>
    <p style="font-size: 14px; margin: 6px 0;"><strong>Total Paid:</strong> ₦${order.total.toLocaleString()} (Verified via Paystack)</p>
    <p style="font-size: 13px; color: #8F877D; margin: 4px 0;">Reference: <code>${order.payment?.reference || 'N/A'}</code></p>
    <hr style="border: 0; border-top: 1px solid #EAE6DE; margin: 16px 0;" />
    <p style="margin: 0;">
      <a href="https://wa.me/${cleanPhone}" style="background: #1A1615; color: #F7F5F0; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">
        Message Customer on WhatsApp
      </a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate cheeky email to founder/CEO Emmanuel Isibor
 * Clean, humorous founder banter. Zero emojis (prevents character encoding corruption).
 */
export function generateFounderCheekyEmailHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F5F0; padding: 32px 16px; color: #1A1615;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EAE6DE; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 20px rgba(26, 22, 21, 0.04);">
    <!-- Minimalist Header -->
    <div style="background-color: #1A1615; padding: 24px; text-align: center;">
      <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; letter-spacing: 0.22em; color: #F7F5F0; text-transform: uppercase; display: block;">
        NOVEQ
      </span>
      <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.22em; color: #A89F91; margin-top: 4px; display: block;">
        Executive Office · Internal Dispatch
      </span>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 28px;">
      <div style="display: inline-block; background-color: #F0EAE1; color: #7C3F1D; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px;">
        Internal Memo
      </div>

      <h2 style="color: #1A1615; font-size: 19px; font-weight: 600; margin: 0 0 16px 0; letter-spacing: -0.01em;">
        Operational Check-In for the CEO
      </h2>

      <p style="font-size: 14px; line-height: 1.6; color: #635B54; margin: 0 0 14px 0;">
        Good day Mr. CEO,
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #635B54; margin: 0 0 16px 0;">
        This is a quick operational check-in from the tech and logistics desk to make sure you are drinking enough cold water and not spending your entire afternoon staring passionately at leather swatches.
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #635B54; margin: 0 0 12px 0;">
        Everything on our end is running smoothly:
      </p>

      <ul style="font-size: 13px; line-height: 1.6; color: #635B54; margin: 0 0 20px 18px; padding: 0;">
        <li style="margin-bottom: 6px;">Drop 001 orders are accounted for, verified, and logged.</li>
        <li style="margin-bottom: 6px;">The website is humming, the database is intact, and the sheets are in real-time order.</li>
        <li style="margin-bottom: 6px;">The Lagos workshop is actively turning out clean pairs.</li>
      </ul>

      <div style="background-color: #FAF8F5; border-left: 3px solid #7C3F1D; padding: 16px 18px; margin: 20px 0; border-radius: 0 4px 4px 0;">
        <strong style="color: #1A1615; font-size: 13px; display: block; margin-bottom: 8px;">
          Your Official CEO Responsibilities for Today:
        </strong>
        <ol style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #635B54;">
          <li style="margin-bottom: 4px;">Step out in your freshest pair of NOVEQ slippers.</li>
          <li style="margin-bottom: 4px;">When anyone asks about company strategy, pause thoughtfully, take a sip of water, and say: <em>"We let the footwear do the talking."</em></li>
          <li>Smile and act like every single thing that worked was 100% according to your master plan.</li>
        </ol>
      </div>

      <p style="font-size: 13px; color: #8F877D; margin: 24px 0 0 0; line-height: 1.5;">
        Keep leading from the front, boss.<br /><br />
        <strong style="color: #1A1615;">NOVEQ Tech & Operations Desk</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #F7F5F0; padding: 16px 24px; text-align: center; border-top: 1px solid #EAE6DE; font-size: 11px; color: #8F877D;">
      NOVEQ Headquarters · Lagos, Nigeria<br />
      <a href="${SITE_URL}" style="color: #635B54; text-decoration: underline; margin-top: 3px; display: inline-block;">noveq.com.ng</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatch emails via Resend or Google Apps Script Webhook
 */
export async function sendOrderEmails(order: Order): Promise<{ customerSent: boolean; adminSent: boolean; method: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;

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
          subject: `Your NOVEQ order is confirmed (${order.id})`,
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
          subject: `[New Order] ${order.id} - ${order.customer.fullName} (₦${order.total.toLocaleString()})`,
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

  // Fallback: Direct dispatch via Google Apps Script Webhook
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const customerHtml = generateCustomerReceiptHtml(order);
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_email',
          recipientEmail: order.customer.email,
          subject: `Your NOVEQ order is confirmed (${order.id})`,
          htmlBody: customerHtml,
        }),
      });
      return { customerSent: res.ok, adminSent: res.ok, method: 'apps_script' };
    } catch (webhookErr) {
      // eslint-disable-next-line no-console
      console.error('[EmailService] Apps Script webhook dispatch failed:', webhookErr);
    }
  }

  return { customerSent: false, adminSent: false, method: 'none' };
}
