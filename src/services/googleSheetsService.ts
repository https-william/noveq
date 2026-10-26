import { Order } from '@/types/commerce';
import { generateCustomerReceiptHtml, generateAdminOrderAlertHtml } from '@/services/emailService';

export const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxcQXNnv9doCYG96BpFJb1LMcMvqz-rI7TEqWAEs4DKq75-F2ZVsJID-_1a7BrUqlDk/exec';

export interface GoogleSheetsSyncResult {
  success: boolean;
  status: number;
  message: string;
  orderNo?: string;
  data?: unknown;
}

/**
 * Format order into Google Sheets payload matching the Orders tab
 */
function formatOrderPayload(order: Order) {
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const fullAddress = [order.customer.address, order.customer.city, order.customer.state]
    .filter(Boolean)
    .join(', ');

  return {
    orderNo: order.id,
    orderId: order.id,
    dateReceived: dateStr,
    createdAt: order.createdAt,
    customerName: order.customer.fullName,
    customer: {
      fullName: order.customer.fullName,
      phone: order.customer.phone,
      email: order.customer.email,
      address: order.customer.address,
      city: order.customer.city,
      state: order.customer.state,
      deliveryNotes: order.customer.deliveryNotes,
    },
    phone: order.customer.phone,
    address: fullAddress,
    items: order.items.map((item) => ({
      name: item.product.name,
      selectedColour: item.selectedColour || item.product.colour,
      colour: item.selectedColour || item.product.colour,
      selectedSize: item.selectedSize.replace(/^EU\s*/i, ''),
      size: item.selectedSize.replace(/^EU\s*/i, ''),
      quantity: item.quantity,
      price: item.product.price,
    })),
    total: order.total,
    orderStatus: order.status === 'paid' ? 'Paid' : 'New',
    status: order.status,
    paymentStatus: order.payment.status,
    payment: {
      provider: order.payment.provider,
      status: order.payment.status,
      reference: order.payment.reference,
    },
    // Automatic email notifications for Google Apps Script
    sendNotificationEmails: true,
    recipientEmail: order.customer.email,
    emailSubject: `Order Confirmed: ${order.id} | NOVEQ Drop 001`,
    customerHtml: generateCustomerReceiptHtml(order),
    adminHtml: generateAdminOrderAlertHtml(order),
  };
}

/**
 * Real-time order sync to Google Sheets
 */
export async function syncOrderToGoogleSheets(
  order: Order,
  customWebhookUrl?: string
): Promise<GoogleSheetsSyncResult> {
  const webhookUrl =
    customWebhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      success: false,
      status: 0,
      message: 'No Google Sheets webhook URL configured.',
    };
  }

  try {
    const payload = formatOrderPayload(order);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const rawText = await response.text();
    let json: { status?: string; message?: string } | null = null;
    try {
      json = JSON.parse(rawText);
    } catch {
      // not JSON
    }

    if (json && json.status === 'error') {
      console.warn(`[Google Sheets Sync] Webhook rejected order ${order.id}:`, json.message);
      return {
        success: false,
        status: response.status,
        message: json.message || 'Webhook returned error status.',
        data: json,
      };
    }

    if (response.ok) {
      console.info(`[Google Sheets Sync] Order ${order.id} appended to Google Sheet successfully.`);
      return {
        success: true,
        status: response.status,
        message: json?.message || `Order ${order.id} synced successfully.`,
        orderNo: order.id,
        data: json,
      };
    }

    return {
      success: false,
      status: response.status,
      message: `HTTP ${response.status}: ${rawText.slice(0, 120)}`,
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('[Google Sheets Sync Error]:', errMessage);
    return {
      success: false,
      status: 0,
      message: errMessage,
    };
  }
}

/**
 * Ping test to verify Google Sheets Webhook availability and health
 */
export async function testGoogleSheetsWebhook(customWebhookUrl?: string): Promise<{
  success: boolean;
  status: number;
  message: string;
  data?: unknown;
}> {
  const webhookUrl =
    customWebhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      success: false,
      status: 0,
      message: 'No Google Sheets webhook URL configured.',
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'ping', test: true }),
      redirect: 'follow',
    });

    const rawText = await response.text();
    let json: { status?: string; message?: string } | null = null;
    try {
      json = JSON.parse(rawText);
    } catch {
      // not JSON
    }

    if (json && json.status === 'error') {
      return {
        success: false,
        status: response.status,
        message: json.message || 'Apps Script returned an internal error.',
        data: json,
      };
    }

    if (response.ok) {
      return {
        success: true,
        status: response.status,
        message: json?.message || 'Webhook connection verified successfully.',
        data: json,
      };
    }

    return {
      success: false,
      status: response.status,
      message: `HTTP ${response.status}: ${rawText.slice(0, 150)}`,
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      status: 0,
      message: `Network connection failed: ${errMessage}`,
    };
  }
}
