import { Order } from '@/types/commerce';
import { SITE_SETTINGS } from '@/config/siteSettings';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.noveq.com.ng';
const BRAND_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'noveqthebrand@gmail.com';

/**
 * Generate plain-English, warm customer receipt and welcome email
 * Strictly adheres to /clarity: zero jargon, warm, grounded, and human
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
          <strong style="color: #2A1B15; font-size: 15px; display: block;">${item.product.name}</strong>
          <span style="color: #7A7265; font-size: 13px;">Size: ${item.selectedSize} · Colour: ${item.selectedColour || item.product.colour}</span>
          ${item.withHeartCharm ? `<div style="color: #7C3F1D; font-size: 12px; margin-top: 4px;">+ Heart Charm Attached</div>` : ''}
        </td>
        <td style="padding: 14px 0; text-align: center; color: #5B4033; font-size: 14px;">
          x${item.quantity}
        </td>
        <td style="padding: 14px 0; text-align: right; color: #2A1B15; font-weight: 700; font-size: 15px;">
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
<body style="margin: 0; padding: 0; background-color: #FAF8F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2A1B15; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F4; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E8E3D8; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(42, 27, 21, 0.04);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2A1B15; padding: 28px 24px; text-align: center;">
              <span style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; letter-spacing: 0.15em; color: #FAF8F4; text-transform: uppercase; display: block;">
                NOVEQ
              </span>
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #BAAA9E; margin-top: 4px; display: block;">
                Handcrafted Leather Footwear · Lagos
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px 20px 28px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #2A1B15; margin: 0 0 14px 0;">
                Thank you for your order, ${firstName}.
              </h1>
              
              <p style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 20px 0;">
                Your pair is confirmed and currently in line at our Lagos workshop. We make each piece by hand with soft leather designed for everyday comfort.
              </p>

              <!-- Order Summary Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0 16px 0; border-top: 2px solid #2A1B15;">
                <thead>
                  <tr style="border-bottom: 1px solid #EBE7DF; text-transform: uppercase; font-size: 10px; letter-spacing: 0.15em; color: #7A7265;">
                    <th align="left" style="padding: 10px 0;">Your Pair</th>
                    <th align="center" style="padding: 10px 0;">Quantity</th>
                    <th align="right" style="padding: 10px 0;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 6px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #7A7265;">Subtotal</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #2A1B15; font-weight: 600;">₦${order.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #7A7265;">Delivery Fee</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #2A1B15;">
                    ${order.deliveryFee > 0 ? `₦${order.deliveryFee.toLocaleString()}` : 'Pay directly to rider on arrival'}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #2A1B15; font-size: 16px;">
                  <td style="padding: 12px 0; font-weight: 700; color: #2A1B15;">Total Paid</td>
                  <td align="right" style="padding: 12px 0; font-weight: 700; color: #2A1B15; font-size: 17px;">${formattedTotal}</td>
                </tr>
              </table>

              <!-- Delivery Destination Box -->
              <div style="background-color: #FAF8F4; border: 1px solid #EBE7DF; border-radius: 4px; padding: 16px; margin: 22px 0;">
                <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #7C3F1D; font-weight: 700; display: block; margin-bottom: 4px;">
                  Delivery Information
                </span>
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #2A1B15;">
                  <strong>${order.customer.fullName}</strong> (${order.customer.phone})<br />
                  ${order.customer.address}, ${order.customer.city}, ${order.customer.state}
                </p>
              </div>

              <!-- Button to view online receipt -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${receiptUrl}" style="background-color: #2A1B15; color: #FAF8F4; padding: 13px 26px; text-decoration: none; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; border-radius: 2px; display: inline-block;">
                      View Your Official Receipt
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Cross-Sell / Other Pieces from Drop 001 -->
              <div style="border-top: 1px dashed #D6CFC4; margin-top: 28px; padding-top: 24px;">
                <h3 style="font-size: 15px; font-weight: 700; color: #2A1B15; margin: 0 0 8px 0; text-align: center;">
                  Explore More From Drop 001
                </h3>
                <p style="font-size: 13px; color: #7A7265; line-height: 1.5; text-align: center; margin: 0 0 16px 0;">
                  Each piece in our first drop has its own character. If you ever want another pair or want to get one for a friend:
                </p>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                  <tr>
                    <td style="padding: 8px; width: 33%; vertical-align: top; text-align: center; background: #FAF8F4; border-radius: 4px;">
                      <strong style="font-size: 12px; color: #2A1B15; display: block;">The Weave</strong>
                      <span style="font-size: 11px; color: #7A7265; display: block; margin: 4px 0;">Hand-braided leather straps for easy everyday styling.</span>
                      <a href="${SITE_URL}/shop/the-weave-slide-pam" style="color: #7C3F1D; font-size: 11px; font-weight: 600; text-decoration: underline;">View Pair</a>
                    </td>
                    <td style="width: 8px;"></td>
                    <td style="padding: 8px; width: 33%; vertical-align: top; text-align: center; background: #FAF8F4; border-radius: 4px;">
                      <strong style="font-size: 12px; color: #2A1B15; display: block;">The Ring</strong>
                      <span style="font-size: 11px; color: #7A7265; display: block; margin: 4px 0;">Clean wide strap anchored by a solid brass ring.</span>
                      <a href="${SITE_URL}/shop/the-ring-slide-pam" style="color: #7C3F1D; font-size: 11px; font-weight: 600; text-decoration: underline;">View Pair</a>
                    </td>
                    <td style="width: 8px;"></td>
                    <td style="padding: 8px; width: 33%; vertical-align: top; text-align: center; background: #FAF8F4; border-radius: 4px;">
                      <strong style="font-size: 12px; color: #2A1B15; display: block;">The Twist</strong>
                      <span style="font-size: 11px; color: #7A7265; display: block; margin: 4px 0;">A smooth crossover strap that hugs your foot cleanly.</span>
                      <a href="${SITE_URL}/shop/the-twist-slide-pam" style="color: #7C3F1D; font-size: 11px; font-weight: 600; text-decoration: underline;">View Pair</a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Personal Support Note -->
              <p style="font-size: 12px; line-height: 1.5; color: #7A7265; text-align: center; margin: 24px 0 0 0;">
                If you have any questions or want to update your delivery address, talk to us directly on 
                <a href="https://wa.me/${cleanPhone}" style="color: #7C3F1D; font-weight: 600; text-decoration: underline;">WhatsApp (+${cleanPhone})</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F1E9; padding: 18px 24px; text-align: center; border-top: 1px solid #E8E3D8; font-size: 11px; color: #8F8475;">
              NOVEQ · Handcrafted in Lagos, Nigeria.<br />
              <a href="${SITE_URL}" style="color: #5B4033; text-decoration: underline; margin-top: 3px; display: inline-block;">noveq.com.ng</a>
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
 * Generate cheeky email to founder/CEO Emmanuel Isibor
 * Pure humor and camaraderie, zero financial jargon, zero transfer talk
 */
export function generateFounderCheekyEmailHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAF8F4; padding: 24px; color: #2A1B15;">
  <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E8E3D8; border-radius: 6px; padding: 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
    <span style="font-size: 28px; display: block; margin-bottom: 8px;">🌚</span>
    <h2 style="color: #2A1B15; font-size: 20px; margin: 0 0 14px 0;">Executive Memo: High-Priority Check-In for the CEO</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 14px 0;">
      Good day Mr. CEO,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 14px 0;">
      This is a quick operational check-in from the tech and logistics desk to make sure you are drinking enough cold water and not spending your entire afternoon staring passionately at leather swatches.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 14px 0;">
      Everything on our end is running smoothly:
    </p>
    <ul style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 16px 20px; padding: 0;">
      <li>Drop 001 orders are accounted for and synced.</li>
      <li>The website is humming, the database is intact, and the sheets are in real-time order.</li>
      <li>The Lagos workshop is actively turning out clean pairs.</li>
    </ul>
    <div style="background: #FAF8F4; border-left: 3px solid #7C3F1D; padding: 14px 16px; margin: 18px 0; font-size: 13px; color: #2A1B15; border-radius: 0 4px 4px 0;">
      <strong>Your Official CEO Responsibilities for Today:</strong><br />
      1. Step out in your freshest pair of NOVEQ slippers.<br />
      2. When anyone asks about the company strategy, take a sip of water, look into the middle distance, and say: <em>"We let the footwear do the talking."</em><br />
      3. Smile and act like every single thing that worked was 100% according to your master plan.
    </div>
    <p style="font-size: 13px; color: #7A7265; margin: 18px 0 0 0; line-height: 1.5;">
      Keep building, boss.<br /><br />
      <strong>NOVEQ Tech & Operations Desk</strong>
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatch emails via Resend or queued for Google Apps Script Webhook
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
          subject: `Your NOVEQ Order is Confirmed (${order.id})`,
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
          subject: `Your NOVEQ Order is Confirmed (${order.id})`,
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
