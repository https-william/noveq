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

export interface SubscriberEmailPayload {
  email: string;
  source?: string;
  name?: string;
}

function formatRestockStyleName(source: string): string {
  const slug = source.replace(/^restock_/, '');
  if (slug.includes('twist')) return 'The Twist Slide Pam';
  if (slug.includes('ring')) return 'The Ring Slide Pam';
  return slug
    .split('-')
    .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : ''))
    .join(' ');
}

/**
 * Branded Subscriber Confirmation Letter
 * Follows NOVEQ's editorial visual identity ("The Studio Letter"),
 * Clarity plain-English copy, and Email Marketing Bible compliance rules:
 * - Single column 472px layout, explicit colors (dark-mode safe)
 * - Tailored by source (Nov 27 24-Hour Edit, Restock Waitlist, or General)
 * - Monitored Reply-To + 1-click Unsubscribe link + Lagos studio footer
 */
export function buildSubscriberConfirmationEmail({
  email,
  source = 'footer_newsletter',
  name,
}: SubscriberEmailPayload): { subject: string; html: string } {
  const firstName = name?.trim().split(' ')[0];
  const greetingLine = firstName ? `Hello ${firstName},` : 'Hello from Lagos,';
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email.trim().toLowerCase())}`;
  const cleanPhone = SITE_SETTINGS.supportContact.phone;

  const isNov27 = source === 'black_friday_2026';
  const isRestock = source.startsWith('restock_');
  const restockStyle = isRestock ? formatRestockStyleName(source) : '';

  if (isNov27) {
    const subject = 'Nov 27 reminder set — NOVEQ';
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${subject}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #1A1615; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F4F3EF; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1A1615; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 472px; background-color: #121212; border: 1px solid #B89B72;">
          <tr>
            <td style="padding: 36px 32px 0 32px; text-align: center;">
              <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 400; letter-spacing: 0.36em; color: #F4F3EF; text-transform: uppercase; display: block; text-indent: 0.36em;">
                NOVEQ
              </span>
              <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.26em; color: #B89B72; margin-top: 8px; display: block; text-indent: 0.26em;">
                Friday, November 27 &middot; 24 Hours Only
              </span>
              <div style="border-top: 1px solid #B89B72; margin: 24px 0 0 0;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px 0 32px;">
              <p style="font-size: 12px; color: #B89B72; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.16em;">
                ${greetingLine}
              </p>
              <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 400; color: #F4F3EF; margin: 0; line-height: 1.32;">
                Your November 27 reminder is saved.
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 18px 32px 0 32px;">
              <p style="font-size: 14px; line-height: 1.7; color: #CECBBE; margin: 0 0 14px 0;">
                For 24 hours on Friday, November 27 (midnight to 11:59 PM WAT), every available pair in the NOVEQ collection is 25% off.
              </p>
              <p style="font-size: 14px; line-height: 1.7; color: #CECBBE; margin: 0;">
                You will not need a code. The 25% reduction applies automatically at checkout. Courier delivery fees are excluded and stay at our standard zone rates.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 22px 32px 0 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1C1C1C; border: 1px solid #3A342B;">
                <tr>
                  <td style="padding: 16px 18px; font-size: 12px; line-height: 1.65; color: #CECBBE;">
                    <strong style="color: #F4F3EF; display: block; margin-bottom: 4px;">Example: The Weave Slide Pam</strong>
                    Regular price: &#8358;20,000<br />
                    Nov 27 price: <strong style="color: #B89B72;">&#8358;15,000</strong> (plus standard delivery)
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 26px 32px 0 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="background-color: #F4F3EF;">
                    <a href="${SITE_URL}/shop" style="display: inline-block; padding: 14px 28px; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #121212; text-decoration: none;">
                      Preview Pairs Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px 32px 32px;">
              <p style="font-size: 13px; line-height: 1.7; color: #CECBBE; margin: 0 0 14px 0;">
                Not sure which size to pick across EU 34 to EU 44? Hit reply to this email or write us on <a href="https://wa.me/${cleanPhone}" style="color: #B89B72; text-decoration: underline;">WhatsApp</a> before Friday and we will help you check.
              </p>
              <p style="font-size: 13px; color: #F4F3EF; margin: 0;">
                &mdash; The NOVEQ Team
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top: 1px solid #2E2A25; padding: 18px 32px; text-align: center; font-size: 10px; line-height: 1.7; color: #9C9488;">
              NOVEQ &middot; Handcrafted in Lagos, Nigeria &middot; <a href="${SITE_URL}" style="color: #9C9488; text-decoration: none;">noveq.com.ng</a><br />
              <a href="${unsubscribeUrl}" style="color: #B89B72; text-decoration: underline;">Unsubscribe from reminders</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
    return { subject, html };
  }

  const subject = isRestock
    ? `${restockStyle} restock alert — NOVEQ`
    : "You're on the NOVEQ list";

  const headline = isRestock
    ? `We saved your spot for ${restockStyle}.`
    : 'Thank you for joining the NOVEQ list.';

  const leadParagraph = isRestock
    ? `Our Lagos shoemakers build every pair by hand in small batches, so orders for ${restockStyle} are paused while fresh straps arrive. You are on the priority list and we will email you first the day pairs return to the bench.`
    : `We craft everyday women's leather slip-on pams by hand in Lagos, Nigeria — small runs cut from soft natural leather with cushioned soles across sizes EU 34 to EU 44.`;

  const secondParagraph = isRestock
    ? `If you need a pair sooner, The Weave Slide Pam is handcrafted to order and open right now (delivered within 7 business days nationwide).`
    : `We keep our emails rare and useful: you will hear from us when paused styles restock, when new drops open, and on November 27 for our 24-Hour Edit (25% off all pairs, delivery fees excluded).`;

  const ctaHref = isRestock
    ? `${SITE_URL}/shop/the-weave-slide-pam`
    : `${SITE_URL}/shop`;

  const ctaLabel = isRestock ? 'See The Weave (Open Now)' : 'Explore Available Pairs';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${subject}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #F0EDE8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1615; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F0EDE8; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 472px; background-color: #FAFAF8; border: 1px solid #1A1615;">
          <tr>
            <td style="padding: 36px 32px 0 32px; text-align: center;">
              <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 400; letter-spacing: 0.36em; color: #1A1615; text-transform: uppercase; display: block; text-indent: 0.36em;">
                NOVEQ
              </span>
              <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.28em; color: #8F877D; margin-top: 7px; display: block; text-indent: 0.28em;">
                Lagos, Nigeria &middot; Crafted to Move
              </span>
              <div style="border-top: 1px solid #1A1615; margin: 24px 0 0 0;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px 0 32px;">
              <p style="font-size: 12px; color: #7C3F1D; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 600;">
                ${greetingLine}
              </p>
              <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 21px; font-weight: 400; color: #1A1615; margin: 0; line-height: 1.35;">
                ${headline}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 18px 32px 0 32px;">
              <p style="font-size: 14px; line-height: 1.72; color: #4A433D; margin: 0 0 14px 0;">
                ${leadParagraph}
              </p>
              <p style="font-size: 14px; line-height: 1.72; color: #4A433D; margin: 0;">
                ${secondParagraph}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 26px 32px 0 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="background-color: #1A1615;">
                    <a href="${ctaHref}" style="display: inline-block; padding: 14px 28px; font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #FAFAF8; text-decoration: none;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px 32px 32px;">
              <div style="border-top: 1px solid #E8E4DC; margin-bottom: 20px;"></div>
              <p style="font-size: 13px; line-height: 1.7; color: #635B54; margin: 0 0 14px 0;">
                Quick question &mdash; what EU size do you wear most often? Hit reply anytime, or message us on <a href="https://wa.me/${cleanPhone}" style="color: #7C3F1D; text-decoration: underline; font-weight: 600;">WhatsApp</a>. We read every reply personally.
              </p>
              <p style="font-size: 13px; color: #1A1615; margin: 0;">
                &mdash; The NOVEQ Team
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top: 1px solid #1A1615; padding: 18px 32px; text-align: center; font-size: 10px; line-height: 1.7; color: #8F877D;">
              NOVEQ &middot; Handcrafted in Lagos, Nigeria &middot; <a href="${SITE_URL}" style="color: #8F877D; text-decoration: none;">noveq.com.ng</a><br />
              <a href="${unsubscribeUrl}" style="color: #7C3F1D; text-decoration: underline;">Unsubscribe anytime</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

export async function sendSubscriberConfirmationEmail(
  payload: SubscriberEmailPayload
): Promise<{ sent: boolean; method: string; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const cleanEmail = payload.email.trim().toLowerCase();
  const { subject, html } = buildSubscriberConfirmationEmail({
    ...payload,
    email: cleanEmail,
  });
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(cleanEmail)}`;

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'NOVEQ <hello@noveq.com.ng>',
          reply_to: BRAND_EMAIL,
          to: [cleanEmail],
          subject,
          html,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
          },
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        // eslint-disable-next-line no-console
        console.error('[EmailService] Subscriber email rejected:', res.status, errBody);
        return { sent: false, method: 'resend', error: errBody };
      }

      return { sent: true, method: 'resend' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Resend request error';
      // eslint-disable-next-line no-console
      console.error('[EmailService] Subscriber confirmation failed:', msg);
      return { sent: false, method: 'resend', error: msg };
    }
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_email',
          recipientEmail: cleanEmail,
          subject,
          htmlBody: html,
        }),
      });
      return { sent: res.ok, method: 'apps_script' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Webhook failed';
      return { sent: false, method: 'apps_script', error: msg };
    }
  }

  return { sent: false, method: 'none', error: 'No email provider configured' };
}

/**
 * Drafted Black Friday Campaign Email: "The 24-Hour Edit · November 27"
 * Redesigned via /taste-soft + /clarity + /email-marketing-bible:
 * - Editorial Luxury archetype: warm stone #F3EFE7 outer canvas, matte obsidian #111111 core
 * - Concentric Double-Bezel ("Doppelrand") hardware card + ledger shell (28px outer -> 20px inner)
 * - Logo-only media (noveq-logo.jpg, 17KB, seamless #111111 blend)
 * - Button-in-Button pill CTA with nested trailing icon circle + pill eyebrow badge
 * - Typography: Instrument Serif / Georgia + Plus Jakarta Sans (no Roboto/Arial/Helvetica)
 */
export function buildBlackFridayCampaignEmail(params: {
  recipientEmail: string;
  useLocalAssets?: boolean;
}): { subject: string; previewText: string; html: string } {
  const cleanEmail = params.recipientEmail.trim().toLowerCase();
  const assetOrigin = params.useLocalAssets ? '' : SITE_URL;
  const logoSrc = `${assetOrigin}/images/brand/noveq-logo.jpg`;
  const cleanPhone = SITE_SETTINGS.supportContact.phone;
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(cleanEmail)}`;

  const subject = 'Nov 27: 25% off NOVEQ pairs';
  const previewText =
    '24 hours only on Friday, November 27 (WAT). 25% off every available pair automatically at checkout, courier delivery excluded.';

  const serifStack = `'Instrument Serif', Georgia, 'Times New Roman', serif`;
  const sansStack = `'Plus Jakarta Sans', 'Geist', -apple-system, BlinkMacSystemFont, 'SF Pro Text', Georgia, serif`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${subject}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" />
</head>
<body style="margin: 0; padding: 0; background-color: #F3EFE7; font-family: ${sansStack}; color: #FAF7F0; -webkit-font-smoothing: antialiased;">
  <!-- Inbox Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Macro-Whitespace Outer Editorial Canvas -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F3EFE7; padding: 56px 16px;">
    <tr>
      <td align="center">

        <!-- DOUBLE-BEZEL OUTER SHELL (Machined Bronze Tray, 28px radius, soft ambient shadow) -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 504px; background-color: #201D19; border: 1px solid #352F27; border-radius: 28px; box-shadow: 0 24px 56px rgba(24, 20, 16, 0.14);">
          <tr>
            <td style="padding: 8px;">

              <!-- DOUBLE-BEZEL INNER CORE (Matte Obsidian Plaque, 20px concentric radius, seamless logo blend) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #111111; border: 1px solid #2C2721; border-radius: 20px;">

                <!-- Top Crown: Compact NOVEQ Logo Only (17KB, #111111 match) -->
                <tr>
                  <td style="padding: 36px 36px 20px 36px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left" valign="middle">
                          <a href="${SITE_URL}" style="text-decoration: none; display: inline-block;">
                            <img
                              src="${logoSrc}"
                              alt="NOVEQ"
                              width="96"
                              height="96"
                              style="display: block; width: 96px; height: 96px; border: 0; border-radius: 14px;"
                            />
                          </a>
                        </td>
                        <td align="right" valign="middle">
                          <!-- Microscopic Pill Eyebrow Badge -->
                          <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background-color: #1B1814; border: 1px solid #3A3227; font-size: 10px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #C9A97A;">
                            Nov 27 &middot; 24 Hours
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Editorial Display Headline -->
                <tr>
                  <td style="padding: 8px 36px 0 36px;">
                    <h1 style="font-family: ${serifStack}; font-size: 34px; font-weight: 400; color: #FAF7F0; margin: 0; line-height: 1.15; letter-spacing: -0.015em;">
                      One quiet day. 25% off every NOVEQ pair.
                    </h1>
                  </td>
                </tr>

                <!-- Plain-English Narrative (Generous Breathing Space) -->
                <tr>
                  <td style="padding: 20px 36px 0 36px;">
                    <p style="font-size: 15px; line-height: 1.75; color: #CFC7BA; margin: 0 0 14px 0;">
                      We make every slip-on by hand in Lagos to order, so our pricing stays steady all year.
                    </p>
                    <p style="font-size: 15px; line-height: 1.75; color: #CFC7BA; margin: 0;">
                      For twenty-four hours on Friday, November 27 (midnight to 11:59 PM WAT), all available pairs step down by 25% automatically at checkout.
                    </p>
                  </td>
                </tr>

                <!-- Nested Double-Bezel Ledger Tray -->
                <tr>
                  <td style="padding: 28px 36px 0 36px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1A1714; border: 1px solid #2E2922; border-radius: 20px;">
                      <tr>
                        <td style="padding: 5px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #141210; border: 1px solid #26221C; border-radius: 15px;">
                            <tr>
                              <td style="padding: 16px 20px 12px 20px; border-bottom: 1px solid #221E19; font-size: 13px; color: #9E9589;">
                                How it applies
                              </td>
                              <td align="right" style="padding: 16px 20px 12px 20px; border-bottom: 1px solid #221E19; font-size: 13px; color: #FAF7F0; font-weight: 500;">
                                Automatic in bag
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 20px; border-bottom: 1px solid #221E19; font-size: 13px; color: #9E9589;">
                                The Weave Slide Pam
                              </td>
                              <td align="right" style="padding: 12px 20px; border-bottom: 1px solid #221E19; font-size: 13px; color: #FAF7F0; font-weight: 500;">
                                <span style="color: #787066; text-decoration: line-through;">&#8358;20,000</span>&nbsp;&nbsp;<span style="color: #C9A97A; font-weight: 600;">&#8358;15,000</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 20px; border-bottom: 1px solid #221E19; font-size: 13px; color: #9E9589;">
                                Worldwide sizing
                              </td>
                              <td align="right" style="padding: 12px 20px; border-bottom: 1px solid #221E19; font-size: 13px; color: #FAF7F0; font-weight: 500;">
                                EU 34 to EU 44
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 20px 16px 20px; font-size: 13px; color: #9E9589;">
                                Courier delivery
                              </td>
                              <td align="right" style="padding: 12px 20px 16px 20px; font-size: 13px; color: #CFC7BA;">
                                Excluded (standard rate)
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Button-in-Button Nested Pill CTA -->
                <tr>
                  <td style="padding: 32px 36px 0 36px;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background-color: #FAF7F0; border-radius: 999px; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);">
                          <a
                            href="${SITE_URL}/shop"
                            style="display: inline-block; padding: 6px 6px 6px 22px; text-decoration: none; color: #111111;"
                          >
                            <table role="presentation" cellspacing="0" cellpadding="0">
                              <tr>
                                <td valign="middle" style="font-family: ${sansStack}; font-size: 13px; font-weight: 600; color: #111111; padding-right: 14px; letter-spacing: 0.01em;">
                                  See available pairs
                                </td>
                                <td align="center" valign="middle" width="34" height="34" style="width: 34px; height: 34px; border-radius: 999px; background-color: #E5DEC9; color: #111111; font-size: 14px; font-weight: 500; line-height: 34px;">
                                  &#8599;
                                </td>
                              </tr>
                            </table>
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Personal Sign-Off & Reply Prompt -->
                <tr>
                  <td style="padding: 28px 36px 36px 36px;">
                    <p style="font-size: 14px; line-height: 1.75; color: #9E9589; margin: 0 0 18px 0;">
                      Unsure of your size across EU 34 to 44 before Friday? Reply directly to this email or write us on <a href="https://wa.me/${cleanPhone}" style="color: #C9A97A; text-decoration: underline;">WhatsApp</a>.
                    </p>
                    <p style="font-family: ${serifStack}; font-size: 17px; color: #FAF7F0; margin: 0;">
                      The NOVEQ Team
                    </p>
                  </td>
                </tr>

                <!-- Compliance Footer -->
                <tr>
                  <td style="border-top: 1px solid #221E1A; padding: 22px 36px 26px 36px; font-size: 11px; line-height: 1.8; color: #787066;">
                    NOVEQ &middot; Handcrafted in Lagos, Nigeria &middot; <a href="${SITE_URL}" style="color: #9E9589; text-decoration: none;">noveq.com.ng</a><br />
                    Prefer not to hear about Black Friday? <a href="${unsubscribeUrl}" style="color: #C9A97A; text-decoration: underline;">Unsubscribe</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, previewText, html };
}

/**
 * Sends the Black Friday campaign email individually to each approved recipient.
 * Never invoked automatically; only call after explicit human approval ("send it").
 */
export async function sendBlackFridayCampaignEmail(
  recipients: string[]
): Promise<{
  total: number;
  sent: number;
  failed: number;
  results: Array<{ email: string; ok: boolean; error?: string }>;
}> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const results: Array<{ email: string; ok: boolean; error?: string }> = [];

  for (const rawEmail of recipients) {
    const cleanEmail = rawEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@')) continue;

    const { subject, html } = buildBlackFridayCampaignEmail({
      recipientEmail: cleanEmail,
      useLocalAssets: false,
    });
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(cleanEmail)}`;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'NOVEQ <hello@noveq.com.ng>',
          reply_to: BRAND_EMAIL,
          to: [cleanEmail],
          subject,
          html,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        results.push({ email: cleanEmail, ok: false, error: errText });
      } else {
        results.push({ email: cleanEmail, ok: true });
      }
    } catch (err) {
      results.push({
        email: cleanEmail,
        ok: false,
        error: err instanceof Error ? err.message : 'Request failed',
      });
    }
  }

  return {
    total: results.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}

function escapeEmailHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Branded Custom Note Composer for Admin Bot Studio & Telegram /email commands.
 * Uses the /taste-soft Double-Bezel obsidian plaque aesthetic, /clarity copy,
 * and automatic List-Unsubscribe + Lagos studio compliance footer.
 */
export function buildCustomBrandNoteEmail(params: {
  recipientEmail: string;
  subject: string;
  heading?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): { subject: string; html: string } {
  const cleanEmail = params.recipientEmail.trim().toLowerCase();
  const logoSrc = `${SITE_URL}/images/brand/noveq-logo.jpg`;
  const cleanPhone = SITE_SETTINGS.supportContact.phone;
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(cleanEmail)}`;

  const safeHeading = escapeEmailHtml(
    params.heading?.trim() || params.subject.trim()
  );
  const paragraphsHtml = params.body
    .trim()
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="font-size: 15px; line-height: 1.75; color: #CFC7BA; margin: 0 0 14px 0;">${escapeEmailHtml(
          p.trim()
        ).replace(/\n/g, '<br />')}</p>`
    )
    .join('');

  const ctaLabel = params.ctaLabel?.trim();
  const ctaUrl = params.ctaUrl?.trim();
  const serifStack = `'Instrument Serif', Georgia, 'Times New Roman', serif`;
  const sansStack = `'Plus Jakarta Sans', 'Geist', -apple-system, BlinkMacSystemFont, 'SF Pro Text', Georgia, serif`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeEmailHtml(params.subject)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #F3EFE7; font-family: ${sansStack}; color: #FAF7F0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F3EFE7; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 504px; background-color: #201D19; border: 1px solid #352F27; border-radius: 28px; box-shadow: 0 24px 56px rgba(24, 20, 16, 0.14);">
          <tr>
            <td style="padding: 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #111111; border: 1px solid #2C2721; border-radius: 20px;">
                <tr>
                  <td style="padding: 32px 36px 18px 36px;">
                    <a href="${SITE_URL}" style="text-decoration: none; display: inline-block;">
                      <img src="${logoSrc}" alt="NOVEQ" width="90" height="90" style="display: block; width: 90px; height: 90px; border: 0; border-radius: 12px;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 36px 0 36px;">
                    <h1 style="font-family: ${serifStack}; font-size: 28px; font-weight: 400; color: #FAF7F0; margin: 0; line-height: 1.2;">
                      ${safeHeading}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 36px 0 36px;">
                    ${paragraphsHtml}
                  </td>
                </tr>
                ${
                  ctaLabel && ctaUrl
                    ? `
                <tr>
                  <td style="padding: 18px 36px 0 36px;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background-color: #FAF7F0; border-radius: 999px;">
                          <a href="${escapeEmailHtml(ctaUrl)}" style="display: inline-block; padding: 12px 24px; font-size: 13px; font-weight: 600; color: #111111; text-decoration: none;">
                            ${escapeEmailHtml(ctaLabel)} &#8599;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 26px 36px 34px 36px;">
                    <p style="font-size: 13px; line-height: 1.7; color: #9E9589; margin: 0 0 16px 0;">
                      Questions? Reply directly to this email or write us on <a href="https://wa.me/${cleanPhone}" style="color: #C9A97A; text-decoration: underline;">WhatsApp</a>.
                    </p>
                    <p style="font-family: ${serifStack}; font-size: 16px; color: #FAF7F0; margin: 0;">
                      The NOVEQ Team
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #221E1A; padding: 20px 36px 24px 36px; font-size: 11px; line-height: 1.8; color: #787066;">
                    NOVEQ &middot; Handcrafted in Lagos, Nigeria &middot; <a href="${SITE_URL}" style="color: #9E9589; text-decoration: none;">noveq.com.ng</a><br />
                    <a href="${unsubscribeUrl}" style="color: #C9A97A; text-decoration: underline;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject: params.subject.trim(), html };
}

export async function sendCustomBrandEmails(params: {
  recipients: string[];
  subject: string;
  heading?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): Promise<{
  total: number;
  sent: number;
  skippedPlaceholders: number;
  failed: number;
  results: Array<{ email: string; ok: boolean; error?: string }>;
}> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  let skippedPlaceholders = 0;
  const cleanTargets: string[] = [];
  const seen = new Set<string>();

  for (const raw of params.recipients) {
    const clean = raw.trim().toLowerCase();
    if (!clean.includes('@') || seen.has(clean)) continue;
    seen.add(clean);
    if (clean.endsWith('@client.noveq.com.ng')) {
      skippedPlaceholders += 1;
      continue;
    }
    cleanTargets.push(clean);
  }

  const results: Array<{ email: string; ok: boolean; error?: string }> = [];

  for (const cleanEmail of cleanTargets) {
    const { subject, html } = buildCustomBrandNoteEmail({
      recipientEmail: cleanEmail,
      subject: params.subject,
      heading: params.heading,
      body: params.body,
      ctaLabel: params.ctaLabel,
      ctaUrl: params.ctaUrl,
    });
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(cleanEmail)}`;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'NOVEQ <hello@noveq.com.ng>',
          reply_to: BRAND_EMAIL,
          to: [cleanEmail],
          subject,
          html,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
          },
        }),
      });

      if (!res.ok) {
        results.push({ email: cleanEmail, ok: false, error: await res.text() });
      } else {
        results.push({ email: cleanEmail, ok: true });
      }
    } catch (err) {
      results.push({
        email: cleanEmail,
        ok: false,
        error: err instanceof Error ? err.message : 'Request failed',
      });
    }
  }

  return {
    total: cleanTargets.length,
    sent: results.filter((r) => r.ok).length,
    skippedPlaceholders,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}
