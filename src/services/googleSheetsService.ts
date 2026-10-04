import { Order } from '@/types/commerce';

const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxcQXNnv9doCYG96BpFJb1LMcMvqz-rI7TEqWAEs4DKq75-F2ZVsJID-_1a7BrUqlDk/exec';

/**
 * NOVEQ Google Sheets Real-Time Sync Service
 * 
 * Automatically sends newly verified orders to the brand Google Sheet.
 * Executes safely in the background with zero blocking impact on checkout speed.
 */
export async function syncOrderToGoogleSheets(order: Order): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const payload = {
      orderId: order.id,
      customer: {
        fullName: order.customer.fullName,
        phone: order.customer.phone,
        email: order.customer.email,
        address: order.customer.address,
        city: order.customer.city,
        state: order.customer.state,
        deliveryNotes: order.customer.deliveryNotes,
      },
      items: order.items.map((item) => ({
        name: item.product.name,
        selectedColour: item.selectedColour || item.product.colour,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        price: item.product.price,
      })),
      total: order.total,
      paymentStatus: order.payment.status,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (response.ok) {
      // eslint-disable-next-line no-console
      console.info(`[Google Sheets Sync] Order ${order.id} appended to Google Sheet successfully.`);
      return true;
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[Google Sheets Sync] Webhook responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Google Sheets Sync Error]:', error);
    return false;
  }
}
