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
              <h1 style="font-size: 22px; font-weight: 700; color: #2A1B15; margin: 0 0 12px 0;">
                Thank you for your order, ${firstName}. You are now NOVEQ.
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 16px 0;">
                Your pair is confirmed and currently in line at our Lagos workshop.
              </p>
              
              <!-- What NOVEQ Means: 1 Sentence -->
              <div style="background-color: #FAF8F4; border-left: 3px solid #7C3F1D; padding: 14px 18px; margin: 16px 0; border-radius: 0 4px 4px 0;">
                <p style="font-size: 14px; font-weight: 600; color: #2A1B15; margin: 0; line-height: 1.5;">
                  To us, NOVEQ is simple: luxury isn't loud.
                </p>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 18px 0;">
                Your pair is confirmed and currently in line at our Lagos workshop.
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
                  <tr style="border-bottom: 1px solid #EBE7DF;">
                    <td style="padding: 14px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <strong style="color: #2A1B15; font-size: 15px; display: block;">The Weave Slide Pam</strong>
                      <span style="color: #7A7265; font-size: 13px;">Size: EU 39 · Colour: Black</span>
                    </td>
                    <td style="padding: 14px 0; text-align: center; color: #5B4033; font-size: 14px;">
                      x1
                    </td>
                    <td style="padding: 14px 0; text-align: right; color: #2A1B15; font-weight: 700; font-size: 15px;">
                      ₦20,000
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Totals -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 6px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #7A7265;">Subtotal</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #2A1B15; font-weight: 600;">₦20,000</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #7A7265;">Delivery Fee</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #2A1B15;">
                    Included / Direct courier delivery
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
                  <strong>Desire Aigbe</strong> (+2348163221852)<br />
                  Covenant University / Lagos Delivery, Ota / Lagos, Ogun / Lagos
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
                  Each piece in our first drop has its own character. If you ever want another pair or want to get a gift for someone special:
                </p>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                  <tr>
                    <td style="padding: 10px; width: 48%; vertical-align: top; text-align: center; background: #FAF8F4; border-radius: 4px;">
                      <strong style="font-size: 13px; color: #2A1B15; display: block;">The Ring Slide Pam</strong>
                      <span style="font-size: 11px; color: #7A7265; display: block; margin: 4px 0;">Clean wide leather strap anchored with a solid brass ring for an understated elevated look.</span>
                      <a href="${SITE_URL}/shop/the-ring-slide-pam" style="color: #7C3F1D; font-size: 11px; font-weight: 600; text-decoration: underline;">View The Ring</a>
                    </td>
                    <td style="width: 4%;"></td>
                    <td style="padding: 10px; width: 48%; vertical-align: top; text-align: center; background: #FAF8F4; border-radius: 4px;">
                      <strong style="font-size: 13px; color: #2A1B15; display: block;">The Twist Slide Pam</strong>
                      <span style="font-size: 11px; color: #7A7265; display: block; margin: 4px 0;">A smooth crossover leather strap that hugs your foot softly and looks effortless with everything.</span>
                      <a href="${SITE_URL}/shop/the-twist-slide-pam" style="color: #7C3F1D; font-size: 11px; font-weight: 600; text-decoration: underline;">View The Twist</a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Personal Support Note -->
              <p style="font-size: 12px; line-height: 1.5; color: #7A7265; text-align: center; margin: 24px 0 0 0;">
                If you have any questions or want to update your delivery address, reach us directly on 
                <a href="https://wa.me/2349038555997" style="color: #7C3F1D; font-weight: 600; text-decoration: underline;">WhatsApp (+234 903 855 5997)</a>.
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

async function dispatch() {
  const payload = {
    orderNo: order.id,
    orderId: order.id,
    customerName: order.customer.fullName,
    phone: order.customer.phone,
    recipientEmail: order.customer.email,
    address: `${order.customer.address}, ${order.customer.city}`,
    items: [{
      name: 'The Weave Slide Pam',
      selectedSize: 'EU 39',
      selectedColour: 'Black',
      quantity: 1
    }],
    total: 20000,
    status: 'Paid',
    reference: order.payment.reference,
    emailSubject: `Your NOVEQ Order is Confirmed (${order.id})`,
    subject: `Your NOVEQ Order is Confirmed (${order.id})`,
    customerHtml: customerHtml,
    htmlBody: customerHtml
  };

  console.log('Dispatching order confirmation & welcome email to:', order.customer.email);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.text();
  console.log('Result:', data);
}

dispatch();
