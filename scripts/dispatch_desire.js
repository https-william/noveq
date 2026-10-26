const fs = require('fs');

const webhookUrl = 'https://script.google.com/macros/s/AKfycbxcQXNnv9doCYG96BpFJb1LMcMvqz-rI7TEqWAEs4DKq75-F2ZVsJID-_1a7BrUqlDk/exec';
const orders = JSON.parse(fs.readFileSync('data/orders.json', 'utf8'));
const order = orders.find(o => o.id === 'NVQ-2026-18217');

const SITE_URL = 'https://www.noveq.com.ng';
const firstName = 'Desire';
const formattedTotal = '₦20,000';
const receiptUrl = `${SITE_URL}/order-confirmation/${order.id}/receipt`;

const customerHtml = `
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
                  <tr style="border-bottom: 1px solid #EAE6DE;">
                    <td style="padding: 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <strong style="color: #1A1615; font-size: 15px; font-weight: 600; display: block; margin-bottom: 4px;">The Weave Slide Pam</strong>
                      <span style="color: #635B54; font-size: 13px;">Size: EU 39 · Colour: Black</span>
                    </td>
                    <td style="padding: 16px 0; text-align: center; color: #635B54; font-size: 14px;">
                      x1
                    </td>
                    <td style="padding: 16px 0; text-align: right; color: #1A1615; font-weight: 600; font-size: 15px;">
                      ₦20,000
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 4px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #8F877D;">Subtotal</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #1A1615; font-weight: 500;">₦20,000</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #8F877D;">Delivery</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #1A1615;">
                    Included / Courier
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
                  <strong>Desire Aigbe</strong> (+2348163221852)<br />
                  Covenant University / Lagos Delivery, Ota / Lagos, Ogun / Lagos
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
                <a href="https://wa.me/2349038555997" style="color: #7C3F1D; font-weight: 600; text-decoration: underline;">WhatsApp (+234 903 855 5997)</a>.
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

async function dispatch() {
  const payload = {
    action: 'send_email',
    recipientEmail: order.customer.email,
    to: order.customer.email,
    customerName: order.customer.fullName,
    emailSubject: `Your NOVEQ order is confirmed (${order.id})`,
    subject: `Your NOVEQ order is confirmed (${order.id})`,
    customerHtml: customerHtml,
    htmlBody: customerHtml
  };

  console.log('Dispatching clean, emoji-free order confirmation to:', order.customer.email);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.text();
  console.log('Result:', data);
}

dispatch();
