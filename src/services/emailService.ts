import { Order } from '@/types/commerce';
import { SITE_SETTINGS } from '@/config/siteSettings';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.noveq.com.ng';
const BRAND_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'noveqthebrand@gmail.com';

/**
 * NOVEQ Customer Receipt — "The Studio Letter"
 * Design: Receipt-as-Artifact (A) + Founder Note voice (C)
 * - 472px editorial width, bone card with 1px ink border, no dark header bar
 * - NOVEQ wordmark in Georgia on bone, wide tracking, ruled separators
 * - Founder-voice copy: human, specific, first-person, zero AI slop
 * - Sparse ruled item lines, plain-text CTA link, sign-off from the team
 * - No cross-sell block (move to a separate post-purchase flow)
 * - Zero emojis, zero jargon, zero filler
 */
export function generateCustomerReceiptHtml(order: Order): string {
  const firstName = order.customer.fullName.split(' ')[0] || order.customer.fullName;
  const receiptUrl = `${SITE_URL}/order-confirmation/${order.id}/receipt`;
  const cleanPhone = SITE_SETTINGS.supportContact.phone;

  // Sparse ruled line items — no table headers, just clean product lines
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #E8E4DC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <span style="color: #1A1615; font-size: 14px; font-weight: 600; display: block; letter-spacing: 0.01em;">${item.product.name}</span>
          <span style="color: #8F877D; font-size: 12px; display: block; margin-top: 3px; letter-spacing: 0.02em;">
            Size ${item.selectedSize}&nbsp;&nbsp;·&nbsp;&nbsp;${item.selectedColour || item.product.colour}${item.quantity > 1 ? `&nbsp;&nbsp;·&nbsp;&nbsp;Qty ${item.quantity}` : ''}${item.withHeartCharm ? '&nbsp;&nbsp;·&nbsp;&nbsp;Heart Charm' : ''}
          </span>
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid #E8E4DC; text-align: right; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #1A1615; font-size: 14px; font-weight: 500;">&#8358;${(item.product.price * item.quantity).toLocaleString()}</span>
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
  <title>Order confirmed &mdash; NOVEQ</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #F0EDE8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1615; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F0EDE8; padding: 48px 16px;">
    <tr>
      <td align="center">

        <!-- Outer card: bone white, ruled ink border, no radius, 472px -->
        <table role="presentation" width="100%" style="max-width: 472px; background-color: #FAFAF8; border: 1px solid #1A1615;">

          <!-- WORDMARK HEADER: bone on bone, no dark bar -->
          <tr>
            <td style="padding: 36px 32px 0 32px; text-align: center;">
              <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 400; letter-spacing: 0.36em; color: #1A1615; text-transform: uppercase; display: block; text-indent: 0.36em;">
                NOVEQ
              </span>
              <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.28em; color: #A89F91; margin-top: 7px; display: block; text-indent: 0.28em;">
                Lagos &middot; Drop 001
              </span>
              <!-- Wordmark rule -->
              <div style="border-top: 1px solid #1A1615; margin: 24px 0 0 0;"></div>
            </td>
          </tr>

          <!-- ORDER ID BADGE -->
          <tr>
            <td style="padding: 18px 32px 0 32px;">
              <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.22em; color: #8F877D; display: block;">
                Order &nbsp;${order.id}
              </span>
            </td>
          </tr>

          <!-- FOUNDER-VOICE GREETING -->
          <tr>
            <td style="padding: 14px 32px 0 32px;">
              <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 400; font-style: italic; color: #1A1615; margin: 0; line-height: 1.35; letter-spacing: -0.01em;">
                ${firstName}, your pair just moved<br />to the top of the list.
              </h1>
            </td>
          </tr>

          <!-- FOUNDER NOTE BODY -->
          <tr>
            <td style="padding: 18px 32px 0 32px;">
              <p style="font-size: 13px; line-height: 1.75; color: #635B54; margin: 0;">
                We made around 40 pairs for Drop 001. Yours is one of them. Each piece is built by hand at our workshop here in Lagos, so it takes a few days &mdash; but we do not rush anything that goes on your feet.
              </p>
            </td>
          </tr>

          <!-- SECTION RULE -->
          <tr>
            <td style="padding: 28px 32px 0 32px;">
              <div style="border-top: 1px solid #1A1615;"></div>
              <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.22em; color: #8F877D; display: block; margin-top: 14px;">
                What you ordered
              </span>
            </td>
          </tr>

          <!-- SPARSE ITEM LINES -->
          <tr>
            <td style="padding: 6px 32px 0 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- TOTALS -->
          <tr>
            <td style="padding: 0 32px 0 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${order.deliveryFee > 0 ? `
                <tr>
                  <td style="padding: 10px 0 4px 0; font-size: 12px; color: #8F877D;">Delivery</td>
                  <td align="right" style="padding: 10px 0 4px 0; font-size: 12px; color: #8F877D;">&#8358;${order.deliveryFee.toLocaleString()}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 10px 0 16px 0; font-size: 14px; font-weight: 600; color: #1A1615; border-top: 1px solid #E8E4DC;">Total paid</td>
                  <td align="right" style="padding: 10px 0 16px 0; font-size: 14px; font-weight: 600; color: #1A1615; border-top: 1px solid #E8E4DC;">&#8358;${order.total.toLocaleString()}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SECTION RULE: DELIVERY -->
          <tr>
            <td style="padding: 0 32px 0 32px;">
              <div style="border-top: 1px solid #1A1615;"></div>
              <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.22em; color: #8F877D; display: block; margin-top: 14px;">
                Delivering to
              </span>
              <p style="font-size: 13px; line-height: 1.65; color: #1A1615; margin: 8px 0 0 0;">
                <strong style="font-weight: 600;">${order.customer.fullName}</strong><br />
                ${order.customer.address}<br />
                ${order.customer.city}, ${order.customer.state}<br />
                <span style="color: #8F877D;">${order.customer.phone}</span>
              </p>
              ${order.customer.deliveryNotes ? `<p style="font-size: 12px; color: #8F877D; margin: 8px 0 0 0; font-style: italic;">&ldquo;${order.customer.deliveryNotes}&rdquo;</p>` : ''}
            </td>
          </tr>

          <!-- PLAIN-TEXT CTA (no button) -->
          <tr>
            <td style="padding: 28px 32px 0 32px;">
              <div style="border-top: 1px solid #E8E4DC;"></div>
              <p style="font-size: 12px; color: #635B54; margin: 20px 0 0 0; line-height: 1.65;">
                You can view your full digital receipt here &mdash;
                <a href="${receiptUrl}" style="color: #7C3F1D; text-decoration: underline; font-weight: 600;">View receipt</a>
              </p>
              <p style="font-size: 12px; color: #635B54; margin: 10px 0 0 0; line-height: 1.65;">
                Any questions, or need to update your delivery details?
                Message us on <a href="https://wa.me/${cleanPhone}" style="color: #7C3F1D; text-decoration: underline; font-weight: 600;">WhatsApp</a>.
                We respond quickly.
              </p>
            </td>
          </tr>

          <!-- SIGN-OFF -->
          <tr>
            <td style="padding: 24px 32px 36px 32px;">
              <p style="font-size: 13px; line-height: 1.65; color: #1A1615; margin: 0;">
                &mdash; The NOVEQ Team
              </p>
            </td>
          </tr>

          <!-- FOOTER RULE + FOOTER -->
          <tr>
            <td style="border-top: 1px solid #1A1615; padding: 18px 32px; text-align: center;">
              <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.24em; color: #A89F91; text-indent: 0.24em; display: block;">
                NOVEQ &nbsp;&middot;&nbsp; Handcrafted in Lagos, Nigeria &nbsp;&middot;&nbsp;
                <a href="${SITE_URL}" style="color: #A89F91; text-decoration: none;">noveq.com.ng</a>
              </span>
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
